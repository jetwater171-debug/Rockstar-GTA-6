import {
  adminLoginRateState,
  clearAdminLoginFailures,
  ensureAllowedRequest,
  issueAdminCookie,
  readJson,
  recordAdminLoginFailure,
  sendJson,
  verifyAdminPassword
} from '../../lib/api-utils.js';
import { auditAdmin } from '../../lib/admin-audit.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Método não permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  const rate = adminLoginRateState(req);
  if (!rate.allowed) {
    res.setHeader('Retry-After', String(rate.retryAfter));
    return sendJson(res, 429, { error: 'Muitas tentativas. Aguarde antes de tentar novamente.' });
  }
  const body = await readJson(req);
  if (!verifyAdminPassword(body.password || '')) {
    recordAdminLoginFailure(req);
    await auditAdmin(req, 'admin_login_failed');
    return sendJson(res, 401, { error: 'Senha inválida.' });
  }
  clearAdminLoginFailures(req);
  issueAdminCookie(req, res);
  await auditAdmin(req, 'admin_login_success');
  sendJson(res, 200, { ok: true });
}
