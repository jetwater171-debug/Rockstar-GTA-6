import { createRequire } from 'node:module';
import { ensureAllowedRequest, readJson, sendJson } from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';

const require = createRequire(import.meta.url);
const { upsertLead } = require('../../backend/shared-core/lib/lead-store.js');
const { sanitizeLeadPayload } = require('../../backend/shared-core/lib/lead-storage.js');
const { getSettings } = require('../../backend/shared-core/lib/settings-store.js');
const { enqueueDispatch, processDispatchQueue } = require('../../backend/shared-core/lib/dispatch-queue.js');
const { buildLeadTrackDispatchJobs } = require('../../backend/shared-core/lib/meta-capi.js');

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo nao permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: true })) return;
  if (!await ensureNotBlocked(req, res)) return;

  const body = sanitizeLeadPayload(await readJson(req));
  try {
    const result = await upsertLead(body, req).catch((error) => ({ ok: false, reason: 'lead_store_error', detail: error?.message || String(error) }));
    const settings = await getSettings().catch(() => ({}));
    const jobs = buildLeadTrackDispatchJobs(body, req, settings);
    const queued = await Promise.all(jobs.map((job) => enqueueDispatch(job).catch(() => null)));
    if (queued.some((item) => item?.ok || item?.fallback)) processDispatchQueue(6).catch(() => null);
    if (!result.ok) return sendJson(res, 202, { ok: false, reason: result.reason, detail: result.detail || '', trackingAttempted: jobs.length > 0 });
    return sendJson(res, 200, { ok: true });
  } catch (error) {
    return sendJson(res, 202, { ok: false, reason: 'track_internal_error', detail: error?.message || String(error) });
  }
}
