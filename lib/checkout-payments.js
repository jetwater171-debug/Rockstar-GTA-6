import crypto from 'node:crypto';
import { LEADS_TABLE, clientIp, supabaseFetch, text } from './api-utils.js';

export const CHECKOUT_GATEWAYS = Object.freeze(['sunize', 'paradise', 'atomopay', 'bravopay']);
const TERMINAL_STATUSES = new Set(['paid', 'refunded', 'chargedback', 'refused']);

const asObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};

export function pickText(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const clean = String(value).trim();
    if (clean) return clean;
  }
  return '';
}

export function digits(value, max = 32) {
  return String(value || '').replace(/\D/g, '').slice(0, max);
}

export function validCpf(value) {
  const cpf = digits(value, 11);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const check = (length) => {
    let sum = 0;
    for (let index = 0; index < length; index += 1) sum += Number(cpf[index]) * (length + 1 - index);
    const remainder = (sum * 10) % 11;
    return (remainder === 10 ? 0 : remainder) === Number(cpf[length]);
  };
  return check(9) && check(10);
}

function baseUrl(config = {}) {
  return pickText(config.baseUrl, config.apiUrl).replace(/\/+$/, '');
}

function secretConfigured(value) {
  const clean = pickText(value);
  return Boolean(clean && clean !== '__SECRET_SET__');
}

export function gatewayHasCredentials(gateway, config = {}) {
  if (!config || config.enabled !== true || !baseUrl(config)) return false;
  if (gateway === 'sunize') return secretConfigured(config.apiKey) && secretConfigured(config.apiSecret || config.secret);
  if (gateway === 'paradise') return secretConfigured(config.apiKey);
  if (gateway === 'atomopay') {
    return secretConfigured(config.apiToken || config.apiKey)
      && secretConfigured(config.offerHash)
      && secretConfigured(config.productHash);
  }
  if (gateway === 'bravopay') return secretConfigured(config.apiKey);
  return false;
}

export function normalizeGatewayOrder(settings = {}) {
  const gateways = asObject(settings.gateways);
  const raw = Array.isArray(gateways.gatewayOrder)
    ? gateways.gatewayOrder
    : String(gateways.gatewayOrder || '').split(',');
  return [gateways.activeGateway, gateways.active, ...raw, ...CHECKOUT_GATEWAYS]
    .map((item) => String(item || '').trim().toLowerCase())
    .filter((item, index, list) => CHECKOUT_GATEWAYS.includes(item) && list.indexOf(item) === index);
}

export function enabledGatewayOrder(settings = {}) {
  return normalizeGatewayOrder(settings).filter((gateway) => gatewayHasCredentials(gateway, settings.gateways?.[gateway]));
}

export async function loadCheckoutSettings() {
  const result = await supabaseFetch('app_settings?key=eq.admin_config&select=value,updated_at&limit=1');
  if (result.missing) throw new Error('missing_supabase_config');
  if (!result.ok) throw new Error('settings_unavailable');
  const row = Array.isArray(result.data) ? result.data[0] : null;
  if (!row?.value) throw new Error('settings_not_found');
  return { ...asObject(row.value), updatedAt: row.updated_at || null };
}

function resolveOrigin(req) {
  const configured = pickText(process.env.APP_PUBLIC_URL).replace(/\/+$/, '');
  if (configured) return configured;
  const host = pickText(req?.headers?.['x-forwarded-host'], req?.headers?.host);
  const forwarded = pickText(req?.headers?.['x-forwarded-proto']).toLowerCase();
  const protocol = forwarded === 'http' || forwarded === 'https' ? forwarded : 'https';
  return host ? `${protocol}://${host}` : '';
}

export function webhookUrl(req, gateway, config = {}) {
  const configured = pickText(config.postbackUrl, config.webhookUrl);
  if (configured) return configured;
  const origin = resolveOrigin(req);
  if (!origin) return '';
  const params = new URLSearchParams({ gateway });
  const token = pickText(config.webhookToken);
  if (token) params.set('token', token);
  return `${origin}/api/checkout/webhook?${params.toString()}`;
}

function customerSnapshot(customer = {}) {
  const phone = digits(customer.phone, 13);
  const cpf = digits(customer.cpf || customer.document, 11);
  return {
    name: pickText(customer.name).slice(0, 160),
    email: pickText(customer.email).toLowerCase().slice(0, 180),
    phone,
    phoneE164: phone.startsWith('55') ? `+${phone}` : `+55${phone}`,
    cpf,
  };
}

