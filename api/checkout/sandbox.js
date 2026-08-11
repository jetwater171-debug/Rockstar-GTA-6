import crypto from 'node:crypto';
import {
  ensureAllowedRequest,
  readJson,
  sendJson,
} from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';
import { publicCheckoutOffer } from '../../lib/checkout-catalog.js';

const MAX_BODY_BYTES = 8 * 1024;
const DEMO_TTL_MS = 15 * 60 * 1000;

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
}

function normalizedString(value, maxLength) {
  if (typeof value !== 'string') return '';
  return value.normalize('NFKC').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function cleanName(value) {
  return normalizedString(value, 120);
}

function validName(value) {
  if (value.length < 3 || value.length > 120) return false;
  if (!/^[\p{L}\p{M} .\-'’]+$/u.test(value)) return false;
  return (value.match(/\p{L}/gu) || []).length >= 2;
}

function cleanEmail(value) {
  return normalizedString(value, 254).toLowerCase();
}

function validEmail(value) {
  if (!value || value.length > 254 || /[\s\p{Cc}\p{Cf}]/u.test(value)) return false;
  const parts = value.split('@');
  if (parts.length !== 2) return false;
  const [local, domain] = parts;
  if (!local || local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return false;
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i.test(local)) return false;
  if (!domain || domain.length > 253 || !domain.includes('.')) return false;
  const labels = domain.split('.');
  return labels.every((label) => (
    label.length >= 1
    && label.length <= 63
    && /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  ));
}

function cleanPhone(value) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  const raw = String(value).normalize('NFKC').trim();
  if (!raw || /[^0-9+().\-\s]/.test(raw)) return '';
  let phone = raw.replace(/\D/g, '');
  if ((phone.length === 12 || phone.length === 13) && phone.startsWith('55')) phone = phone.slice(2);
  return phone;
}

function validPhone(value) {
  return /^[1-9]\d(?:9\d{8}|[2-5]\d{7})$/.test(value);
}

function cleanCustomer(input) {
  const customer = asObject(input);
  if (!customer) return null;
  return {
    name: cleanName(customer.name),
    email: cleanEmail(customer.email),
    phone: cleanPhone(customer.phone),
  };
}

function validateCustomer(customer) {
  if (!customer || !validName(customer.name)) return 'Informe seu nome completo.';
  if (!validEmail(customer.email)) return 'Informe um e-mail válido.';
  if (!validPhone(customer.phone)) return 'Informe um número com DDD.';
  return '';
}

function demoCode(orderId, amountCents) {
  return `DEMO-PIX-${orderId.slice(5, 17).toUpperCase()}-${amountCents}-NAO-PAGAR`;
}

function hasJsonContentType(req) {
  const value = String(req.headers?.['content-type'] || '').split(';')[0].trim().toLowerCase();
  return value === 'application/json' || (value.startsWith('application/') && value.endsWith('+json'));
}

function declaredBodyTooLarge(req) {
  const raw = String(req.headers?.['content-length'] || '').trim();
  if (!raw) return false;
  const length = Number(raw);
  return Number.isFinite(length) && length > MAX_BODY_BYTES;
}

function serializedBodySize(body) {
  try {
    return Buffer.byteLength(JSON.stringify(body), 'utf8');
  } catch (_error) {
    return Number.POSITIVE_INFINITY;
  }
}

export function createCheckoutSandboxHandler({
  checkNotBlocked = ensureNotBlocked,
  randomUUID = () => crypto.randomUUID(),
  now = () => Date.now(),
} = {}) {
  return async function checkoutSandboxHandler(req, res) {
    res.setHeader('X-Checkout-Mode', 'sandbox');
    if (req.method !== 'POST') {
      res.setHeader('Allow', 'POST');
      return sendJson(res, 405, { error: 'Método não permitido.' });
    }
    if (!ensureAllowedRequest(req, res, { requireSession: true })) return;
    if (!await checkNotBlocked(req, res)) return;
    if (!hasJsonContentType(req)) return sendJson(res, 415, { error: 'Envie os dados em JSON.' });
    if (declaredBodyTooLarge(req)) return sendJson(res, 413, { error: 'Dados excedem o limite permitido.' });

    let parsedBody;
    try {
      parsedBody = await readJson(req);
    } catch (_error) {
      return sendJson(res, 400, { error: 'Corpo JSON inválido.' });
    }
    const body = asObject(parsedBody);
    if (!body) return sendJson(res, 400, { error: 'Corpo JSON inválido.' });
    if (serializedBodySize(body) > MAX_BODY_BYTES) return sendJson(res, 413, { error: 'Dados excedem o limite permitido.' });
    const offer = publicCheckoutOffer(body.offerId);
    if (!offer) return sendJson(res, 400, { error: 'Oferta inválida. Volte e selecione uma opção.' });

    const customer = cleanCustomer(body.customer);
    const customerError = validateCustomer(customer);
    if (customerError) return sendJson(res, 400, { error: customerError });

    const uuid = String(randomUUID()).replace(/[^a-f0-9]/gi, '').toLowerCase();
    if (uuid.length !== 32) return sendJson(res, 503, { error: 'Não foi possível iniciar a simulação.' });
    const orderId = `demo_${uuid}`;
    const createdAt = new Date(Number(now()));
    if (Number.isNaN(createdAt.getTime())) return sendJson(res, 503, { error: 'Não foi possível iniciar a simulação.' });
    const expiresAt = new Date(createdAt.getTime() + DEMO_TTL_MS);

    return sendJson(res, 200, {
      ok: true,
      sandbox: true,
      mode: 'sandbox',
      notice: 'SIMULAÇÃO: nenhum pagamento ou pedido real foi criado.',
      order: {
        id: orderId,
        status: 'demo_pending',
        offer,
        createdAt: createdAt.toISOString(),
      },
      pix: {
        copyPaste: demoCode(orderId, offer.amountCents),
        expiresAt: expiresAt.toISOString(),
        isReal: false,
      },
    });
  };
}

export default createCheckoutSandboxHandler();
