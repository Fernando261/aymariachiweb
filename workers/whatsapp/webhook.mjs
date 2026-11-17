const encoder = new TextEncoder();
const graphSendTimeoutMs = 20_000;
const testPhrase = 'prueba mariachi';
const reply = '¡Hola! Recibimos tu mensaje. La respuesta automática de ¡Ay! Mariachi Para Todos ya funciona.';

async function signatureIsValid(body, signature, secret) {
  if (!secret || !signature || !/^sha256=[a-f0-9]{64}$/i.test(signature)) return false;
  const bytes = Uint8Array.from(signature.slice(7).match(/../g), (hex) => parseInt(hex, 16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), {
    name: 'HMAC', hash: 'SHA-256',
  }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, bytes, body);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/webhooks/whatsapp') return new Response(null, { status: 404 });
    if (request.method === 'GET') {
      const { searchParams } = url;
      const challenge = searchParams.get('hub.challenge');
      if (searchParams.get('hub.mode') !== 'subscribe' || !challenge || !env.WA_VERIFY_TOKEN ||
          searchParams.get('hub.verify_token') !== env.WA_VERIFY_TOKEN) {
        return new Response(null, { status: 403 });
      }
      return new Response(challenge, { headers: { 'Cache-Control': 'no-store' } });
    }
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, POST' } });
    const body = await request.arrayBuffer();
    if (!await signatureIsValid(body, request.headers.get('X-Hub-Signature-256'), env.META_APP_SECRET)) {
      return new Response(null, { status: 401 });
    }

    let event;
    try {
      event = JSON.parse(new TextDecoder().decode(body));
    } catch {
      return new Response(null, { status: 400 });
    }
    if (event?.object !== 'whatsapp_business_account') {
      console.info('wa:ignored_non_whatsapp_event');
      return new Response('OK');
    }

    for (const entry of event.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (change.field !== 'messages') continue;
        if (!value?.messages?.length) {
          console.info(value?.statuses?.length ? 'wa:status_update' : 'wa:no_incoming_messages');
          continue;
        }
        if (!env.WA_PHONE_NUMBER_ID || value.metadata?.phone_number_id !== env.WA_PHONE_NUMBER_ID) {
          console.info('wa:phone_number_id_mismatch');
          continue;
        }
        for (const message of value.messages) {
          if (!message?.id || message.type !== 'text' ||
              message.text?.body?.trim().toLowerCase() !== testPhrase) {
            console.info('wa:test_message_mismatch');
            continue;
          }
          if (!env.WA_TEST_RECIPIENT || message.from !== env.WA_TEST_RECIPIENT) {
            console.info('wa:test_recipient_mismatch');
            continue;
          }
          const object = env.REPLIES.get(env.REPLIES.idFromName(message.id));
          const result = await object.fetch('https://internal/reply', {
            method: 'POST', body: message.from,
          });
          if (!result.ok) return new Response(null, { status: 503 });
        }
      }
    }
    return new Response('OK');
  },
};

export class ReplyOnce {
  constructor(state, env) {
    this.storage = state.storage;
    this.env = env;
  }

  async fetch(request) {
    const env = this.env;
    const replyTo = env.WA_TEST_REPLY_TO;
    if ((replyTo !== undefined && !/^[1-9]\d{6,14}$/.test(replyTo)) ||
        !env.WA_ACCESS_TOKEN || !/^v\d+\.\d+$/.test(env.WA_GRAPH_API_VERSION ?? '') ||
        !/^\d+$/.test(env.WA_PHONE_NUMBER_ID ?? '')) {
      console.error('wa:send_config_invalid');
      return new Response(null, { status: 503 });
    }
    const recipient = replyTo ?? await request.text();
    if (!(await this.storage.getAlarm())) {
      await this.storage.setAlarm(Date.now() + 8 * 24 * 60 * 60 * 1000);
    }
    const claimed = await this.storage.transaction(async (txn) => {
      if (await txn.get('claimed')) return false;
      await txn.put('claimed', true);
      return true;
    });
    if (!claimed) {
      console.info('wa:reply_already_claimed');
      return new Response(null, { status: 204 });
    }

    const startedAt = Date.now();
    const signal = AbortSignal.timeout(graphSendTimeoutMs);
    try {
      const response = await fetch(
        `https://graph.facebook.com/${env.WA_GRAPH_API_VERSION}/${env.WA_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.WA_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messaging_product: 'whatsapp', to: recipient, type: 'text', text: { body: reply },
          }),
          signal,
        },
      );
      if (response.ok) {
        console.info('wa:reply_accepted_by_meta', { elapsedMs: Date.now() - startedAt });
        return new Response(null, { status: 204 });
      }
      // A definite rejection can be retried. Retain the claim on ambiguous failures.
      if (response.status < 500) await this.storage.delete('claimed');
      const payload = await response.json().catch(() => null);
      const code = payload?.error?.code;
      const subcode = payload?.error?.error_subcode;
      console.error('wa:graph_send_failed', {
        status: response.status,
        elapsedMs: Date.now() - startedAt,
        code: Number.isSafeInteger(code) ? code : null,
        subcode: Number.isSafeInteger(subcode) ? subcode : null,
      });
    } catch {
      console.error(signal.aborted ? 'wa:graph_send_timeout' : 'wa:graph_send_transport_error', {
        elapsedMs: Date.now() - startedAt,
      });
    }
    return new Response(null, { status: 503 });
  }

  async alarm() {
    await this.storage.deleteAll();
  }
}
