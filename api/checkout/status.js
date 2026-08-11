import { ensureAllowedRequest, readJson, sendJson, text } from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';
import {
  applyPaymentStatus,
  findLeadBySession,
  getGatewayTransaction,
  loadCheckoutSettings,
  normalizePixResponse,
  paymentFromLead,
  publicPayment,
} from '../../lib/checkout-payments.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Método não permitido.' });
  }
  if (!ensureAllowedRequest(req, res, { requireSession: true })) return;
  if (!await ensureNotBlocked(req, res)) return;
  if (Number(req.headers?.['content-length'] || 0) > 8 * 1024) return sendJson(res, 413, { error: 'Corpo da requisição muito grande.' });
  const body = await readJson(req);
  const sessionId = text(body?.sessionId || body?.session_id, 80);
  const txid = text(body?.txid, 160);
  if (!sessionId || !txid) return sendJson(res, 400, { error: 'Sessão ou transação ausente.' });
  let lead;
  try { lead = await findLeadBySession(sessionId); } catch (_error) {
    return sendJson(res, 503, { error: 'Registro de pagamentos indisponível.' });
  }
  const payment = paymentFromLead(lead);
  if (!lead || !payment.txid || payment.txid !== txid) return sendJson(res, 404, { error: 'Pagamento não encontrado.' });
  if (['paid', 'refunded', 'chargedback', 'refused'].includes(payment.status)) {
    return sendJson(res, 200, { ok: true, payment: publicPayment(payment) });
  }
  let settings;
  try { settings = await loadCheckoutSettings(); } catch (_error) {
    return sendJson(res, 503, { error: 'Configuração de pagamentos indisponível.' });
  }
  const config = settings.gateways?.[payment.gateway];
  if (!config) return sendJson(res, 503, { error: 'Gateway do pagamento não está mais configurado.' });
  try {
    const result = await getGatewayTransaction({ gateway: payment.gateway, config, txid });
    if (!result.response?.ok) return sendJson(res, 202, { ok: true, pending: true, payment: publicPayment(payment) });
    const parsed = normalizePixResponse(result.data || {});
    const applied = await applyPaymentStatus({ settings, lead, statusRaw: parsed.statusRaw, gateway: payment.gateway, source: 'polling' });
    return sendJson(res, 200, { ok: true, payment: publicPayment(applied.payment), changed: applied.changed });
  } catch (_error) {
    return sendJson(res, 202, { ok: true, pending: true, payment: publicPayment(payment) });
  }
}
