import { ensureAllowedRequest, issueSessionCookie, sendJson } from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo nao permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  if (!await ensureNotBlocked(req, res)) return;
  issueSessionCookie(req, res);
  sendJson(res, 200, { ok: true });
}