function trackingSnapshot(utm = {}) {
  return Object.fromEntries([
    'src', 'sck', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
    'fbclid', 'ttclid', 'gclid',
  ].map((key) => [key, pickText(utm?.[key]).slice(0, 240)]).filter(([, value]) => value));
}

export function buildGatewayPayload({ gateway, config, offer, customer, utm, externalId, req }) {
  const amount = Number((offer.amountCents / 100).toFixed(2));
  const person = customerSnapshot(customer);
  const tracking = trackingSnapshot(utm);
  const postback = webhookUrl(req, gateway, config);
  if (gateway === 'sunize') {
    return {
      external_id: externalId,
      total_amount: amount,
      payment_method: 'PIX',
      items: [{ id: offer.id, title: offer.title, description: offer.title, price: amount, quantity: 1, is_physical: false }],
      ip: clientIp(req) || undefined,
      customer: { name: person.name, email: person.email, phone: person.phoneE164, document_type: 'CPF', document: person.cpf },
      ...tracking,
      ...(Object.keys(tracking).length ? { metadata: { orderId: externalId, ...tracking } } : {}),
    };
  }
  if (gateway === 'paradise') {
    const source = pickText(config.source) || 'api_externa';
    return {
      amount: offer.amountCents,
      description: pickText(config.description) || offer.title,
      reference: externalId,
      external_id: externalId,
      customer: { name: person.name, email: person.email, document: person.cpf, phone: person.phone },
      ...(pickText(config.productHash) ? { productHash: pickText(config.productHash) } : { source }),
      ...(postback ? { postback_url: postback } : {}),
      ...(Object.keys(tracking).length ? { tracking } : {}),
    };
  }
  if (gateway === 'atomopay') {
    return {
      amount: offer.amountCents,
      offer_hash: pickText(config.offerHash),
      payment_method: 'pix',
      customer: { name: person.name, email: person.email, phone_number: person.phone, document: person.cpf },
      cart: [{ product_hash: pickText(config.productHash), title: offer.title, price: offer.amountCents, quantity: 1, operation_type: 1, tangible: false }],
      expire_in_days: 2,
      transaction_origin: 'api',
      ...(postback ? { postback_url: postback } : {}),
      tracking,
    };
  }
  return {
    amount_cents: offer.amountCents,
    method: 'pix',
    customer: { name: person.name, email: person.email, cpf: person.cpf, phone: person.phone },
    description: pickText(config.description) || offer.title,
    external_reference: externalId,
    expires_in: Math.max(60, Math.min(86400, Number(config.expiresIn || 3600) || 3600)),
    utm: {
      source: tracking.utm_source || tracking.src || '',
      medium: tracking.utm_medium || '',
      campaign: tracking.utm_campaign || tracking.sck || '',
      term: tracking.utm_term || '',
      content: tracking.utm_content || '',
    },
  };
}

async function fetchJson(url, options = {}, timeoutMs = 12000, fetchImpl = fetch) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), Math.max(1500, Math.min(30000, Number(timeoutMs) || 12000)));
  try {
    const response = await fetchImpl(url, { ...options, signal: controller.signal });
    const raw = await response.text().catch(() => '');
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch (_error) { data = { message: raw }; }
    return { response, data };
  } finally {
    clearTimeout(timer);
  }
}

function providerHeaders(gateway, config, idempotencyKey = '') {
  if (gateway === 'sunize') return {
    'Content-Type': 'application/json',
    'x-api-key': pickText(config.apiKey),
    'x-api-secret': pickText(config.apiSecret, config.secret),
  };
  if (gateway === 'paradise') return { 'Content-Type': 'application/json', 'X-API-Key': pickText(config.apiKey) };
  if (gateway === 'atomopay') return { Accept: 'application/json', 'Content-Type': 'application/json' };
  return {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    Authorization: `Bearer ${pickText(config.apiKey)}`,
    ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
  };
}

function createEndpoint(gateway, config) {
  if (gateway === 'paradise') return `${baseUrl(config)}/api/v1/transaction.php`;
  if (gateway === 'atomopay') {
    const url = new URL(`${baseUrl(config)}/transactions`);
    url.searchParams.set('api_token', pickText(config.apiToken, config.apiKey));
    return url.toString();
  }
  return `${baseUrl(config)}/transactions`;
}

