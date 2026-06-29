import { ensureAllowedRequest, requireAdmin, sendJson, supabaseFetch } from '../_utils.js';

function cleanSearch(value) {
  return String(value || '').trim().replace(/[%(),]/g, '').slice(0, 80);
}

export default async function handler(req, res) {
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  if (!requireAdmin(req, res)) return;

  const limit = Math.min(Math.max(Number(req.query?.limit) || 50, 1), 200);
  const offset = Math.max(Number(req.query?.offset) || 0, 0);
  const q = cleanSearch(req.query?.q);
  const params = new URLSearchParams({
    select: '*',
    order: 'updated_at.desc',
    limit: String(limit),
    offset: String(offset)
  });
  if (q) params.set('or', `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,cpf.ilike.%${q}%`);

  let result = await supabaseFetch(`leads_readable?${params.toString()}`);
  if (!result.ok && !result.missing) {
    result = await supabaseFetch(`leads?${params.toString()}`);
  }

  if (result.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!result.ok) return sendJson(res, 502, { error: 'Falha ao buscar leads.', detail: result.detail });
  sendJson(res, 200, { data: Array.isArray(result.data) ? result.data : [] });
}
