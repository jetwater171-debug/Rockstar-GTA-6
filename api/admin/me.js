import { ensureAllowedRequest, sendJson, verifyAdminCookie } from '../../lib/api-utils.js';

export default function handler(req, res) {
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  if (!verifyAdminCookie(req)) return sendJson(res, 401, { ok: false });
  sendJson(res, 200, { ok: true });
}
