import { ensureAllowedRequest, requireAdmin, sendJson, supabaseFetch } from '../../lib/api-utils.js';

export default async function handler(req, res) {
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  if (!requireAdmin(req, res)) return;

  let result = await supabaseFetch('pageview_counts?select=*');
  if (!result.ok && !result.missing) {
    result = await supabaseFetch('lead_pageviews?select=*');
  }

  if (result.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!result.ok) return sendJson(res, 502, { error: 'Falha ao buscar paginas.', detail: result.detail });
  sendJson(res, 200, { data: Array.isArray(result.data) ? result.data : [] });
}
