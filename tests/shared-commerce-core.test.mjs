import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import test from 'node:test';

const require = createRequire(import.meta.url);
const { normalizeSettingsValue } = require('../backend/shared-core/lib/settings-store.js');
const { mergePaymentHistory } = require('../backend/shared-core/lib/lead-payment-history.js');
const coreGuard = require('../backend/shared-core/lib/request-guard.js');
const { issueSessionCookie } = await import('../lib/api-utils.js');
const { createProductionCheckout, adaptNodeResponse } = await import('../lib/shared-commerce-adapter.js');

function request(overrides = {}) {
  return {
    method: 'POST',
    url: '/api/checkout/create',
    headers: {
      host: 'localhost',
      origin: 'http://localhost',
      'user-agent': 'Shared Core Test/1.0',
      ...overrides.headers,
    },
    query: {},
    socket: { remoteAddress: '127.0.0.1' },
    ...overrides,
  };
}

test('Rockstar legacy admin settings are normalized into the complete shared payment schema', () => {
  const settings = normalizeSettingsValue({
    tracking: {
      metaPixel: '123456789',
      metaBackupPixel: '987654321',
      metaAccessToken: 'primary-token',
      metaBackupAccessToken: 'backup-token',
      metaTestEventCode: 'TEST123',
      browserPixel: true,
      serverEvents: true,
      tiktokPixel: 'TT-123',
    },
    gateways: {
      activeGateway: 'sunize',
      gatewayOrder: ['sunize', 'ghostspay', 'paradise'],
      sunize: { enabled: true, apiKey: 'sun-key', apiSecret: 'sun-secret' },
      ghostspay: { enabled: true, secretKey: 'ghost-secret', companyId: 'company-1' },
    },
  });

  assert.equal(settings.pixel.id, '123456789');
  assert.equal(settings.pixel.backupId, '987654321');
  assert.equal(settings.pixel.capi.enabled, true);
  assert.equal(settings.pixel.capi.backupAccessToken, 'backup-token');
  assert.equal(settings.tiktokPixel.id, 'TT-123');
  assert.equal(settings.payments.activeGateway, 'sunize');
  assert.deepEqual(settings.payments.gatewayOrder.slice(0, 3), ['sunize', 'ghostspay', 'paradise']);
  assert.equal(settings.payments.gateways.ghostspay.companyId, 'company-1');
});

test('payment history preserves earlier PIX attempts and updates the matching transaction', () => {
  let payload = mergePaymentHistory({}, {
    txid: 'tx-1',
    gateway: 'sunize',
    status: 'pending',
    amount: 207.98,
    createdAt: '2026-08-11T12:00:00.000Z',
  });
  payload = mergePaymentHistory(payload, {
    txid: 'tx-2',
    gateway: 'ghostspay',
    status: 'pending',
    amount: 207.98,
    createdAt: '2026-08-11T12:05:00.000Z',
  });
  payload = mergePaymentHistory(payload, {
    txid: 'tx-1',
    gateway: 'sunize',
    status: 'paid',
    amount: 207.98,
    lastStatusAt: '2026-08-11T12:10:00.000Z',
  });

  assert.equal(payload.paymentHistory.length, 2);
  assert.equal(payload.paymentHistory.find((item) => item.txid === 'tx-1').status, 'paid');
  assert.equal(payload.paymentHistory.find((item) => item.txid === 'tx-2').status, 'pending');
});

test('session cookies issued by Rockstar are accepted by the shared production core', () => {
  const req = request();
  const headers = new Map();
  issueSessionCookie(req, { setHeader: (name, value) => headers.set(String(name).toLowerCase(), value) });
  req.headers.cookie = String(headers.get('set-cookie')).split(';')[0];
  const response = adaptNodeResponse({
    statusCode: 200,
    setHeader() {},
    end() {},
  });
  assert.equal(coreGuard.ensureAllowedRequest(req, response, { requireSession: true }), true);
});

test('production adapter rejects manipulated offers before contacting Supabase or a gateway', async () => {
  const result = await createProductionCheckout(request(), {
    offerId: 'invented-offer',
    sessionId: 'session-test',
    customer: { name: 'Pessoa Teste', email: 'pessoa@example.com', phone: '11999999999', cpf: '52998224725' },
  });
  assert.equal(result.statusCode, 400);
  assert.match(result.payload.error, /Oferta/i);
});
