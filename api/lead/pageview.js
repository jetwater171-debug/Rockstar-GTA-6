import { ensureAllowedRequest, readJson, sendJson, supabaseFetch, text } from '../../lib/api-utils.js';

function normalizePage(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 80);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo nao permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: true })) return;

  const body = await readJson(req);
  const sessionId = text(body.sessionId || body.session_id, 80);
  const page = normalizePage(body.page);
  if (!sessionId || !page) return sendJson(res, 400, { error: 'Dados incompletos.' });

  const result = await supabaseFetch('lead_pageviews', {
    method: 'POST',
    headers: { Prefer: 'resolution=ignore-duplicates,return=minimal' },
    body: JSON.stringify([{ session_id: sessionId, page }])
  });

  if (result.missing) return sendJson(res, 202, { ok: false, reason: result.detail });
  if (!result.ok) return sendJson(res, 502, { ok: false, error: 'Falha ao registrar pagina.', detail: result.detail });
  sendJson(res, 200, { ok: true });
}
