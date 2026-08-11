import assert from 'node:assert/strict';
import test from 'node:test';

process.env.APP_GUARD_SECRET = 'test-only-guard-secret-with-enough-entropy';
delete process.env.APP_ALLOWED_HOSTS;
delete process.env.APP_ALLOWED_ORIGINS;
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_PROJECT_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.SUPABASE_SERVICE_ROLE;

const api = await import('../lib/api-utils.js');
const { checkoutOffer, publicCheckoutOffer } = await import('../lib/checkout-catalog.js');
const { createCheckoutSandboxHandler, default: sandboxHandler } = await import('../api/checkout/sandbox.js');

function responseMock() {
  const headers = new Map();
  let body = '';
  return {
    headers,
    statusCode: 200,
    setHeader(name, value) { headers.set(String(name).toLowerCase(), value); },
    end(value = '') { body += String(value); },
    json() { return body ? JSON.parse(body) : {}; },
  };
}

function requestWithSession(body, userAgent = 'Checkout Sandbox Test/1.0') {
  const base = {
    method: 'POST',
    body,
    headers: {
      host: 'localhost:5173',
      origin: 'http://localhost:5173',
      'content-type': 'application/json; charset=utf-8',
      'user-agent': userAgent,
      'x-forwarded-for': '127.0.0.1',
    },
    socket: { remoteAddress: '127.0.0.1' },
  };
  const cookieResponse = responseMock();
  api.issueSessionCookie(base, cookieResponse);
  const cookie = cookieResponse.headers.get('set-cookie').split(';')[0];
  return { ...base, headers: { ...base.headers, cookie } };
}

test('checkout catalog keeps canonical prices in integer cents', () => {
  assert.equal(checkoutOffer('standard').amountCents, 20798);
  assert.equal(checkoutOffer('ultimate').amountCents, 28930);
  assert.equal(checkoutOffer('early').amountCents, 35990);
  assert.equal(checkoutOffer(' STANDARD ').id, 'standard');
  assert.equal(checkoutOffer('__proto__'), null);
  assert.equal(checkoutOffer('constructor'), null);
  assert.equal(checkoutOffer({ toString: () => 'standard' }), null);
});

test('checkout catalog cannot be mutated and public output is an explicit copy', () => {
  const canonical = checkoutOffer('standard');
  assert.equal(Object.isFrozen(canonical), true);
  assert.throws(() => { canonical.amountCents = 1; }, TypeError);
  const publicOffer = publicCheckoutOffer('standard');
  publicOffer.amountCents = 1;
  assert.equal(checkoutOffer('standard').amountCents, 20798);
  assert.deepEqual(Object.keys(publicOffer).sort(), ['amountCents', 'currency', 'id', 'title']);
});

test('sandbox ignores a client supplied amount and returns a non-payable demo code', async () => {
  const req = requestWithSession({
    offerId: 'standard',
    amountCents: 1,
    price: 0.01,
    offer: { id: 'early', amountCents: 1 },
    customer: { name: 'Cliente Sigiloso', email: 'nao-retorne@example.com', phone: '+55 (11) 99999-9999' },
  });
  const res = responseMock();
  await sandboxHandler(req, res);
  const data = res.json();
  assert.equal(res.statusCode, 200);
  assert.equal(data.sandbox, true);
  assert.equal(data.order.offer.amountCents, 20798);
  assert.equal(data.order.offer.id, 'standard');
  assert.equal(data.pix.isReal, false);
  assert.equal(data.mode, 'sandbox');
  assert.match(data.notice, /nenhum pagamento ou pedido real/i);
  assert.match(data.pix.copyPaste, /^DEMO-PIX-/);
  assert.match(data.pix.copyPaste, /NAO-PAGAR$/);
  assert.equal(res.headers.get('cache-control'), 'no-store, max-age=0');
  assert.equal(res.headers.get('x-checkout-mode'), 'sandbox');
  const serialized = JSON.stringify(data);
  assert.doesNotMatch(serialized, /Cliente Sigiloso/i);
  assert.doesNotMatch(serialized, /nao-retorne@example\.com/i);
  assert.doesNotMatch(serialized, /11999999999/);
});

test('sandbox rejects inherited, altered, and non-string offer identifiers', async (t) => {
  for (const offerId of ['altered', '__proto__', 'constructor', null, { id: 'standard' }]) {
    await t.test(`offer ${JSON.stringify(offerId)}`, async () => {
      const req = requestWithSession({
        offerId,
        customer: { name: 'Pessoa Teste', email: 'pessoa@example.com', phone: '11999999999' },
      });
      const res = responseMock();
      await sandboxHandler(req, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.json().error, /oferta inválida/i);
    });
  }
});