export async function createGatewayTransaction({ gateway, config, payload, idempotencyKey, fetchImpl = fetch }) {
  return fetchJson(createEndpoint(gateway, config), {
    method: 'POST',
    headers: providerHeaders(gateway, config, idempotencyKey),
    body: JSON.stringify(payload),
  }, config.timeoutMs, fetchImpl);
}

function findValue(input, matcher, depth = 0) {
  if (!input || typeof input !== 'object' || depth > 7) return '';
  for (const [key, value] of Object.entries(input)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (matcher(normalized, value)) {
      const clean = pickText(value);
      if (clean && clean !== '[object Object]') return clean;
    }
  }
  for (const value of Object.values(input)) {
    if (value && typeof value === 'object') {
      const found = findValue(value, matcher, depth + 1);
      if (found) return found;
    }
  }
  return '';
}

export function normalizePixResponse(data = {}) {
  const txid = findValue(data, (key) => /^(id|txid|transactionid|transactionhash|hash)$/.test(key));
  const externalId = findValue(data, (key) => /^(externalid|externalreference|reference)$/.test(key));
  const statusRaw = findValue(data, (key) => /^(status|rawstatus|situacao|paymentstatus|transactionstatus)$/.test(key))
    || findValue(data, (key) => /^(event|eventtype|type)$/.test(key));
  let paymentCode = findValue(data, (key) => /(copypaste|brcode|emv|payload|pixcode|qrcodetext|qrcopypaste|qrtext)/.test(key));
  let qrRaw = findValue(data, (key) => /(qrcodebase64|qrcodeimage|qrimage|imagebase64|base64|qrcode|qrcodeurl|qrurl|paymentqrurl)$/.test(key));
  if (!paymentCode && (qrRaw.startsWith('000201') || /br\.gov\.bcb\.pix/i.test(qrRaw))) {
    paymentCode = qrRaw;
    qrRaw = '';
  }
  const paymentQrUrl = /^(https?:\/\/|data:image)/i.test(qrRaw) ? qrRaw : '';
  const paymentCodeBase64 = qrRaw && !paymentQrUrl ? qrRaw.replace(/^data:image\/[^;]+;base64,/i, '') : '';
  return { txid, externalId, statusRaw, paymentCode, paymentCodeBase64, paymentQrUrl };
}

