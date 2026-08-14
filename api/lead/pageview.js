import { createRequire } from 'node:module';
import { ensureAllowedRequest, readJson, sendJson, text } from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';

const require = createRequire(import.meta.url);
const { upsertLead } = require('../../backend/shared-core/lib/lead-store.js');
const { sanitizeDeviceContext } = require('../../backend/shared-core/lib/lead-storage.js');
const { upsertPageview } = require('../../backend/shared-core/lib/pageviews-store.js');
const { getSettings } = require('../../backend/shared-core/lib/settings-store.js');
const { enqueueDispatch, processDispatchQueue } = require('../../backend/shared-core/lib/dispatch-queue.js');
const { buildPageViewDispatchJobs } = require('../../backend/shared-core/lib/meta-capi.js');

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo nao permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: true })) return;
  if (!await ensureNotBlocked(req, res)) return;

  const body = await readJson(req);
  const sessionId = text(body.sessionId || body.session_id, 80);
  const page = String(body.page || '').trim().toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 80);
  const device = sanitizeDeviceContext(body.device);
  if (!sessionId || !page) return sendJson(res, 400, { error: 'Dados incompletos.' });

  try {
    const [result] = await Promise.all([
      upsertPageview(sessionId, page).catch((error) => ({ ok: false, reason: 'pageview_store_error', detail: error?.message || String(error) })),
      upsertLead({
        sessionId,
        event: 'pageview',
        eventId: body.pageViewEventId || body.eventId || '',
        stage: page,
        page,
        sourceUrl: body.sourceUrl || '',
        utm: body.utm || {},
        fbclid: body.fbclid || body?.utm?.fbclid || '',
        fbp: body.fbp || '',
        fbc: body.fbc || '',
        device,
      }, req).catch(() => null),
    ]);
    const settings = await getSettings().catch(() => ({}));
    const jobs = buildPageViewDispatchJobs({ ...body, sessionId, page }, req, settings);
    const queued = await Promise.all(jobs.map((job) => enqueueDispatch(job).catch(() => null)));
    if (queued.some((item) => item?.ok || item?.fallback)) processDispatchQueue(6).catch(() => null);
    if (!result.ok) return sendJson(res, 202, { ok: false, reason: result.reason, detail: result.detail || '', trackingAttempted: jobs.length > 0 });
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 202, { ok: false, reason: 'pageview_internal_error', detail: error?.message || String(error) });
  }
}
