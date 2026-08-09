import { ensureAllowedRequest, LEADS_TABLE, requireAdmin, sendJson, supabaseFetch } from '../../lib/api-utils.js';

function cleanSearch(value) {
  return String(value || '').trim().replace(/[%(),]/g, '').slice(0, 80);
}

function cleanDate(value, endOfDay = false) {
  const raw = String(value || '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return '';
  return `${raw}T${endOfDay ? '23:59:59.999' : '00:00:00.000'}Z`;
}

export default async function handler(req, res) {
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  if (!requireAdmin(req, res)) return;

  const sessionId = String(req.query?.session_id || '').trim().slice(0, 100);
  if (sessionId) {
    const [leadResult, pageviewsResult] = await Promise.all([
      supabaseFetch(`${LEADS_TABLE}?session_id=eq.${encodeURIComponent(sessionId)}&select=*&limit=1`),
      supabaseFetch(`lead_pageviews?session_id=eq.${encodeURIComponent(sessionId)}&select=page,created_at&order=created_at.asc&limit=1000`)
    ]);
    if (leadResult.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
    if (!leadResult.ok) return sendJson(res, 502, { error: 'Falha ao carregar lead.', detail: leadResult.detail });
    const lead = Array.isArray(leadResult.data) ? leadResult.data[0] : null;
    if (!lead) return sendJson(res, 404, { error: 'Lead nao encontrado.' });
    const pageviews = pageviewsResult.ok && Array.isArray(pageviewsResult.data) ? pageviewsResult.data : [];
    return sendJson(res, 200, { ok: true, data: { ...lead, pageviews } });
  }

  const limit = Math.min(Math.max(Number(req.query?.limit) || 50, 1), 200);
  const offset = Math.max(Number(req.query?.offset) || 0, 0);
  const q = cleanSearch(req.query?.q);
  const from = cleanDate(req.query?.from);
  const to = cleanDate(req.query?.to, true);
  const params = new URLSearchParams({
    select: '*',
    order: 'updated_at.desc',
    limit: String(limit),
    offset: String(offset)
  });
  if (q) params.set('or', `name.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%,cpf.ilike.%${q}%`);
  if (from) params.set('updated_at', `gte.${from}`);
  if (to) params.append('updated_at', `lte.${to}`);

  let result = await supabaseFetch(`leads_readable?${params.toString()}`, { headers: { Prefer: 'count=exact' } });
  if (!result.ok && !result.missing) {
    result = await supabaseFetch(`leads?${params.toString()}`, { headers: { Prefer: 'count=exact' } });
  }

  if (result.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!result.ok) return sendJson(res, 502, { error: 'Falha ao buscar leads.', detail: result.detail });
  const data = Array.isArray(result.data) ? result.data : [];
  const contentRange = result.response?.headers?.get?.('content-range') || '';
  const total = Number(contentRange.split('/')[1]);
  sendJson(res, 200, {
    data,
    pagination: {
      limit,
      offset,
      returned: data.length,
      total: Number.isFinite(total) ? total : null,
      hasMore: data.length === limit && (!Number.isFinite(total) || offset + data.length < total)
    }
  });
}
