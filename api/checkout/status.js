import { readJson, sendJson } from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';
import { queryProductionCheckout } from '../../lib/shared-commerce-adapter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Metodo nao permitido.' });
  }
  if (!await ensureNotBlocked(req, res)) return;
  if (Number(req.headers?.['content-length'] || 0) > 8 * 1024) {
    return sendJson(res, 413, { error: 'Corpo da requisicao muito grande.' });
  }
  const body = await readJson(req);
  try {
    const result = await queryProductionCheckout(req, body);
    return sendJson(res, result.statusCode, result.payload);
  } catch (error) {
    return sendJson(res, 202, { ok: true, pending: true, error: error?.message || 'status_unavailable' });
  }
}
