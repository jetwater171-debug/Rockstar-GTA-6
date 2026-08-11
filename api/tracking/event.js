import crypto from 'node:crypto';
import { clientIp, ensureAllowedRequest, readJson, sendJson, supabaseFetch, text } from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';

const EVENT_NAMES = new Map([
  ['pageview', 'PageView'],
  ['quiz_started', 'ViewContent'],
  ['quiz_completed', 'Lead'],
  ['personal_submitted', 'CompleteRegistration'],
  ['personal_data_submitted', 'CompleteRegistration'],
  ['offer_selected', 'InitiateCheckout'],
  ['purchase', 'Purchase']
]);

function sha(value) {
  return crypto.createHash('sha256').update(String(value || '').trim().toLowerCase()).digest('hex');
}

async function loadTracking() {
  const result = await supabaseFetch('app_settings?key=eq.admin_config&select=value&limit=1');
  const row = result.ok && Array.isArray(result.data) ? result.data[0] : null;
  return row?.value?.tracking || {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Método não permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: true })) return;
  if (!await ensureNotBlocked(req, res)) return;

  const body = await readJson(req);
  const tracking = await loadTracking();
  if (!tracking.serverEvents || !tracking.metaPixel || !tracking.metaAccessToken) {
    return sendJson(res, 202, { ok: true, skipped: true, reason: 'server_tracking_disabled' });
  }

  const rawName = String(body.name || '').trim().toLowerCase();
  const eventName = EVENT_NAMES.get(rawName) || text(body.name, 80);
  const sessionId = text(body.sessionId || body.session_id, 100);
  if (!eventName || !sessionId) return sendJson(res, 400, { error: 'Evento invalido.' });
  const eventId = text(body.eventId, 120) || `${rawName || 'event'}_${sha(sessionId).slice(0, 24)}`;
  const custom = body.data && typeof body.data === 'object' ? body.data : {};
  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    action_source: 'website',
    event_source_url: text(body.sourceUrl, 500),
    user_data: {
      client_ip_address: text(clientIp(req), 100),
      client_user_agent: text(req.headers?.['user-agent'], 500),
      external_id: [sha(sessionId)]
    },
    custom_data: custom
  };
  const graphVersion = String(process.env.META_GRAPH_API_VERSION || 'v24.0').replace(/[^v0-9.]/gi, '') || 'v24.0';
  const endpoint = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(String(tracking.metaPixel).trim())}/events?access_token=${encodeURIComponent(String(tracking.metaAccessToken).trim())}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: [event] }),
      signal: controller.signal
    });
    const detail = await response.text().catch(() => '');
    if (!response.ok) return sendJson(res, 502, { ok: false, error: 'Meta CAPI recusou o evento.', detail: detail.slice(0, 500) });
    return sendJson(res, 200, { ok: true, eventId });
  } catch (error) {
    return sendJson(res, 502, { ok: false, error: error?.name === 'AbortError' ? 'Timeout no Meta CAPI.' : 'Falha de rede no Meta CAPI.' });
  } finally {
    clearTimeout(timer);
  }
}
