import assert from 'node:assert/strict';
import { test } from 'node:test';
import worker from '../workers/reviews/index.mjs';

const origin = 'https://aymariachi.test';
const password = 'local-test-only-random-placeholder';
const draft = { name: '  Ana  ', rating: 5, comment: '<script>alert(1)</script>', consent: true };

function setup() {
  const data = new Map();
  const rate = { success: true };
  const env = {
    REVIEWS: {
      async put(key, value, { metadata }) { data.set(key, { value, metadata }); },
      async get(key) { return JSON.parse(data.get(key)?.value ?? 'null'); },
      async list({ cursor, limit }) {
        const offset = Number(cursor ?? 0);
        const keys = [...data.keys()].sort().slice(offset, offset + limit)
          .map((name) => ({ name, metadata: data.get(name).metadata }));
        return { keys, list_complete: offset + limit >= data.size, cursor: String(offset + limit) };
      },
    },
    REVIEWS_ADMIN_PASSWORD: password,
    REVIEWS_LIMIT: { async limit() { return rate; } },
    ASSETS: { fetch: () => new Response('static site') },
  };
  function call(path, { body, form, cookie, from = origin } = {}) {
    const content = form ? new URLSearchParams(form) : body === undefined ? undefined : JSON.stringify(body);
    const headers = new Headers();
    if (content !== undefined) {
      headers.set('origin', from);
      headers.set('content-type', form ? 'application/x-www-form-urlencoded' : 'application/json');
    }
    if (cookie) headers.set('cookie', cookie);
    return worker.fetch(new Request(origin + path, { method: content === undefined ? 'GET' : 'POST', headers, body: content }), env);
  }
  return { call, env, data, rate };
}

test('submit, moderate, hide, restore and reject a review', async () => {
  const { call, data } = setup();
  assert.equal((await call('/api/resenas', { body: draft })).status, 201);
  assert.deepEqual((await (await call('/api/resenas')).json()).reviews, []);
  const id = data.keys().next().value;
  const loginForm = await call('/admin/resenas');
  assert.equal(loginForm.headers.get('referrer-policy'), 'same-origin');
  assert.doesNotMatch(await loginForm.text(), /Ana/);
  assert.equal((await call('/admin/resenas', { form: { id, action: 'approved' } })).status, 401);
  const login = await call('/admin/resenas', { form: { action: 'login', password } });
  assert.equal(login.status, 303);
  const setCookie = login.headers.get('set-cookie');
  assert.match(setCookie, /Secure; HttpOnly; SameSite=Strict/);
  const cookie = setCookie.split(';')[0];
  const inbox = await (await call('/admin/resenas', { cookie })).text();
  assert.match(inbox, /Ana/);
  assert.match(inbox, /&lt;script&gt;/);
  assert.doesNotMatch(inbox, /<script>/);
  assert.equal((await call('/admin/resenas', { cookie, from: 'https://other.test', form: { id, action: 'approved' } })).status, 403);
  assert.equal((await call('/admin/resenas', { cookie: cookie + 'a', form: { id, action: 'approved' } })).status, 401);
  for (const action of ['rejected', 'approved', 'hidden', 'approved']) {
    assert.equal((await call('/admin/resenas', { cookie, form: { id, action } })).status, 303);
    const { reviews } = await (await call('/api/resenas')).json();
    assert.equal(reviews.length, action === 'approved' ? 1 : 0);
    if (action === 'approved') {
      assert.equal(reviews[0].name, 'Ana');
      assert.equal(reviews[0].comment, draft.comment);
      assert.equal('status' in reviews[0], false);
    }
  }
  assert.equal((await call('/admin/resenas', { cookie, form: { id, action: 'rejected' } })).status, 409);
  const logout = await call('/admin/resenas', { cookie, form: { action: 'logout' } });
  assert.match(logout.headers.get('set-cookie'), /Max-Age=0/);
});

test('validation, rate limits, disabled configuration and existing assets', async () => {
  const { call, data, rate, env } = setup();
  for (const invalid of [{}, { consent: false }, { rating: 6 }, { rating: '5' }, { name: ' ' }, { comment: 'x'.repeat(801) }]) {
    assert.equal((await call('/api/resenas', { body: Object.keys(invalid).length ? { ...draft, ...invalid } : invalid })).status, 400);
  }
  assert.equal((await call('/api/resenas', { body: { ...draft, comment: 'x'.repeat(9000) } })).status, 400);
  assert.equal((await call('/api/resenas', { body: draft, from: 'https://other.test' })).status, 403);
  assert.equal((await call('/admin/resenas', { form: { action: 'login', password: 'wrong' } })).status, 401);
  rate.success = false;
  assert.equal((await call('/api/resenas', { body: draft })).status, 429);
  assert.equal((await call('/admin/resenas', { form: { action: 'login', password } })).status, 429);
  assert.equal(data.size, 0);
  delete env.REVIEWS;
  assert.equal((await call('/api/resenas')).status, 503);
  assert.equal(await (await call('/')).text(), 'static site');
});
