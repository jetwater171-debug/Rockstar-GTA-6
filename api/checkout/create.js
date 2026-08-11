import {
  ensureAllowedRequest,
  readJson,
  sendJson,
  text,
} from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';
import { checkoutOffer, publicCheckoutOffer } from '../../lib/checkout-catalog.js';
import {
  buildGatewayPayload,
  createGatewayTransaction,
  dispatchUtmfy,
  enabledGatewayOrder,
  findLeadBySession,
  getGatewayTransaction,
  loadCheckoutSettings,
  newOrderReference,
  normalizePixResponse,
  paymentExpired,
  paymentFromLead,
  pickText,
  publicPayment,
  savePayment,
  settleCheckoutSideEffects,
  validCpf,
} from '../../lib/checkout-payments.js';

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function validEmail(value) {
  const email = String(value || '').trim().toLowerCase();
  if (!email || email.length > 254 || /\s/.test(email)) return false;
  const [local, domain, extra] = email.split('@');
  return !extra && Boolean(local) && Boolean(domain) && domain.includes('.');
}

function validateCustomer(value) {
  const customer = asObject(value);
  const name = pickText(customer.name).replace(/\s+/g, ' ').slice(0, 160);
  const email = pickText(customer.email).toLowerCase().slice(0, 180);
  const phone = String(customer.phone || '').replace(/\D/g, '').slice(0, 13);
  const cpf = String(customer.cpf || customer.document || '').replace(/\D/g, '').slice(0, 11);
  if (name.length < 3 || !validEmail(email) || !/^[1-9]\d{9,10}$/.test(phone) || !validCpf(cpf)) return null;
  return { name, email, phone, cpf };
}

function reusablePayment(lead, offer) {
  const payment = paymentFromLead(lead);
  if (!payment.txid || payment.offer?.id !== offer.id || Number(payment.amountCents) !== offer.amountCents) return null;
  if (payment.status === 'paid') return payment;
  if (payment.status !== 'waiting_payment' || paymentExpired(payment)) return null;
  if (!payment.paymentCode && !payment.paymentCodeBase64 && !payment.paymentQrUrl) return null;
  return payment;
}

async function hydratePix(gateway, config, txid) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (attempt) await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    const result = await getGatewayTransaction({ gateway, config, txid }).catch(() => null);
    if (!result?.response?.ok) continue;
    const parsed = normalizePixResponse(result.data || {});
    if (parsed.paymentCode || parsed.paymentCodeBase64 || parsed.paymentQrUrl) return parsed;
  }
  return {};
}

