import crypto from 'node:crypto';

const SESSION_COOKIE = '__Host-gta_session';
const SESSION_COOKIE_FALLBACK = 'gta_session';
const ADMIN_COOKIE = '__Host-gta_admin';
const SESSION_TTL_SEC = Number(process.env.APP_SESSION_TTL_SEC || 60 * 60 * 3);
const ADMIN_TTL_SEC = Number(process.env.APP_ADMIN_TTL_SEC || 60 * 60 * 8);
const GUARD_SECRET = process.env.APP_GUARD_SECRET || 'change-this-secret-in-production';

export const SUPABASE_URL = process.env.SUPABASE_URL || process.env.SUPABASE_PROJECT_URL || '';
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE || '';
export const LEADS_TABLE = process.env.SUPABASE_LEADS_TABLE || 'leads';

export function sendJson(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export async function readJson(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch (_error) {
    return {};
  }
}

export function parseCookies(rawCookie = '') {
  const out = {};
  String(rawCookie)
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .forEach((part) => {
      const idx = part.indexOf('=');
      if (idx <= 0) return;
      out[decodeURIComponent(part.slice(0, idx))] = decodeURIComponent(part.slice(idx + 1));
    });
  return out;
}

function parseList(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeHost(rawHost) {
  const host = String(rawHost || '').split(',')[0].trim().toLowerCase();
  return host ? host.split(':')[0] : '';
}

function matchesRule(value, rule) {
  if (!value || !rule) return false;
  if (rule.startsWith('*.')) return value.endsWith(rule.slice(1));
  return value === rule;
}

function isAllowedHost(host) {
  const allowedHosts = parseList(process.env.APP_ALLOWED_HOSTS);
  if (!host) return false;
  if (!allowedHosts.length) return true;
  return allowedHosts.some((rule) => matchesRule(host, normalizeHost(rule)));
}

function isAllowedOrigin(origin, host) {
  if (!origin) return true;
  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch (_error) {
    return false;
  }
  const allowedOrigins = parseList(process.env.APP_ALLOWED_ORIGINS);
  const fullOrigin = `${originUrl.protocol}//${originUrl.host}`.toLowerCase();
  const originHost = normalizeHost(originUrl.host);
  if (!allowedOrigins.length) return originHost === host;
  return allowedOrigins.some((rule) => {
    if (rule.startsWith('http://') || rule.startsWith('https://')) return matchesRule(fullOrigin, rule);
    return matchesRule(originHost, normalizeHost(rule));
  });
}

function toBase64Url(input) {
  return Buffer.from(input).toString('base64url');
}

function fromBase64Url(input) {
  return Buffer.from(String(input || ''), 'base64url').toString('utf8');
}

function sign(input) {
  return crypto.createHmac('sha256', GUARD_SECRET).update(input).digest('base64url');
}

function uaHash(req) {
  const ua = String(req.headers?.['user-agent'] || '').slice(0, 250);
  return crypto.createHash('sha256').update(ua).digest('hex').slice(0, 32);
}

function makeCookie(name, token, ttl, sameSite = 'Lax') {
  const secure = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
  return `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=${sameSite}; Max-Age=${ttl}${secure ? '; Secure' : ''}`;
}

export function issueSessionCookie(req, res) {
  const host = normalizeHost(req.headers?.['x-forwarded-host'] || req.headers?.host);
  const payload = { h: host, ua: uaHash(req), t: Date.now() };
  const encoded = toBase64Url(JSON.stringify(payload));
  const token = `${encoded}.${sign(encoded)}`;
  const secure = String(process.env.NODE_ENV || '').toLowerCase() === 'production';
  res.setHeader('Set-Cookie', makeCookie(secure ? SESSION_COOKIE : SESSION_COOKIE_FALLBACK, token, SESSION_TTL_SEC));
  return token;
}

function verifySignedToken(token, maxAgeSec, extraCheck = () => true) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return false;
  const [encoded, signature] = token.split('.');
  const expected = sign(encoded);
  const receivedBuf = Buffer.from(signature || '', 'utf8');
  const expectedBuf = Buffer.from(expected || '', 'utf8');
  if (receivedBuf.length !== expectedBuf.length) return false;
  if (!crypto.timingSafeEqual(receivedBuf, expectedBuf)) return false;
  let payload;
  try {
    payload = JSON.parse(fromBase64Url(encoded));
  } catch (_error) {
    return false;
  }
  const issuedAt = Number(payload?.t || 0);
  if (!issuedAt || Date.now() - issuedAt > maxAgeSec * 1000) return false;
  return extraCheck(payload);
}

export function ensureAllowedRequest(req, res, { requireSession = false } = {}) {
  const host = normalizeHost(req.headers?.['x-forwarded-host'] || req.headers?.host);
  if (!isAllowedHost(host)) {
    sendJson(res, 403, { error: 'Host nao permitido.' });
    return false;
  }
  if (!isAllowedOrigin(req.headers?.origin, host)) {
    sendJson(res, 403, { error: 'Origem nao permitida.' });
    return false;
  }
  if (requireSession) {
    const cookies = parseCookies(req.headers?.cookie || '');
    const token = cookies[SESSION_COOKIE] || cookies[SESSION_COOKIE_FALLBACK] || '';
    const ok = verifySignedToken(token, SESSION_TTL_SEC, (payload) => payload.h === host && payload.ua === uaHash(req));
    if (!ok) {
      sendJson(res, 401, { error: 'Sessao invalida. Recarregue a pagina.' });
      return false;
    }
  }
  return true;
}

export function verifyAdminPassword(password) {
  const expected = String(process.env.APP_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS || 'Leo12345!').trim();
  const a = Buffer.from(String(password || '').trim(), 'utf8');
  const b = Buffer.from(expected, 'utf8');
  if (!expected || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function issueAdminCookie(res) {
  const payload = { t: Date.now() };
  const encoded = toBase64Url(JSON.stringify(payload));
  const token = `${encoded}.${sign(encoded)}`;
  res.setHeader('Set-Cookie', makeCookie(ADMIN_COOKIE, token, ADMIN_TTL_SEC, 'Strict'));
}

export function verifyAdminCookie(req) {
  const cookies = parseCookies(req.headers?.cookie || '');
  return verifySignedToken(cookies[ADMIN_COOKIE] || '', ADMIN_TTL_SEC);
}

export function requireAdmin(req, res) {
  if (!verifyAdminCookie(req)) {
    sendJson(res, 401, { error: 'Nao autorizado.' });
    return false;
  }
  return true;
}

export function text(value, max = 255) {
  const clean = String(value || '').trim();
  return clean ? clean.slice(0, max) : null;
}

export function digits(value, max = 32) {
  const clean = String(value || '').replace(/\D/g, '');
  return clean ? clean.slice(0, max) : null;
}

export function numberOrNull(value) {
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function clientIp(req) {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

export async function supabaseFetch(path, init = {}) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return { ok: false, missing: true, response: null, data: null, detail: 'missing_supabase_config' };
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init.headers || {})
    }
  });
  const textBody = await response.text().catch(() => '');
  let data = null;
  try {
    data = textBody ? JSON.parse(textBody) : null;
  } catch (_error) {
    data = textBody;
  }
  return { ok: response.ok, response, data, detail: textBody };
}
