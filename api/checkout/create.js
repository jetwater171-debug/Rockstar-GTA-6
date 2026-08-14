import { readJson, sendJson } from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';
import { createProductionCheckout } from '../../lib/shared-commerce-adapter.js';

export default async function handler(req, res) {
  res.setHeader('X-Checkout-Mode', 'production');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Metodo nao permitido.' });
  }
  if (!await ensureNotBlocked(req, res)) return;
  if (!String(req.headers?.['content-type'] || '').toLowerCase().includes('application/json')) {
    return sendJson(res, 415, { error: 'Envie o corpo como JSON.' });
  }
  if (Number(req.headers?.['content-length'] || 0) > 32 * 1024) {
    return sendJson(res, 413, { error: 'Corpo da requisicao muito grande.' });
  }
  const body = await readJson(req);
  try {
    const result = await createProductionCheckout(req, body);
    return sendJson(res, result.statusCode, result.payload);
  } catch (error) {
    return sendJson(res, 500, { error: 'Falha interna ao gerar o PIX.', code: error?.message || 'shared_core_error' });
  }
}