test('sandbox validates customer objects without throwing on malformed input', async (t) => {
  const invalidCustomers = [
    null,
    [],
    'Pessoa Teste',
    { name: 'A', email: 'pessoa@example.com', phone: '11999999999' },
    { name: '<script>Teste</script>', email: 'pessoa@example.com', phone: '11999999999' },
    { name: 'Pessoa Teste', email: 'a..b@example.com', phone: '11999999999' },
    { name: 'Pessoa Teste', email: 'pessoa@example', phone: '11999999999' },
    { name: 'Pessoa Teste', email: 'pessoa@example.com', phone: 'abc11999999999' },
    { name: 'Pessoa Teste', email: 'pessoa@example.com', phone: '0011999999999' },
  ];
  for (const customer of invalidCustomers) {
    await t.test(`customer ${JSON.stringify(customer)}`, async () => {
      const req = requestWithSession({ offerId: 'standard', customer });
      const res = responseMock();
      await sandboxHandler(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(typeof res.json().error, 'string');
    });
  }
});

test('sandbox requires a signed session, same-origin request, and JSON content type', async () => {
  const payload = {
    offerId: 'standard',
    customer: { name: 'Pessoa Teste', email: 'pessoa@example.com', phone: '11999999999' },
  };

  const missingSession = requestWithSession(payload);
  delete missingSession.headers.cookie;
  const missingSessionRes = responseMock();
  await sandboxHandler(missingSession, missingSessionRes);
  assert.equal(missingSessionRes.statusCode, 401);

  const wrongOrigin = requestWithSession(payload);
  wrongOrigin.headers.origin = 'https://evil.example';
  const wrongOriginRes = responseMock();
  await sandboxHandler(wrongOrigin, wrongOriginRes);
  assert.equal(wrongOriginRes.statusCode, 403);

  const wrongType = requestWithSession(payload);
  wrongType.headers['content-type'] = 'text/plain';
  const wrongTypeRes = responseMock();
  await sandboxHandler(wrongType, wrongTypeRes);
  assert.equal(wrongTypeRes.statusCode, 415);
});

test('sandbox consults the blacklist and stops before processing a blocked request', async () => {
  let checks = 0;
  const blockedHandler = createCheckoutSandboxHandler({
    checkNotBlocked: async (_req, res) => {
      checks += 1;
      res.statusCode = 403;
      res.end(JSON.stringify({ error: 'Acesso bloqueado.', code: 'ip_blocked' }));
      return false;
    },
  });
  const req = requestWithSession({ offerId: 'standard', customer: null });
  const res = responseMock();
  await blockedHandler(req, res);
  assert.equal(checks, 1);
  assert.equal(res.statusCode, 403);
  assert.equal(res.json().code, 'ip_blocked');
});

test('sandbox rejects unsupported methods and oversized bodies', async () => {
  const getReq = requestWithSession({});
  getReq.method = 'GET';
  const getRes = responseMock();
  await sandboxHandler(getReq, getRes);
  assert.equal(getRes.statusCode, 405);
  assert.equal(getRes.headers.get('allow'), 'POST');

  const largeReq = requestWithSession({
    offerId: 'standard',
    customer: { name: 'Pessoa Teste', email: 'pessoa@example.com', phone: '11999999999' },
  });
  largeReq.headers['content-length'] = String(9 * 1024);
  const largeRes = responseMock();
  await sandboxHandler(largeReq, largeRes);
  assert.equal(largeRes.statusCode, 413);

  const serializedLargeReq = requestWithSession({
    offerId: 'standard',
    padding: 'x'.repeat(9 * 1024),
    customer: { name: 'Pessoa Teste', email: 'pessoa@example.com', phone: '11999999999' },
  });
  const serializedLargeRes = responseMock();
  await sandboxHandler(serializedLargeReq, serializedLargeRes);
  assert.equal(serializedLargeRes.statusCode, 413);
});

test('sandbox handles non-object and unreadable JSON bodies without throwing', async () => {
  for (const body of [null, [], 'invalid-json']) {
    const req = requestWithSession(body);
    const res = responseMock();
    await sandboxHandler(req, res);
    assert.equal(res.statusCode, 400);
    assert.match(res.json().error, /json inválido/i);
  }
});

test('sandbox creates deterministic ephemeral demo data without external calls', async () => {
  const originalFetch = globalThis.fetch;
  let externalCalls = 0;
  globalThis.fetch = async () => {
    externalCalls += 1;
    throw new Error('unexpected external call');
  };
  try {
    const handler = createCheckoutSandboxHandler({
      checkNotBlocked: async () => true,
      randomUUID: () => '12345678-1234-4abc-8def-1234567890ab',
      now: () => Date.parse('2026-08-11T12:00:00.000Z'),
    });
    const req = requestWithSession({
      offerId: 'standard',
      customer: { name: 'Pessoa Teste', email: 'pessoa@example.com', phone: '11999999999' },
    });
    const res = responseMock();
    await handler(req, res);
    const data = res.json();
    assert.equal(res.statusCode, 200);
    assert.equal(data.order.id, 'demo_1234567812344abc8def1234567890ab');
    assert.equal(data.order.createdAt, '2026-08-11T12:00:00.000Z');
    assert.equal(data.pix.expiresAt, '2026-08-11T12:15:00.000Z');
    assert.equal(externalCalls, 0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