function normalizeToken(value) {
  return String(value || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
}

export function canonicalPaymentStatus(statusRaw, gateway = '') {
  const status = normalizeToken(statusRaw);
  if (!status) return 'waiting_payment';
  if (gateway === 'sunize' && status === 'authorized') return 'paid';
  if (gateway === 'sunize' && status === 'chargeback') return 'chargedback';
  const paid = ['paid', 'pago', 'approved', 'aprovado', 'authorized', 'confirmado', 'confirmed', 'completed', 'concluido', 'transaction_paid'];
  const refunded = ['refunded', 'refund', 'reembolsado', 'estornado', 'devolvido', 'transaction_refunded'];
  const chargeback = ['chargeback', 'charge_back', 'chargebacked', 'chargedback', 'transaction_chargebacked'];
  const refused = ['failed', 'refused', 'declined', 'denied', 'rejected', 'cancelled', 'canceled', 'expired', 'voided', 'recusado', 'cancelado', 'expirado'];
  if (paid.includes(status)) return 'paid';
  if (refunded.includes(status)) return 'refunded';
  if (chargeback.includes(status)) return 'chargedback';
  if (refused.includes(status)) return 'refused';
  return 'waiting_payment';
}

async function bravoStatus(config, txid, fetchImpl) {
  const url = new URL(`${baseUrl(config)}/transactions`);
  url.searchParams.set('limit', '100');
  url.searchParams.set('method', 'PIX');
  const result = await fetchJson(url.toString(), { method: 'GET', headers: providerHeaders('bravopay', config) }, config.timeoutMs, fetchImpl);
  if (!result.response?.ok) return result;
  const rows = Array.isArray(result.data?.data) ? result.data.data : Array.isArray(result.data) ? result.data : [];
  const match = rows.find((item) => pickText(item?.id, item?.transaction_id, item?.txid) === txid);
  return match
    ? { response: result.response, data: match }
    : { response: { ok: false, status: 404 }, data: { error: 'transaction_not_found' } };
}

export async function getGatewayTransaction({ gateway, config, txid, fetchImpl = fetch }) {
  if (gateway === 'bravopay') return bravoStatus(config, txid, fetchImpl);
  let endpoint;
  if (gateway === 'paradise') {
    endpoint = `${baseUrl(config)}/api/v1/query.php?action=get_transaction&id=${encodeURIComponent(txid)}`;
  } else if (gateway === 'atomopay') {
    const url = new URL(`${baseUrl(config)}/transactions/${encodeURIComponent(txid)}`);
    url.searchParams.set('api_token', pickText(config.apiToken, config.apiKey));
    endpoint = url.toString();
  } else {
    endpoint = `${baseUrl(config)}/transactions/${encodeURIComponent(txid)}`;
  }
  return fetchJson(endpoint, { method: 'GET', headers: providerHeaders(gateway, config) }, config.timeoutMs, fetchImpl);
}

function escapeFilter(value) {
  return encodeURIComponent(String(value || '').replace(/[,*()]/g, ''));
}

export async function findLeadBySession(sessionId) {
  const clean = text(sessionId, 80);
  if (!clean) return null;
  const result = await supabaseFetch(`${LEADS_TABLE}?session_id=eq.${escapeFilter(clean)}&select=*&limit=1`);
  if (result.missing) throw new Error('missing_supabase_config');
  if (!result.ok) throw new Error('lead_lookup_failed');
  return Array.isArray(result.data) ? result.data[0] || null : null;
}

export async function findLeadByTxid(txid) {
  const clean = text(txid, 160);
  if (!clean) return null;
  const result = await supabaseFetch(`${LEADS_TABLE}?pix_txid=eq.${escapeFilter(clean)}&select=*&limit=1`);
  if (result.missing) throw new Error('missing_supabase_config');
  if (!result.ok) throw new Error('payment_lookup_failed');
  return Array.isArray(result.data) ? result.data[0] || null : null;
}

export function paymentFromLead(lead = {}) {
  return asObject(asObject(lead.payload).payment);
}

export function publicPayment(payment = {}) {
  return {
    orderId: pickText(payment.orderId, payment.externalId),
    txid: pickText(payment.txid),
    gateway: pickText(payment.gateway),
    status: canonicalPaymentStatus(payment.status, payment.gateway),
    statusRaw: pickText(payment.statusRaw),
    amountCents: Number(payment.amountCents || 0),
    currency: 'BRL',
    offer: asObject(payment.offer),
    paymentCode: pickText(payment.paymentCode),
    paymentCodeBase64: pickText(payment.paymentCodeBase64),
    paymentQrUrl: pickText(payment.paymentQrUrl),
    createdAt: pickText(payment.createdAt),
    expiresAt: pickText(payment.expiresAt),
    paidAt: pickText(payment.paidAt),
    purchaseEventId: pickText(payment.purchaseEventId),
  };
}

export async function savePayment({ lead, sessionId, payment, req, customer = null, utm = null, event = '' }) {
  const now = new Date().toISOString();
  const existingPayload = asObject(lead?.payload);
  const payload = {
    ...existingPayload,
    ...(customer ? { personal: { ...asObject(existingPayload.personal), ...customerSnapshot(customer) } } : {}),
    ...(utm ? { utm: { ...asObject(existingPayload.utm), ...trackingSnapshot(utm) } } : {}),
    payment,
  };
  const record = {
    stage: 'checkout',
    last_event: event || `pix_${canonicalPaymentStatus(payment.status, payment.gateway)}`,
    gateway: payment.gateway,
    pix_txid: payment.txid,
    pix_amount: Number(payment.amountCents || 0) / 100,
    updated_at: now,
    payload,
  };
  if (lead?.session_id) {
    const result = await supabaseFetch(`${LEADS_TABLE}?session_id=eq.${escapeFilter(lead.session_id)}`, {
      method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify(record),
    });
    if (!result.ok) throw new Error('lead_payment_update_failed');
    return Array.isArray(result.data) ? result.data[0] || { ...lead, ...record } : { ...lead, ...record };
  }
  const person = customerSnapshot(customer || {});
  const tracking = trackingSnapshot(utm || {});
  const insert = await supabaseFetch(`${LEADS_TABLE}?on_conflict=session_id`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
    body: JSON.stringify([{ session_id: text(sessionId, 80), name: person.name, cpf: person.cpf, email: person.email, phone: person.phone,
      utm_source: tracking.utm_source || tracking.src || null, utm_medium: tracking.utm_medium || null,
      utm_campaign: tracking.utm_campaign || tracking.sck || null, utm_term: tracking.utm_term || null,
      utm_content: tracking.utm_content || null, fbclid: tracking.fbclid || null, ttclid: tracking.ttclid || null,
      gclid: tracking.gclid || null, source_url: text(req?.headers?.referer, 300), user_agent: text(req?.headers?.['user-agent'], 300),
      client_ip: text(clientIp(req), 80), created_at: now, ...record }]),
  });
  if (!insert.ok) throw new Error('lead_payment_insert_failed');
  return Array.isArray(insert.data) ? insert.data[0] || record : record;
}

