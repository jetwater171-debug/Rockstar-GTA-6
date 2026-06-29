import {
  LEADS_TABLE,
  clientIp,
  digits,
  ensureAllowedRequest,
  numberOrNull,
  readJson,
  sendJson,
  supabaseFetch,
  text
} from '../_utils.js';

function cleanObject(input = {}) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => value !== null && value !== undefined));
}

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function buildRecord(body, req) {
  const personal = asObject(body.personal);
  const quiz = asObject(body.quiz);
  const utm = asObject(body.utm);
  const now = new Date().toISOString();
  return cleanObject({
    session_id: text(body.sessionId || body.session_id, 80),
    stage: text(body.stage || 'dados', 60),
    last_event: text(body.event || body.lastEvent || 'lead_update', 80),
    name: text(personal.name || body.name, 160),
    cpf: digits(personal.cpf || body.cpf, 14),
    email: text(personal.email || body.email, 180),
    phone: digits(personal.phoneDigits || personal.phone || body.phone, 20),
    quiz_score: numberOrNull(quiz.score),
    quiz_total: numberOrNull(quiz.total),
    quiz_status: text(quiz.status, 80),
    utm_source: text(utm.utm_source || body.utm_source || utm.src || body.src, 120),
    utm_medium: text(utm.utm_medium || body.utm_medium, 120),
    utm_campaign: text(utm.utm_campaign || body.utm_campaign || utm.campaign || body.campaign || utm.sck || body.sck, 180),
    utm_term: text(utm.utm_term || body.utm_term || utm.term || body.term, 180),
    utm_content: text(utm.utm_content || body.utm_content || utm.content || body.content, 180),
    gclid: text(utm.gclid || body.gclid, 180),
    fbclid: text(utm.fbclid || body.fbclid, 180),
    ttclid: text(utm.ttclid || body.ttclid, 180),
    referrer: text(utm.referrer || body.referrer, 300),
    landing_page: text(utm.landing_page || body.landing_page, 300),
    source_url: text(body.sourceUrl, 300),
    user_agent: text(req.headers?.['user-agent'] || body.userAgent, 300),
    client_ip: text(clientIp(req), 80),
    updated_at: now,
    payload: body
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo nao permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: true })) return;

  const body = await readJson(req);
  const record = buildRecord(body, req);
  if (!record.session_id) return sendJson(res, 400, { ok: false, reason: 'missing_session_id' });
  if (!record.name && !record.email && !record.phone && !record.cpf && !record.quiz_score && !record.utm_source) {
    return sendJson(res, 202, { ok: false, reason: 'skipped_no_data' });
  }

  const result = await supabaseFetch(`${LEADS_TABLE}?on_conflict=session_id`, {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify([record])
  });

  if (result.missing) return sendJson(res, 202, { ok: false, reason: result.detail });
  if (!result.ok) return sendJson(res, 502, { ok: false, error: 'Falha ao salvar lead.', detail: result.detail });
  sendJson(res, 200, { ok: true });
}
