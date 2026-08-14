import { createRequire } from 'node:module';
import { checkoutOffer, publicCheckoutOffer } from './checkout-catalog.js';
import { canonicalPaymentStatus, pickText, validCpf } from './checkout-payments.js';

const require = createRequire(import.meta.url);
const coreCreateHandler = require('../backend/shared-core/api/pix/create.js');
const coreStatusHandler = require('../backend/shared-core/api/pix/status.js');
const coreWebhookHandler = require('../backend/shared-core/api/pix/webhook.js');
const coreAdminHandler = require('../backend/shared-core/api/admin/[...path].js');
const coreDispatchHandler = require('../backend/shared-core/api/jobs/dispatch.js');
const { invalidatePaymentsConfigCache } = require('../backend/shared-core/lib/payments-config-store.js');

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function validEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email || email.length > 254 || /\s/.test(email)) return false;
  const parts = email.split('@');
  return parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1]) && parts[1].includes('.');
}

export function normalizeCheckoutCustomer(value) {
  const customer = asObject(value);
  const name = pickText(customer.name).replace(/\s+/g, ' ').slice(0, 160);
  const email = pickText(customer.email).toLowerCase().slice(0, 180);
  const phone = String(customer.phone || customer.phoneDigits || '').replace(/\D/g, '').slice(0, 13);
  const cpf = String(customer.cpf || customer.document || '').replace(/\D/g, '').slice(0, 11);
  if (name.length < 3 || !validEmail(email) || !/^[1-9]\d{9,10}$/.test(phone) || !validCpf(cpf)) return null;
  return { name, email, phone, phoneDigits: phone, cpf };
}

export function adaptNodeResponse(res) {
  if (typeof res.status !== 'function') {
    res.status = function status(code) {
      this.statusCode = code;
      return this;
    };
  }
  if (typeof res.json !== 'function') {
    res.json = function json(payload) {
      this.setHeader?.('Content-Type', 'application/json; charset=utf-8');
      this.end(JSON.stringify(payload));
      return this;
    };
  }
  return res;
}

async function captureCore(handler, req, body) {
  let payload = null;
  let ended = false;
  const headers = new Map();
  const response = {
    statusCode: 200,
    status(code) {
      this.statusCode = Number(code) || 500;
      return this;
    },
    setHeader(name, value) {
      headers.set(String(name).toLowerCase(), value);
      return this;
    },
    getHeader(name) {
      return headers.get(String(name).toLowerCase());
    },
    json(value) {
      payload = value;
      ended = true;
      return this;
    },
    end(value) {
      if (value !== undefined && value !== null && value !== '') {
        try { payload = JSON.parse(String(value)); } catch (_error) { payload = value; }
      }
      ended = true;
      return this;
    },
  };
  const coreReq = {
    ...req,
    body,
    headers: { ...(req.headers || {}) },
    query: { ...(req.query || {}) },
  };
  await handler(coreReq, response);
  if (!ended) throw new Error('shared_core_response_missing');
  return { statusCode: response.statusCode, payload: asObject(payload), headers };
}

export async function createProductionCheckout(req, input = {}) {
  const offer = checkoutOffer(input.offerId);
  const customer = normalizeCheckoutCustomer(input.customer);
  const sessionId = String(input.sessionId || input.session_id || '').trim().slice(0, 80);
  if (!offer) return { statusCode: 400, payload: { error: 'Oferta invalida.' } };
  if (!customer) return { statusCode: 400, payload: { error: 'Revise nome, e-mail, telefone e CPF.' } };
  if (!sessionId) return { statusCode: 400, payload: { error: 'Sessao do checkout ausente.' } };

  const amount = Number((offer.amountCents / 100).toFixed(2));
  const coreBody = {
    amount,
    sessionId,
    personal: customer,
    address: asObject(input.address),
    extra: { noNumber: true, noComplement: true, ...asObject(input.extra) },
    shipping: {
      id: offer.id,
      name: offer.title,
      price: amount,
      basePrice: amount,
      originalPrice: amount,
    },
    reward: { id: 'gta6', name: offer.title, extraPrice: 0 },
    bump: null,
    upsell: null,
    utm: asObject(input.utm),
    sourceUrl: pickText(input.sourceUrl, input.source_url, req.headers?.referer, req.headers?.origin),
    addPaymentInfoEventId: `add_payment_${sessionId}`.slice(0, 120),
  };
  const result = await captureCore(coreCreateHandler, req, coreBody);
  if (result.statusCode < 200 || result.statusCode >= 300) return result;

  const pix = asObject(result.payload);
  const txid = pickText(pix.idTransaction, pix.txid);
  const createdAt = new Date().toISOString();
  const expiresInSeconds = Math.max(60, Math.min(172800, Number(pix.expiresIn || 3600) || 3600));
  const status = canonicalPaymentStatus(pix.status || 'waiting_payment', pix.gateway);
  return {
    statusCode: 200,
    payload: {
      ok: true,
      mode: 'production',
      reused: pix.reused === true,
      order: {
        id: pickText(pix.externalId, txid),
        status,
        offer: publicCheckoutOffer(offer.id),
        createdAt,
      },
      pix: {
        txid,
        externalId: pickText(pix.externalId),
        gateway: pickText(pix.gateway),
        status,
        statusRaw: pickText(pix.status),
        amountCents: offer.amountCents,
        currency: 'BRL',
        paymentCode: pickText(pix.paymentCode),
        paymentCodeBase64: pickText(pix.paymentCodeBase64),
        paymentQrUrl: pickText(pix.paymentQrUrl),
        createdAt,
        expiresAt: new Date(Date.now() + expiresInSeconds * 1000).toISOString(),
        isReal: true,
      },
    },
  };
}

export async function queryProductionCheckout(req, input = {}) {
  const sessionId = String(input.sessionId || input.session_id || '').trim().slice(0, 80);
  const txid = String(input.txid || input.idTransaction || '').trim().slice(0, 180);
  if (!sessionId || !txid) return { statusCode: 400, payload: { error: 'Sessao ou transacao ausente.' } };
  const result = await captureCore(coreStatusHandler, req, { sessionId, txid });
  if (result.statusCode < 200 || result.statusCode >= 300) return result;
  const data = asObject(result.payload);
  return {
    statusCode: 200,
    payload: {
      ok: data.ok !== false,
      payment: {
        txid: pickText(data.txid, txid),
        gateway: pickText(data.gateway),
        status: canonicalPaymentStatus(data.status || data.statusRaw, data.gateway),
        statusRaw: pickText(data.statusRaw, data.status),
        statusUpdatedAt: pickText(data.changedAt),
        paymentCode: pickText(data.paymentCode),
        paymentCodeBase64: pickText(data.paymentCodeBase64),
        paymentQrUrl: pickText(data.paymentQrUrl),
      },
    },
  };
}

export async function runCoreWebhook(req, res) {
  return coreWebhookHandler(req, adaptNodeResponse(res));
}

export async function runCoreAdmin(req, res) {
  return coreAdminHandler(req, adaptNodeResponse(res));
}

export async function runCoreDispatch(req, res) {
  return coreDispatchHandler(req, adaptNodeResponse(res));
}

export function invalidateSharedCommerceCaches() {
  invalidatePaymentsConfigCache();
}
