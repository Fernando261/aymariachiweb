import { adminError, inboxPage, loginPage } from './admin.mjs';

const reviewPath = '/api/resenas';
const adminPath = '/admin/resenas';
const cookieName = '__Host-resenas';
const sessionSeconds = 8 * 60 * 60;
const pageSize = 24;
const encoder = new TextEncoder();
const idPattern = /^review:\d{13}:[\da-f-]{36}$/;
const moderation = {
  pending: ['approved', 'rejected'],
  approved: ['hidden'],
  rejected: ['approved'],
  hidden: ['approved'],
};

const json = (data, status = 200) => Response.json(data, {
  status,
  headers: { 'cache-control': 'no-store', 'x-content-type-options': 'nosniff' },
});

async function readBody(request) {
  const reader = request.body?.getReader();
  if (!reader) return '';
  const decoder = new TextDecoder('utf-8', { fatal: true });
  let bytes = 0;
  let body = '';
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) return body + decoder.decode();
      bytes += value.byteLength;
      if (bytes > 8192) {
        await reader.cancel();
        return null;
      }
      body += decoder.decode(value, { stream: true });
    }
  } catch {
    return null;
  }
}

const hex = (bytes) => Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, '0')).join('');
const hmacKey = (password) => crypto.subtle.importKey(
  'raw', encoder.encode(password), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify'],
);

async function passwordMatches(password, configured) {
  if (!password || password.length > 128) return false;
  const challenge = encoder.encode('aymariachi:reviews:login');
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(configured), challenge);
  return crypto.subtle.verify('HMAC', await hmacKey(password), signature, challenge);
}

async function hasSession(request, configured) {
  const cookie = request.headers.get('cookie')?.split(';').map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  const match = cookie?.match(/^(\d{10}\.[\da-f-]{36})\.([\da-f]{64})$/);
  if (!match || Number(match[1].split('.')[0]) <= Math.floor(Date.now() / 1000)) return false;
  const signature = Uint8Array.from(match[2].match(/../g), (byte) => Number.parseInt(byte, 16));
  return crypto.subtle.verify('HMAC', await hmacKey(configured), signature, encoder.encode(match[1]));
}

async function newSession(configured) {
  const expiration = Math.floor(Date.now() / 1000) + sessionSeconds;
  const value = `${expiration}.${crypto.randomUUID()}`;
  const signature = await crypto.subtle.sign('HMAC', await hmacKey(configured), encoder.encode(value));
  return `${value}.${hex(signature)}`;
}

function redirectToInbox({ cookie, maxAge = sessionSeconds, saved = false, cursor, view } = {}) {
  const url = new URL(adminPath, 'https://example.invalid');
  if (cursor) url.searchParams.set('cursor', cursor);
  if (view === 'rejected') url.searchParams.set('view', view);
  if (saved) url.searchParams.set('saved', '1');
  const headers = new Headers({
    location: url.pathname + url.search,
    'cache-control': 'no-store',
  });
  if (cookie !== undefined) {
    headers.set('set-cookie', `${cookieName}=${cookie}; Path=/; Max-Age=${maxAge}; Secure; HttpOnly; SameSite=Strict`);
  }
  return new Response(null, { status: 303, headers });
}

async function rateAllowed(request, env, action) {
  const client = request.headers.get('cf-connecting-ip') ?? 'local';
  return (await env.REVIEWS_LIMIT.limit({ key: `${action}:${client}` })).success;
}

async function writeReview(kv, review) {
  await kv.put(review.id, JSON.stringify(review), { metadata: { status: review.status } });
}

async function reviewPage(kv, cursor, matchesStatus) {
  const result = await kv.list({ prefix: 'review:', limit: pageSize, cursor });
  const keys = result.keys.filter(({ metadata }) => !metadata?.status || matchesStatus(metadata.status));
  const reviews = (await Promise.all(keys.map(({ name }) => kv.get(name, 'json'))))
    .filter((review) => review && matchesStatus(review.status));
  return { reviews, nextCursor: result.list_complete ? null : result.cursor };
}

async function nextMatchingPage(kv, cursor, matchesStatus) {
  // Avanza sobre lotes sin coincidencias con un límite de lecturas por petición.
  let result;
  for (let batch = 0; batch < 4; batch++) {
    result = await reviewPage(kv, cursor, matchesStatus);
    if (result.reviews.length || !result.nextCursor) break;
    cursor = result.nextCursor;
  }
  return result;
}

