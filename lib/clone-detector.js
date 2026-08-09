import { clientIp, supabaseFetch, text } from './api-utils.js';

const DEFAULT_HOSTS = ['localhost', '127.0.0.1'];

function normalizeHost(value) {
  const raw = String(value || '').split(',')[0].trim().toLowerCase();
  if (!raw) return '';
  try {
    if (/^https?:\/\//.test(raw)) return new URL(raw).hostname.toLowerCase();
  } catch (_error) {
    return '';
  }
  return raw.split('/')[0].split(':')[0];
}

export function officialHosts() {
  const configured = String(process.env.APP_ALLOWED_HOSTS || '').split(',').map(normalizeHost).filter(Boolean);
  const publicHost = normalizeHost(process.env.APP_PUBLIC_URL || '');
  return Array.from(new Set([...DEFAULT_HOSTS, publicHost, ...configured].filter(Boolean)));
}

export function isOfficialHost(host) {
  const normalized = normalizeHost(host);
  return officialHosts().some((allowed) => allowed.startsWith('*.') ? normalized.endsWith(allowed.slice(1)) : normalized === allowed);
}

function scoreEvent(event) {
  let score = 0;
  if (event.reported_host && !isOfficialHost(event.reported_host)) score += 55;
  if (event.event_type === 'clone_beacon') score += 15;
  if (event.event_type === 'asset_hotlink') score += 20;
  if (event.event_type === 'api_probe') score += 35;
  if (!event.referrer && !event.origin) score += 8;
  if (/bot|crawler|spider|headless|python|curl|wget/i.test(event.user_agent || '')) score += 25;
  return Math.min(score, 100);
}

export async function recordCloneEvent(input = {}, req = {}) {
  const reportedHost = normalizeHost(input.host || input.hostname || input.reported_host);
  if (!reportedHost || isOfficialHost(reportedHost)) return { ok: true, skipped: true };
  const requestHost = normalizeHost(req.headers?.['x-forwarded-host'] || req.headers?.host);
  const event = {
    event_type: text(input.eventType || input.event_type || 'clone_beacon', 80),
    page: text(input.page, 80),
    reported_host: reportedHost,
    official_host: normalizeHost(input.officialHost || input.official_host || process.env.APP_PUBLIC_URL) || requestHost,
    href: text(input.href || input.url, 1000),
    referrer: text(input.referrer || req.headers?.referer, 1000),
    origin: text(input.origin || req.headers?.origin, 300),
    source_url: text(input.sourceUrl || input.source_url, 1000),
    screen: text(input.screen, 80),
    timezone: text(input.timezone, 120),
    language: text(input.language, 80),
    user_agent: text(req.headers?.['user-agent'] || input.userAgent || input.user_agent, 500),
    client_ip: text(clientIp(req), 120),
    payload: { requestHost, query: input }
  };
  event.risk_score = scoreEvent(event);
  return supabaseFetch('security_clone_events', {
    method: 'POST',
    headers: { Prefer: 'return=minimal' },
    body: JSON.stringify([event])
  });
}