function utmfyOrder(status, payment, lead = {}, config = {}) {
  const payload = asObject(lead.payload);
  const customer = { ...asObject(payload.personal), ...asObject(payment.customer) };
  const utm = asObject(payload.utm);
  return {
    orderId: payment.txid || payment.orderId,
    platform: pickText(config.platform) || 'Rockstar GTA VI',
    paymentMethod: 'pix',
    status,
    createdAt: utmfyDate(payment.createdAt),
    approvedDate: status === 'paid' ? utmfyDate(payment.paidAt || Date.now()) : null,
    refundedAt: status === 'refunded' ? utmfyDate(Date.now()) : null,
    customer: { name: customer.name || lead.name || '', email: customer.email || lead.email || '', phone: customer.phone || lead.phone || null,
      document: customer.cpf || lead.cpf || null, country: 'BR', ip: lead.client_ip || null },
    products: [{ id: payment.offer?.id || 'offer', name: payment.offer?.title || pickText(config.productName) || 'Oferta', planId: null, planName: null,
      quantity: 1, priceInCents: Number(payment.amountCents || 0) }],
    trackingParameters: { src: utm.src || null, sck: utm.sck || null, utm_source: utm.utm_source || null,
      utm_campaign: utm.utm_campaign || null, utm_medium: utm.utm_medium || null,
      utm_content: utm.utm_content || null, utm_term: utm.utm_term || null },
    commission: { totalPriceInCents: Number(payment.amountCents || 0), gatewayFeeInCents: 0,
      userCommissionInCents: Number(payment.amountCents || 0), currency: 'BRL' },
  };
}

function utmfyDate(value) {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

export async function dispatchUtmfy(settings, status, payment, lead = {}) {
  const config = asObject(settings.utmfy);
  if (!config.enabled || !pickText(config.endpoint)) return { ok: true, skipped: true };
  const endpoint = pickText(config.endpoint);
  const headers = { 'Content-Type': 'application/json' };
  if (pickText(config.apiKey)) {
    if (/utmify\.com\.br/i.test(endpoint)) headers['x-api-token'] = pickText(config.apiKey);
    else headers.Authorization = `Bearer ${pickText(config.apiKey)}`;
  }
  let last = { ok: false, error: 'utmfy_unknown_error' };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const result = await fetchJson(endpoint, { method: 'POST', headers, body: JSON.stringify(utmfyOrder(status, payment, lead, config)) }, config.timeoutMs || 10000);
      last = { ok: Boolean(result.response?.ok), status: result.response?.status || 0 };
      if (last.ok || (last.status > 0 && last.status < 500 && last.status !== 408 && last.status !== 429)) return last;
    } catch (error) {
      last = { ok: false, error: error?.message || 'utmfy_network_error' };
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }
  return last;
}

function sha(value) {
  return crypto.createHash('sha256').update(String(value || '').trim().toLowerCase()).digest('hex');
}

