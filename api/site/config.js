import { ensureAllowedRequest, sendJson, supabaseFetch } from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Método não permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  if (!await ensureNotBlocked(req, res)) return;

  const result = await supabaseFetch('app_settings?key=eq.admin_config&select=value,updated_at&limit=1');
  if (!result.ok) return sendJson(res, result.missing ? 503 : 502, { error: 'config_unavailable' });
  const row = Array.isArray(result.data) ? result.data[0] : null;
  const settings = asObject(row?.value);
  const tracking = asObject(settings.tracking);
  const funnel = asObject(settings.funnel);
  const backredirects = asObject(settings.backredirects);

  sendJson(res, 200, {
    tracking: {
      browserPixel: tracking.browserPixel !== false,
      serverEvents: tracking.serverEvents === true,
      metaPixel: String(tracking.metaPixel || '').trim(),
      metaBackupPixel: String(tracking.metaBackupPixel || '').trim(),
      tiktokPixel: String(tracking.tiktokPixel || '').trim(),
      googleTag: String(tracking.googleTag || '').trim()
    },
    features: {
      leadCaptureEnabled: funnel.leadCaptureEnabled !== false,
      backredirects: backredirects.enabled !== false
    },
    updatedAt: row?.updated_at || null
  });
}
