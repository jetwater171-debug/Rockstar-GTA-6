import { readJson, sendJson } from '../../lib/api-utils.js';
import {
  CHECKOUT_GATEWAYS,
  applyPaymentStatus,
  findLeadByTxid,
  getGatewayTransaction,
  loadCheckoutSettings,
  normalizePixResponse,
  pickText,
  verifyWebhook,
} from '../../lib/checkout-payments.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }
  if (Number(req.headers?.['content-length'] || 0) > 256 * 1024) return sendJson(res, 413, { error: 'Webhook muito grande.' });
  const url = new URL(req.url || '/api/checkout/webhook', 'https://local.test');
  const gateway = pickText(req.query?.gateway, url.searchParams.get('gateway')).toLowerCase();
  if (!CHECKOUT_GATEWAYS.includes(gateway)) return sendJson(res, 400, { error: 'Gateway inválido.' });
  let settings;
  try { settings = await loadCheckoutSettings(); } catch (_error) {
    return sendJson(res, 503, { error: 'Configuração indisponível.' });
  }
  const body = await readJson(req);
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(body || {});
  const config = settings.gateways?.[gateway] || {};
  if (!verifyWebhook(req, gateway, config, rawBody)) return sendJson(res, 401, { error: 'Assinatura do webhook inválida.' });
  const parsed = normalizePixResponse(body || {});
  if (!parsed.txid) return sendJson(res, 400, { error: 'Transação ausente no webhook.' });
  let lead;
  try { lead = await findLeadByTxid(parsed.txid); } catch (_error) {
    return sendJson(res, 503, { error: 'Registro de pagamentos indisponível.' });
  }
  if (!lead) return sendJson(res, 202, { ok: true, ignored: true, reason: 'payment_not_found' });
  if (String(lead.gateway || '') !== gateway) return sendJson(res, 409, { error: 'Gateway não corresponde ao pagamento.' });
  let statusRaw = parsed.statusRaw;
  const authenticatedPayload = Boolean(pickText(config.webhookToken) || (gateway === 'bravopay' && pickText(config.webhookSecret)));
  if (!authenticatedPayload) {
    const verified = await getGatewayTransaction({ gateway, config, txid: parsed.txid }).catch(() => null);
    if (!verified?.response?.ok) return sendJson(res, 202, { ok: true, ignored: true, reason: 'provider_status_unavailable' });
    statusRaw = normalizePixResponse(verified.data || {}).statusRaw;
  }
  let applied;
  try {
    applied = await applyPaymentStatus({ settings, lead, statusRaw, gateway, source: 'webhook' });
  } catch (_error) {
    return sendJson(res, 503, { error: 'Não foi possível atualizar o pagamento.' });
  }
  return sendJson(res, 200, { ok: true, status: applied.payment.status, changed: applied.changed });
}
