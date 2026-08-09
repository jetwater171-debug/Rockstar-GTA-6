import { recordCloneEvent } from '../../lib/clone-detector.js';

const PIXEL = Buffer.from('R0lGODlhAQABAPAAAP///wAAACH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==', 'base64');

function sendPixel(res) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'image/gif');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.end(PIXEL);
}

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (_error) { return {}; }
  }
  return {};
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'GET' && req.method !== 'POST') return sendPixel(res);
  try {
    await recordCloneEvent({ ...body(req), ...(req.query || {}) }, req);
  } catch (error) {
    console.error('[clone-pixel] record failed', error);
  }
  sendPixel(res);
}
