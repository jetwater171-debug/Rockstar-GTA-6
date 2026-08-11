import { clearAdminCookie, ensureAllowedRequest, sendJson } from '../../lib/api-utils.js';
import { auditAdmin } from '../../lib/admin-audit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Método não permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  clearAdminCookie(res);
  await auditAdmin(req, 'admin_logout');
  sendJson(res, 200, { ok: true });
}
