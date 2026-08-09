import { clientIp, supabaseFetch } from './api-utils.js';

const CACHE_TTL_MS = 30_000;
let cache = { entries: [], loadedAt: 0 };

function normalizeIp(value) {
  return String(value || '').trim().toLowerCase().replace(/^::ffff:/, '').slice(0, 80);
}

export function isValidIp(value) {
  const ip = normalizeIp(value);
  if (!ip) return false;
  if (/^(?:\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
    return ip.split('.').every((part) => Number(part) >= 0 && Number(part) <= 255);
  }
  return /^[0-9a-f:]+$/i.test(ip) && ip.includes(':');
}

export async function getIpBlacklist({ force = false } = {}) {
  if (!force && Date.now() - cache.loadedAt < CACHE_TTL_MS) return { ok: true, entries: cache.entries, cached: true };
  const result = await supabaseFetch('app_settings?key=eq.ip_blacklist&select=value,updated_at&limit=1');
  if (!result.ok) return { ok: false, missing: result.missing, detail: result.detail, entries: cache.entries };
  const row = Array.isArray(result.data) ? result.data[0] : null;
  const entries = Array.isArray(row?.value?.entries) ? row.value.entries : [];
  cache = { entries, loadedAt: Date.now() };
  return { ok: true, entries, updatedAt: row?.updated_at || null };
}

export function invalidateIpBlacklistCache() {
  cache.loadedAt = 0;
}

export async function findBlockedIp(req) {
  const ip = normalizeIp(clientIp(req));
  const loaded = await getIpBlacklist();
  if (!loaded.ok) return { ok: false, ip, blocked: false, detail: loaded.detail };
  const entry = loaded.entries.find((item) => normalizeIp(item?.ip) === ip) || null;
  return { ok: true, ip, blocked: Boolean(entry), entry };
}

export async function ensureNotBlocked(req, res) {
  const result = await findBlockedIp(req);
  if (!result.ok || !result.blocked) return true;
  res.statusCode = 403;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify({ error: 'Acesso bloqueado.', code: 'ip_blocked' }));
  return false;
}
