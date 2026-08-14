import { createRequire } from 'node:module';
import { ensureAllowedRequest, readJson, sendJson, text } from '../../lib/api-utils.js';
import { ensureNotBlocked } from '../../lib/ip-blacklist.js';

const require = createRequire(import.meta.url);
const { getSettings } = require('../../backend/shared-core/lib/settings-store.js');
const {
  buildLeadTrackDispatchJobs,
  buildPageViewDispatchJobs,
  buildPurchaseDispatchJobs,
} = require('../../backend/shared-core/lib/meta-capi.js');
const { enqueueDispatch, processDispatchQueue } = require('../../backend/shared-core/lib/dispatch-queue.js');

function asObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo nao permitido.' });
  if (!ensureAllowedRequest(req, res, { requireSession: true })) return;
  if (!await ensureNotBlocked(req, res)) return;

  const body = await readJson(req);
  const name = String(body.name || '').trim().toLowerCase();
  const sessionId = text(body.sessionId || body.session_id, 100);
  const eventId = text(body.eventId, 120);
  const sourceUrl = text(body.sourceUrl, 500);
  const data = asObject(body.data);
  if (!name || !sessionId) return sendJson(res, 400, { error: 'Evento invalido.' });

  const settings = await getSettings().catch(() => ({}));
  const context = {
    sessionId,
    eventId,
    sourceUrl,
    page: data.page || name,
    stage: data.stage || name,
    amount: Number(data.value || 0),
    orderId: data.order_id || '',
    txid: data.order_id || '',
    shipping: {
      id: Array.isArray(data.content_ids) ? data.content_ids[0] : '',
      name: data.content_name || '',
      price: Number(data.value || 0),
    },
    utm: asObject(data.utm),
  };

  let jobs = [];
  if (name === 'pageview') {
    jobs = buildPageViewDispatchJobs({ ...context, page: data.page || 'pageview', pageViewEventId: eventId }, req, settings);
  } else if (name === 'purchase') {
    jobs = buildPurchaseDispatchJobs({
      ...context,
      purchaseEventId: eventId,
      leadData: {
        session_id: sessionId,
        pix_txid: data.order_id || '',
        pix_amount: Number(data.value || 0),
        source_url: sourceUrl,
        payload: context,
      },
    }, settings);
  } else {
    const coreEvent = ['quiz_completed', 'personal_submitted', 'personal_data_submitted'].includes(name)
      ? 'personal_submitted'
      : name === 'add_payment_info'
        ? 'checkout_view'
        : name === 'offer_selected'
          ? 'pix_view'
          : 'processing_view';
    jobs = buildLeadTrackDispatchJobs({
      ...context,
      event: coreEvent,
      addPaymentInfoEventId: eventId,
      initiateCheckoutEventId: eventId,
      viewContentEventId: eventId,
    }, req, settings);
  }

  if (!jobs.length) return sendJson(res, 202, { ok: true, skipped: true, reason: 'server_tracking_disabled' });
  const queued = await Promise.all(jobs.map((job) => enqueueDispatch(job).catch((error) => ({ ok: false, reason: error?.message || 'queue_error' }))));
  if (queued.some((item) => item?.ok || item?.fallback)) processDispatchQueue(10).catch(() => null);
  return sendJson(res, 202, { ok: true, queued: queued.length, eventId });
}