async function publicReviews(request, env, url) {
  if (request.method === 'GET') {
    const result = await nextMatchingPage(env.REVIEWS, url.searchParams.get('cursor') || undefined,
      (status) => status === 'approved');
    return json({
      reviews: result.reviews.map(({ id, name, rating, comment, createdAt }) => ({ id, name, rating, comment, createdAt })),
      nextCursor: result.nextCursor,
    });
  }
  if (request.method !== 'POST') return json({ error: 'Método no permitido.' }, 405);
  if (request.headers.get('origin') !== url.origin ||
      !/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    return json({ error: 'Solicitud inválida.' }, 403);
  }
  if (!await rateAllowed(request, env, 'submit')) {
    return json({ error: 'Has enviado varias solicitudes. Espera un minuto e inténtalo de nuevo.' }, 429);
  }
  const body = await readBody(request);
  if (body === null) return json({ error: 'La solicitud supera el tamaño permitido o no es válida.' }, 400);

  let input;
  try {
    input = JSON.parse(body);
  } catch {
    return json({ error: 'Solicitud inválida.' }, 400);
  }
  const name = typeof input?.name === 'string' ? input.name.trim() : '';
  const comment = typeof input?.comment === 'string' ? input.comment.trim() : '';
  const rating = input?.rating;
  if (!name || name.length > 60 || !comment || comment.length > 800 ||
      !Number.isInteger(rating) || rating < 1 || rating > 5 || input.consent !== true) {
    return json({ error: 'Revisa tu nombre, la calificación, el comentario y el permiso de publicación.' }, 400);
  }
  const now = Date.now();
  const id = `review:${String(9_999_999_999_999 - now).padStart(13, '0')}:${crypto.randomUUID()}`;
  await writeReview(env.REVIEWS, { id, name, rating, comment, status: 'pending', createdAt: new Date(now).toISOString() });
  return json({ received: true }, 201);
}

async function admin(request, env, url) {
  const password = env.REVIEWS_ADMIN_PASSWORD;
  const authenticated = await hasSession(request, password);
  if (request.method === 'GET') {
    if (!authenticated) return loginPage();
    const cursor = url.searchParams.get('cursor') || undefined;
    const showRejected = url.searchParams.get('view') === 'rejected';
    const { reviews, nextCursor } = await nextMatchingPage(env.REVIEWS, cursor,
      (status) => (status === 'rejected') === showRejected);
    return inboxPage(reviews, nextCursor, cursor, url.searchParams.get('saved') === '1', showRejected);
  }
  if (request.method !== 'POST') return adminError('Método no permitido.', 405);
  if (request.headers.get('origin') !== url.origin ||
      !/^application\/x-www-form-urlencoded(?:\s*;|$)/i.test(request.headers.get('content-type') ?? '')) {
    return adminError('Solicitud inválida.', 403);
  }
  const body = await readBody(request);
  if (body === null) return adminError('Solicitud inválida.', 400);
  const fields = new URLSearchParams(body);
  const action = fields.get('action');
  if (action === 'login') {
    if (!await rateAllowed(request, env, 'login')) {
      return loginPage('Demasiados intentos. Espera un minuto e inténtalo de nuevo.', 429);
    }
    if (!await passwordMatches(fields.get('password'), password)) return loginPage('La clave no es válida.', 401);
    return redirectToInbox({ cookie: await newSession(password) });
  }
  if (!authenticated) return loginPage('Inicia sesión para moderar reseñas.', 401);
  if (action === 'logout') return redirectToInbox({ cookie: '', maxAge: 0 });

  const id = fields.get('id') ?? '';
  if (!idPattern.test(id)) return adminError('Solicitud inválida.', 400);
  const review = await env.REVIEWS.get(id, 'json');
  if (!review) return adminError('No se encontró esa reseña.', 404);
  if (!moderation[review.status]?.includes(action)) return adminError('Esa acción ya no está disponible para esta reseña.', 409);
  await writeReview(env.REVIEWS, { ...review, status: action });
  return redirectToInbox({ saved: true, cursor: fields.get('cursor'), view: fields.get('view') });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isAdmin = url.pathname === adminPath || url.pathname === `${adminPath}/`;
    if (url.pathname !== reviewPath && !isAdmin) return env.ASSETS.fetch(request);
    const password = env.REVIEWS_ADMIN_PASSWORD;
    if (!env.REVIEWS || !env.REVIEWS_LIMIT ||
        typeof password !== 'string' || password.length < 24 || password.length > 128) {
      return isAdmin ? adminError('La bandeja todavía no está configurada.', 503)
        : json({ error: 'Las reseñas aún no están disponibles.' }, 503);
    }
    try {
      return await (isAdmin ? admin(request, env, url) : publicReviews(request, env, url));
    } catch {
      console.error(isAdmin ? 'reviews:admin_error' : 'reviews:public_error');
      return isAdmin ? adminError('No se pudo completar la operación. Inténtalo de nuevo.', 503)
        : json({ error: 'No pudimos procesar la solicitud. Inténtalo de nuevo.' }, 503);
    }
  },
};
