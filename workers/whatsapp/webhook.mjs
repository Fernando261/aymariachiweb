const encoder = new TextEncoder();
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
    if (event?.object !== 'whatsapp_business_account') return new Response('OK');

    for (const entry of event.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (change.field !== 'messages' || !env.WA_PHONE_NUMBER_ID ||
            value?.metadata?.phone_number_id !== env.WA_PHONE_NUMBER_ID) continue;
        for (const message of value.messages ?? []) {
          if (!message?.id || message.type !== 'text' ||
              message.text?.body?.trim().toLowerCase() !== testPhrase ||
              !env.WA_TEST_RECIPIENT || message.from !== env.WA_TEST_RECIPIENT) continue;
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
    if (!env.WA_ACCESS_TOKEN || !/^v\d+\.\d+$/.test(env.WA_GRAPH_API_VERSION ?? '') ||
        !/^\d+$/.test(env.WA_PHONE_NUMBER_ID ?? '')) {
      return new Response(null, { status: 503 });
    }
    const recipient = await request.text();
    if (!(await this.storage.getAlarm())) {
      await this.storage.setAlarm(Date.now() + 8 * 24 * 60 * 60 * 1000);
    }
    const claimed = await this.storage.transaction(async (txn) => {
      if (await txn.get('claimed')) return false;
      await txn.put('claimed', true);
      return true;
    });
    if (!claimed) return new Response(null, { status: 204 });

    try {
      const response = await fetch(
        `https://graph.facebook.com/${env.WA_GRAPH_API_VERSION}/${env.WA_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${env.WA_ACCESS_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messaging_product: 'whatsapp', to: recipient, type: 'text', text: { body: reply },
          }),
          signal: AbortSignal.timeout(8000),
        },
      );
      if (response.ok) return new Response(null, { status: 204 });
      // A definite rejection can be retried. Retain the claim on ambiguous failures.
      if (response.status < 500) await this.storage.delete('claimed');
      console.error('WhatsApp API HTTP status', response.status);
    } catch {
      console.error('WhatsApp API request did not complete');
    }
    return new Response(null, { status: 503 });
  }

  async alarm() {
    await this.storage.deleteAll();
  }
}