export default async function handler(req, res) {
  res.setHeader('X-Checkout-Mode', 'production');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }
  if (!ensureAllowedRequest(req, res, { requireSession: true })) return;
  if (!await ensureNotBlocked(req, res)) return;
  if (!String(req.headers?.['content-type'] || '').toLowerCase().includes('application/json')) {
    return sendJson(res, 415, { error: 'Envie o corpo como JSON.' });
  }
  if (Number(req.headers?.['content-length'] || 0) > 32 * 1024) {
    return sendJson(res, 413, { error: 'Corpo da requisição muito grande.' });
  }

  const body = asObject(await readJson(req));
  const offer = checkoutOffer(body.offerId);
  const customer = validateCustomer(body.customer);
  const sessionId = text(body.sessionId || body.session_id, 80);
  const utm = asObject(body.utm);
  if (!offer) return sendJson(res, 400, { error: 'Oferta inválida.' });
  if (!customer) return sendJson(res, 400, { error: 'Revise nome, e-mail, telefone e CPF.' });
  if (!sessionId) return sendJson(res, 400, { error: 'Sessão do checkout ausente.' });

  let settings;
  try {
    settings = await loadCheckoutSettings();
  } catch (error) {
    return sendJson(res, 503, { error: 'Configuração de pagamentos indisponível.', code: error?.message || 'settings_error' });
  }

  let lead;
  try {
    lead = await findLeadBySession(sessionId);
  } catch (_error) {
    return sendJson(res, 503, { error: 'Não foi possível preparar o registro do pedido.', code: 'lead_storage_unavailable' });
  }
  const reusable = reusablePayment(lead, offer);
  if (reusable) {
    return sendJson(res, 200, {
      ok: true,
      mode: 'production',
      reused: true,
      order: { id: reusable.orderId, status: reusable.status, offer: publicCheckoutOffer(offer.id), createdAt: reusable.createdAt },
      pix: { ...publicPayment(reusable), isReal: true },
    });
  }

  const candidates = enabledGatewayOrder(settings);
  if (!candidates.length) {
    return sendJson(res, 503, { error: 'Nenhum gateway habilitado e configurado no painel.', code: 'no_gateway_configured' });
  }

  const externalId = newOrderReference(sessionId, offer.id);
  const failures = [];
  for (const gateway of candidates) {
    const config = settings.gateways[gateway];
    const payload = buildGatewayPayload({ gateway, config, offer, customer, utm, externalId, req });
    try {
      const result = await createGatewayTransaction({ gateway, config, payload, idempotencyKey: externalId });
      if (!result.response?.ok || result.data?.success === false || result.data?.hasError === true || result.data?.error) {
        failures.push({ gateway, status: result.response?.status || 0,
          detail: pickText(result.data?.error?.message, result.data?.error, result.data?.message, 'gateway_rejected').slice(0, 240) });
        continue;
      }
      let parsed = normalizePixResponse(result.data || {});
      if (parsed.txid && !parsed.paymentCode && !parsed.paymentCodeBase64 && !parsed.paymentQrUrl) {
        const hydrated = await hydratePix(gateway, config, parsed.txid);
        parsed = { ...parsed, ...Object.fromEntries(Object.entries(hydrated).filter(([, value]) => value)) };
      }
      if (!parsed.txid || (!parsed.paymentCode && !parsed.paymentCodeBase64 && !parsed.paymentQrUrl)) {
        failures.push({ gateway, status: result.response?.status || 0, detail: !parsed.txid ? 'missing_txid' : 'missing_pix_visual' });
        continue;
      }

      const createdAt = new Date().toISOString();
      const expiresIn = Math.max(60, Math.min(86400, Number(config.expiresIn || 3600) || 3600));
      const payment = {
        orderId: externalId,
        externalId: parsed.externalId || externalId,
        txid: parsed.txid,
        gateway,
        status: 'waiting_payment',
        statusRaw: parsed.statusRaw || 'pending',
        amountCents: offer.amountCents,
        currency: 'BRL',
        offer: publicCheckoutOffer(offer.id),
        customer,
        paymentCode: parsed.paymentCode,
        paymentCodeBase64: parsed.paymentCodeBase64,
        paymentQrUrl: parsed.paymentQrUrl,
        createdAt,
        expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
        attempts: failures,
      };
      let updatedLead;
      for (let saveAttempt = 0; saveAttempt < 3 && !updatedLead; saveAttempt += 1) {
        if (saveAttempt) await new Promise((resolve) => setTimeout(resolve, 300 * saveAttempt));
        updatedLead = await savePayment({ lead, sessionId, payment, req, customer, utm, event: 'pix_created' }).catch(() => null);
      }
      if (!updatedLead) {
        return sendJson(res, 503, {
          error: 'O gateway criou a transação, mas o pedido não pôde ser registrado. Não gere outra cobrança agora; tente consultar novamente em instantes.',
          code: 'payment_persistence_failed',
          transaction: { gateway, txid: payment.txid, orderId: payment.orderId },
        });
      }
      await settleCheckoutSideEffects([dispatchUtmfy(settings, 'waiting_payment', payment, updatedLead)]);
      return sendJson(res, 200, {
        ok: true,
        mode: 'production',
        reused: false,
        order: { id: externalId, status: 'waiting_payment', offer: publicCheckoutOffer(offer.id), createdAt },
        pix: { ...publicPayment(payment), isReal: true },
      });
    } catch (error) {
      failures.push({ gateway, status: 0, detail: error?.name === 'AbortError' ? 'timeout' : (error?.message || 'network_error') });
    }
  }

  return sendJson(res, 502, {
    error: 'Não foi possível gerar o PIX nos gateways configurados.',
    code: 'all_gateways_failed',
    attempts: failures.map(({ gateway, status, detail }) => ({ gateway, status, detail })),
  });
}