export async function dispatchMetaPurchase(settings, payment, lead = {}) {
  const config = asObject(settings.tracking);
  if (!config.serverEvents || !pickText(config.metaPixel) || !pickText(config.metaAccessToken)) return { ok: true, skipped: true };
  const payload = asObject(lead.payload);
  const customer = { ...asObject(payload.personal), ...asObject(payment.customer) };
  const eventId = payment.purchaseEventId || `purchase_${sha(payment.txid).slice(0, 24)}`;
  const userData = {
    external_id: [sha(lead.session_id || payment.orderId)],
    ...(customer.email ? { em: [sha(customer.email)] } : {}),
    ...(customer.phone ? { ph: [sha(customer.phone)] } : {}),
    ...(lead.client_ip ? { client_ip_address: lead.client_ip } : {}),
    ...(lead.user_agent ? { client_user_agent: lead.user_agent } : {}),
  };
  const event = { event_name: 'Purchase', event_time: Math.floor(Date.now() / 1000), event_id: eventId,
    action_source: 'website', event_source_url: lead.source_url || resolveOrigin(null), user_data: userData,
    custom_data: { value: Number(payment.amountCents || 0) / 100, currency: 'BRL', order_id: payment.txid,
      content_ids: [payment.offer?.id || 'offer'], content_name: payment.offer?.title || 'Oferta', content_type: 'product' } };
  const version = String(process.env.META_GRAPH_API_VERSION || 'v24.0').replace(/[^v0-9.]/gi, '') || 'v24.0';
  const endpoint = `https://graph.facebook.com/${version}/${encodeURIComponent(pickText(config.metaPixel))}/events?access_token=${encodeURIComponent(pickText(config.metaAccessToken))}`;
  let last = { ok: false, eventId, error: 'meta_unknown_error' };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const result = await fetchJson(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: [event] }) }, 10000);
      last = { ok: Boolean(result.response?.ok), status: result.response?.status || 0, eventId };
      if (last.ok || (last.status > 0 && last.status < 500 && last.status !== 408 && last.status !== 429)) return last;
    } catch (error) {
      last = { ok: false, eventId, error: error?.message || 'meta_network_error' };
    }
    if (attempt < 2) await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
  }
  return last;
}

export async function settleCheckoutSideEffects(jobs = [], budgetMs = 1800) {
  const pending = jobs.filter(Boolean).map((job) => Promise.resolve(job).catch(() => null));
  if (!pending.length) return;
  let timer;
  await Promise.race([
    Promise.allSettled(pending),
    new Promise((resolve) => { timer = setTimeout(resolve, Math.max(100, Number(budgetMs) || 1800)); }),
  ]);
  clearTimeout(timer);
}

export async function applyPaymentStatus({ settings, lead, statusRaw, gateway, source = 'status' }) {
  const previous = paymentFromLead(lead);
  const status = canonicalPaymentStatus(statusRaw, gateway || previous.gateway);
  if (!previous.txid) throw new Error('payment_not_found');
  if (TERMINAL_STATUSES.has(canonicalPaymentStatus(previous.status, previous.gateway)) && status === 'waiting_payment') {
    return { lead, payment: previous, changed: false };
  }
  const now = new Date().toISOString();
  const payment = { ...previous, gateway: gateway || previous.gateway, status, statusRaw: pickText(statusRaw),
    statusUpdatedAt: now, statusSource: source,
    ...(status === 'paid' && !previous.paidAt ? { paidAt: now, purchaseEventId: `purchase_${sha(previous.txid).slice(0, 24)}` } : {}),
    ...(status === 'refunded' && !previous.refundedAt ? { refundedAt: now } : {}),
  };
  const changed = canonicalPaymentStatus(previous.status, previous.gateway) !== status;
  const updatedLead = await savePayment({ lead, sessionId: lead.session_id, payment, event: status === 'paid' ? 'pix_confirmed' : `pix_${status}` });
  if (changed) {
    await settleCheckoutSideEffects([
      dispatchUtmfy(settings, status, payment, updatedLead),
      status === 'paid' ? dispatchMetaPurchase(settings, payment, updatedLead) : null,
    ]);
  }
  return { lead: updatedLead, payment, changed };
}

export function verifyWebhook(req, gateway, config, rawBody = '') {
  const supplied = pickText(req?.query?.token, new URL(req?.url || '/', 'https://local.test').searchParams.get('token'),
    req?.headers?.['x-webhook-token'], req?.headers?.['x-api-key']);
  const token = pickText(config.webhookToken);
  if (token) {
    const a = Buffer.from(supplied);
    const b = Buffer.from(token);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  }
  if (gateway === 'bravopay' && pickText(config.webhookSecret)) {
    const signature = pickText(req?.headers?.['x-bravopay-signature'], req?.headers?.['x-signature']);
    if (!/^[a-f0-9]{64}$/i.test(signature)) return false;
    const expected = crypto.createHmac('sha256', pickText(config.webhookSecret)).update(rawBody).digest('hex');
    const a = Buffer.from(signature, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  }
  return true;
}

export function newOrderReference(sessionId, offerId) {
  const session = String(sessionId || '').replace(/[^a-zA-Z0-9]/g, '').slice(-20);
  const random = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
  return `gta_${offerId}_${session || 'session'}_${random}`.slice(0, 80);
}

export function paymentExpired(payment = {}) {
  const expiresAt = Date.parse(payment.expiresAt || '');
  return !Number.isFinite(expiresAt) || expiresAt <= Date.now();
}
