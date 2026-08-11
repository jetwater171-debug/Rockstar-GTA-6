import assert from 'node:assert/strict';
import test from 'node:test';

const {
  buildGatewayPayload,
  canonicalPaymentStatus,
  createGatewayTransaction,
  enabledGatewayOrder,
  normalizeGatewayOrder,
  normalizePixResponse,
  validCpf,
  verifyWebhook,
} = await import('../lib/checkout-payments.js');

const offer = { id: 'standard', title: 'GTA VI Standard', amountCents: 20798, currency: 'BRL' };
const customer = { name: 'Cliente Teste', email: 'cliente@example.com', phone: '11999999999', cpf: '52998224725' };
const req = { headers: { host: 'checkout.example.com', 'x-forwarded-proto': 'https', 'x-forwarded-for': '203.0.113.1' } };

test('CPF validation rejects repeated or altered documents', () => {
  assert.equal(validCpf('529.982.247-25'), true);
  assert.equal(validCpf('52998224724'), false);
  assert.equal(validCpf('11111111111'), false);
});

test('gateway order follows the admin queue and only exposes operational gateways', () => {
  const settings = {
    gateways: {
      activeGateway: 'atomopay',
      gatewayOrder: ['atomopay', 'sunize', 'paradise', 'bravopay'],
      atomopay: { enabled: true, baseUrl: 'https://atomo.test', apiToken: 'token', offerHash: 'offer', productHash: 'product' },
      sunize: { enabled: false, baseUrl: 'https://sunize.test', apiKey: 'key', apiSecret: 'secret' },
      paradise: { enabled: true, baseUrl: 'https://paradise.test', apiKey: 'key' },
      bravopay: { enabled: true, baseUrl: 'https://bravo.test', apiKey: '' },
    },
  };
  assert.deepEqual(normalizeGatewayOrder(settings), ['atomopay', 'sunize', 'paradise', 'bravopay']);
  assert.deepEqual(enabledGatewayOrder(settings), ['atomopay', 'paradise']);
});

test('provider payloads always use the canonical server amount', () => {
  const common = { offer, customer, utm: { utm_source: 'meta' }, externalId: 'order-1', req };
  const sunize = buildGatewayPayload({ ...common, gateway: 'sunize', config: {} });
  const paradise = buildGatewayPayload({ ...common, gateway: 'paradise', config: { source: 'api_externa' } });
  const atomo = buildGatewayPayload({ ...common, gateway: 'atomopay', config: { offerHash: 'o', productHash: 'p' } });
  const bravo = buildGatewayPayload({ ...common, gateway: 'bravopay', config: {} });
  assert.equal(sunize.total_amount, 207.98);
  assert.equal(paradise.amount, 20798);
  assert.equal(atomo.amount, 20798);
  assert.equal(bravo.amount_cents, 20798);
  assert.equal(atomo.cart[0].price, 20798);
});

test('PIX response normalization supports nested gateway formats', () => {
  const parsed = normalizePixResponse({ data: { transaction: { id: 'tx-1', status: 'PAID', pix: { copy_paste: '000201BR.GOV.BCB.PIX' } } } });
  assert.equal(parsed.txid, 'tx-1');
  assert.equal(parsed.statusRaw, 'PAID');
  assert.equal(parsed.paymentCode, '000201BR.GOV.BCB.PIX');
});

test('status normalization covers provider events and terminal states', () => {
  assert.equal(canonicalPaymentStatus('AUTHORIZED', 'sunize'), 'paid');
  assert.equal(canonicalPaymentStatus('transaction.paid', 'bravopay'), 'paid');
  assert.equal(canonicalPaymentStatus('charge_back', 'paradise'), 'chargedback');
  assert.equal(canonicalPaymentStatus('expired', 'atomopay'), 'refused');
  assert.equal(canonicalPaymentStatus('processing', 'paradise'), 'waiting_payment');
});

test('gateway request sends provider credentials without leaking them into the payload', async () => {
  let call;
  const fetchImpl = async (url, options) => {
    call = { url, options };
    return new Response(JSON.stringify({ id: 'tx-1' }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const result = await createGatewayTransaction({
    gateway: 'sunize',
    config: { baseUrl: 'https://sunize.test/v1', apiKey: 'key', apiSecret: 'secret' },
    payload: { external_id: 'order-1', total_amount: 207.98 },
    idempotencyKey: 'order-1',
    fetchImpl,
  });
  assert.equal(result.response.ok, true);
  assert.equal(call.url, 'https://sunize.test/v1/transactions');
  assert.equal(call.options.headers['x-api-key'], 'key');
  assert.equal(call.options.headers['x-api-secret'], 'secret');
  assert.doesNotMatch(call.options.body, /secret/);
});

test('webhook token comparison rejects invalid tokens', () => {
  const config = { webhookToken: 'expected-token' };
  const good = { url: '/api/checkout/webhook?gateway=sunize&token=expected-token', headers: {} };
  const bad = { url: '/api/checkout/webhook?gateway=sunize&token=wrong-token', headers: {} };
  assert.equal(verifyWebhook(good, 'sunize', config, '{}'), true);
  assert.equal(verifyWebhook(bad, 'sunize', config, '{}'), false);
});
