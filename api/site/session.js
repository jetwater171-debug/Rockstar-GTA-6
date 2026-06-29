import { ensureAllowedRequest, issueSessionCookie, sendJson } from '../../lib/api-utils.js';

export default function handler(req, res) {
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  issueSessionCookie(req, res);
  sendJson(res, 200, { ok: true });
}
