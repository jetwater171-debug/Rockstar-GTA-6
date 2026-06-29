import { ensureAllowedRequest, issueAdminCookie, readJson, sendJson, verifyAdminPassword } from '../../lib/api-utils.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo nao permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  const body = await readJson(req);
  if (!verifyAdminPassword(body.password || '')) return sendJson(res, 401, { error: 'Senha invalida.' });
  issueAdminCookie(res);
  sendJson(res, 200, { ok: true });
}
