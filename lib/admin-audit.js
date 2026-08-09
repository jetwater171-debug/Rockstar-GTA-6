import { clientIp, supabaseFetch, text } from './api-utils.js';

export async function auditAdmin(req, action, detail = {}) {
  try {
    await supabaseFetch('admin_audit_logs', {
      method: 'POST',
      headers: { Prefer: 'return=minimal' },
      body: JSON.stringify([{
        action: text(action, 100),
        client_ip: text(clientIp(req), 100),
        user_agent: text(req.headers?.['user-agent'], 500),
        detail: detail && typeof detail === 'object' ? detail : { value: String(detail || '') }
      }])
    });
  } catch (_error) {}
}

export async function listAdminAudit(limit = 200) {
  const safeLimit = Math.min(Math.max(Number(limit) || 200, 1), 1000);
  return supabaseFetch(`admin_audit_logs?select=*&order=created_at.desc&limit=${safeLimit}`);
}
