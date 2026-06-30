import {
  ensureAllowedRequest,
  issueAdminCookie,
  readJson,
  requireAdmin,
  sendJson,
  supabaseFetch,
  verifyAdminCookie,
  verifyAdminPassword
} from '../../lib/api-utils.js';

const gateways = ['sunize', 'paradise', 'atomopay', 'bravopay'];
const defaultSettings = {
  tracking: { metaPixel: '', metaAccessToken: '', tiktokPixel: '', googleTag: '', browserPixel: true, serverEvents: false },
  utmfy: { enabled: false, apiKey: '', endpoint: 'https://api.utmify.com.br/api-credentials/orders', productName: 'Promocao GTA VI', platform: 'Rockstar GTA VI' },
  gateways: {
    active: 'sunize',
    activeGateway: 'sunize',
    gatewayOrder: ['sunize', 'paradise', 'atomopay', 'bravopay'],
    sunize: { enabled: false, baseUrl: 'https://api.sunize.com.br/v1', apiKey: '', apiSecret: '' },
    paradise: { enabled: false, baseUrl: 'https://multi.paradisepags.com', apiKey: '', productHash: '', orderbumpHash: '', source: 'api_externa', description: '' },
    atomopay: {
      enabled: false,
      baseUrl: 'https://api.atomopay.com.br/api/public/v1',
      apiToken: '',
      offerHash: '',
      productHash: '',
      iofOfferHash: '',
      iofProductHash: '',
      correiosOfferHash: '',
      correiosProductHash: '',
      expressoOfferHash: '',
      expressoProductHash: '',
      webhookToken: ''
    },
    bravopay: { enabled: false, baseUrl: 'https://bravopay.club/api/v1', apiKey: '', webhookSecret: '', expiresIn: 3600, description: '' }
  },
  funnel: { promotionName: 'Promocao exclusiva GTA VI', nextStepUrl: '', leadCaptureEnabled: true },
  public: {
    country: 'Brasil',
    minAge: 18,
    maxAge: 44,
    gender: 'todos',
    devices: 'iPhone, Android, PlayStation, Xbox',
    interests: 'GTA V, GTA Online, Rockstar Games, mundo aberto',
    recommendation: 'Criar publico quente com quem concluiu o quiz e lookalike baseado nos leads qualificados.'
  },
  backredirects: { enabled: true, home: '/admin', quiz: '/dados', dados: '/' }
};

const asObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const gatewayLabel = (name) => ({ sunize: 'Sunize', paradise: 'Paradise', atomopay: 'AtomoPay', bravopay: 'Bravo Pay' }[name] || name);

function mergeDeep(base, patch) {
  const out = { ...asObject(base) };
  Object.entries(asObject(patch)).forEach(([key, value]) => {
    out[key] = isPlainObject(value) && isPlainObject(base?.[key]) ? mergeDeep(base[key], value) : value;
  });
  return out;
}

function normalizeGatewaySettings(value) {
  const next = mergeDeep(defaultSettings, value);
  const sourceGateways = asObject(next.gateways);
  const rawOrder = Array.isArray(sourceGateways.gatewayOrder)
    ? sourceGateways.gatewayOrder
    : String(sourceGateways.gatewayOrder || '').split(',');
  const order = [sourceGateways.activeGateway, sourceGateways.active, ...rawOrder, ...gateways]
    .map((name) => String(name || '').trim().toLowerCase())
    .filter((name, index, list) => gateways.includes(name) && list.indexOf(name) === index);
  next.gateways = {
    ...sourceGateways,
    active: order[0] || gateways[0],
    activeGateway: order[0] || gateways[0],
    gatewayOrder: order.length ? order : [...gateways]
  };
  delete next.gateways.ghostspay;
  return next;
}

function publicSettings(value) {
  const merged = normalizeGatewaySettings(value);
  const secretKeys = [
    'apiKey',
    'apiSecret',
    'apiToken',
    'secret',
    'secretKey',
    'companyId',
    'webhookToken',
    'webhookSecret',
    'productHash',
    'orderbumpHash',
    'offerHash',
    'iofOfferHash',
    'iofProductHash',
    'correiosOfferHash',
    'correiosProductHash',
    'expressoOfferHash',
    'expressoProductHash'
  ];
  gateways.forEach((key) => {
    secretKeys.forEach((secretKey) => {
      if (merged.gateways?.[key]?.[secretKey]) merged.gateways[key][secretKey] = '__SECRET_SET__';
    });
  });
  if (merged.tracking?.metaAccessToken) merged.tracking.metaAccessToken = '__SECRET_SET__';
  if (merged.utmfy?.apiKey) merged.utmfy.apiKey = '__SECRET_SET__';
  return merged;
}

async function loadSettings() {
  const result = await supabaseFetch('app_settings?key=eq.admin_config&select=value,updated_at&limit=1');
  if (result.missing) return { ok: false, missing: true };
  if (!result.ok) return result;
  const row = Array.isArray(result.data) ? result.data[0] : null;
  return { ok: true, value: normalizeGatewaySettings(row?.value || {}), updatedAt: row?.updated_at || null };
}

async function saveSettingsValue(next) {
  const patch = await supabaseFetch('app_settings?key=eq.admin_config', {
    method: 'PATCH',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ value: next, updated_at: new Date().toISOString() })
  });
  if (patch.ok) return patch;
  return supabaseFetch('app_settings', {
    method: 'POST',
    headers: { Prefer: 'return=representation' },
    body: JSON.stringify({ key: 'admin_config', value: next })
  });
}

function cleanSearch(value) {
  return String(value || '').trim().replace(/[%(),]/g, '').slice(0, 80);
}

async function fetchLeads(limit = 5000, q = '') {
  const params = new URLSearchParams({ select: '*', order: 'updated_at.desc', limit: String(limit) });
  const search = cleanSearch(q);
  if (search) params.set('or', `name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%,cpf.ilike.%${search}%`);
  return supabaseFetch(`leads?${params.toString()}`);
}

function pageKey(page) {
  return String(page || '').trim().toLowerCase() || 'sem_nome';
}

function sourceFromLead(lead) {
  const payload = asObject(lead.payload);
  return String(lead.utm_source || payload.utm?.utm_source || 'organico').trim() || 'organico';
}

function bucketAdd(map, key, label, amount = 0) {
  const cleanKey = String(key || 'sem_dado').trim().toLowerCase() || 'sem_dado';
  const current = map.get(cleanKey) || { key: cleanKey, label: label || cleanKey, count: 0, amount: 0 };
  current.count += 1;
  current.amount = Number((current.amount + Number(amount || 0)).toFixed(2));
  map.set(cleanKey, current);
}

function ranking(map, total, limit = 8) {
  return Array.from(map.values())
    .sort((a, b) => b.count - a.count || b.amount - a.amount)
    .slice(0, limit)
    .map((item) => ({ ...item, percent: total ? Math.round((item.count / total) * 1000) / 10 : 0 }));
}

function deviceFromLead(lead, payload) {
  const ua = String(lead.user_agent || payload.metadata?.user_agent || '').toLowerCase();
  const platform = String(payload.quiz?.answers?.find?.((a) => /plataforma/i.test(a.question || ''))?.answer || '').toLowerCase();
  if (ua.includes('iphone')) return 'iPhone';
  if (ua.includes('android')) return 'Android';
  if (platform.includes('playstation')) return 'PlayStation';
  if (platform.includes('xbox')) return 'Xbox';
  if (platform.includes('pc')) return 'PC';
  return 'Indefinido';
}

function leadGateway(lead, payload) {
  const raw = String(payload.gateway || payload.payment?.gateway || lead.gateway || 'sunize').trim().toLowerCase();
  return gateways.includes(raw) ? raw : 'sunize';
}

function isPaidLead(lead, payload) {
  return /paid|confirm|pago/i.test(String(lead.last_event || payload.payment?.status || ''));
}

function csvCell(value) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

async function overview(req, res) {
  const [leadsResult, pagesResult] = await Promise.all([
    fetchLeads(500),
    supabaseFetch('lead_pageviews?select=page,created_at&order=created_at.desc&limit=2000')
  ]);
  if (leadsResult.missing || pagesResult.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!leadsResult.ok) return sendJson(res, 502, { error: 'Falha ao buscar leads.', detail: leadsResult.detail });
  const leads = Array.isArray(leadsResult.data) ? leadsResult.data : [];
  const pageviews = pagesResult.ok && Array.isArray(pagesResult.data) ? pagesResult.data : [];
  const pages = {};
  pageviews.forEach((row) => { pages[pageKey(row.page)] = (pages[pageKey(row.page)] || 0) + 1; });
  const sourceMap = {};
  leads.forEach((lead) => { const src = sourceFromLead(lead); sourceMap[src] = (sourceMap[src] || 0) + 1; });
  const funnel = {
    home: pages.home || 0,
    quiz: leads.filter((lead) => lead.payload?.quiz || String(lead.stage || '').includes('quiz')).length,
    dados: leads.filter((lead) => lead.name || lead.email || lead.phone || String(lead.stage || '').includes('dados')).length,
    qualificados: leads.filter((lead) => ['pre_selected', 'qualified'].includes(String(lead.payload?.quiz?.status || ''))).length
  };
  const lastUpdated = leads.reduce((latest, lead) => {
    const next = lead.updated_at || lead.created_at || '';
    return next && (!latest || Date.parse(next) > Date.parse(latest)) ? next : latest;
  }, null);
  sendJson(res, 200, {
    ok: true,
    summary: { totalLeads: leads.length, withContact: leads.filter((lead) => lead.email || lead.phone).length, quizDone: funnel.quiz, qualified: funnel.qualificados, pageviews: pageviews.length, lastUpdated },
    funnel,
    sources: Object.entries(sourceMap).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8),
    pages: Object.entries(pages).map(([page, views]) => ({ page, views })).sort((a, b) => b.views - a.views).slice(0, 12)
  });
}

async function leads(req, res) {
  const limit = Math.min(Math.max(Number(req.query?.limit) || 50, 1), 200);
  const [result, pageviewsResult] = await Promise.all([
    fetchLeads(limit, req.query?.q),
    supabaseFetch('lead_pageviews?select=session_id,page,created_at&order=created_at.asc&limit=5000')
  ]);
  if (result.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!result.ok) return sendJson(res, 502, { error: 'Falha ao buscar leads.', detail: result.detail });
  const pageviews = pageviewsResult.ok && Array.isArray(pageviewsResult.data) ? pageviewsResult.data : [];
  const pageviewsBySession = pageviews.reduce((map, item) => {
    const session = String(item.session_id || '');
    if (!session) return map;
    map[session] = map[session] || [];
    map[session].push(item);
    return map;
  }, {});
  const data = (Array.isArray(result.data) ? result.data : []).map((lead) => ({
    ...lead,
    pageviews: pageviewsBySession[lead.session_id] || []
  }));
  const summary = data.reduce((acc, lead) => {
    const payload = asObject(lead.payload);
    acc.total += 1;
    if (lead.phone || lead.telefone) acc.phone += 1;
    if (lead.email) acc.email += 1;
    if (payload.quiz) acc.quiz += 1;
    if (lead.name || lead.nome) acc.data += 1;
    const updated = lead.updated_at || lead.created_at || '';
    if (updated && (!acc.lastUpdated || Date.parse(updated) > Date.parse(acc.lastUpdated))) acc.lastUpdated = updated;
    return acc;
  }, { total: 0, phone: 0, email: 0, quiz: 0, data: 0, lastUpdated: null });
  sendJson(res, 200, { data, summary });
}

async function pages(_req, res) {
  let result = await supabaseFetch('pageview_counts?select=*');
  if (!result.ok && !result.missing) result = await supabaseFetch('lead_pageviews?select=*');
  if (result.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!result.ok) return sendJson(res, 502, { error: 'Falha ao buscar paginas.', detail: result.detail });
  sendJson(res, 200, { data: Array.isArray(result.data) ? result.data : [] });
}

async function settings(req, res) {
  if (req.method === 'GET') {
    const current = await loadSettings();
    if (current.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
    if (!current.ok) return sendJson(res, 502, { error: 'Falha ao carregar configuracoes.', detail: current.detail });
    return sendJson(res, 200, { ok: true, settings: publicSettings(current.value), updatedAt: current.updatedAt });
  }
  if (req.method === 'POST') {
    const body = await readJson(req);
    const current = await loadSettings();
    const next = normalizeGatewaySettings(mergeDeep(current.ok ? current.value : defaultSettings, body.settings || body || {}));
    const saved = await saveSettingsValue(next);
    if (saved.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
    if (!saved.ok) return sendJson(res, 502, { error: 'Falha ao salvar configuracoes.', detail: saved.detail });
    return sendJson(res, 200, { ok: true, settings: publicSettings(next) });
  }
  sendJson(res, 405, { error: 'Metodo nao permitido.' });
}

async function salesInsights(_req, res) {
  const result = await fetchLeads(5000);
  if (result.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!result.ok) return sendJson(res, 502, { error: 'Falha ao montar publico.', detail: result.detail });
  const rows = Array.isArray(result.data) ? result.data : [];
  const source = new Map(), campaign = new Map(), device = new Map(), city = new Map(), expectation = new Map();
  let qualified = 0, contacts = 0, paid = 0, revenue = 0, lastSaleAt = null;
  rows.forEach((lead) => {
    const payload = asObject(lead.payload);
    const amount = Number(lead.pix_amount || payload.payment?.amount || 0);
    if (isPaidLead(lead, payload)) {
      paid += 1;
      revenue = Number((revenue + amount).toFixed(2));
      lastSaleAt = !lastSaleAt || Date.parse(lead.updated_at) > Date.parse(lastSaleAt) ? lead.updated_at : lastSaleAt;
    }
    if (payload.quiz?.status === 'pre_selected') qualified += 1;
    if (lead.email || lead.phone) contacts += 1;
    bucketAdd(source, sourceFromLead(lead), sourceFromLead(lead));
    bucketAdd(campaign, lead.utm_campaign || payload.utm?.utm_campaign || 'sem_campanha', lead.utm_campaign || payload.utm?.utm_campaign || 'Sem campanha');
    bucketAdd(device, deviceFromLead(lead, payload), deviceFromLead(lead, payload));
    bucketAdd(city, lead.city || payload.address?.city || 'sem_cidade', lead.city || payload.address?.city || 'Sem cidade');
    const exp = payload.quiz?.answers?.find?.((answer) => /expectativa/i.test(answer.question || ''))?.answer || 'Sem resposta';
    bucketAdd(expectation, exp, exp);
  });
  sendJson(res, 200, {
    ok: true,
    summary: { totalLeads: rows.length, contacts, qualified, paid, totalRevenue: revenue, lastSaleAt, conversion: rows.length ? Math.round((qualified / rows.length) * 1000) / 10 : 0 },
    data: { sources: ranking(source, rows.length), campaigns: ranking(campaign, rows.length), devices: ranking(device, rows.length), cities: ranking(city, rows.length), expectations: ranking(expectation, rows.length) },
    audience: {
      headline: 'Publico recomendado para Meta/TikTok',
      recommendation: 'Priorize leads que concluiram o quiz, jogaram GTA V/GTA Online e escolheram PlayStation, Xbox ou iPhone/Android como plataforma principal.',
      customAudience: 'Suba todos os leads com telefone/email e crie lookalike 1% Brasil a partir dos qualificados.',
      exclusion: 'Exclua visitantes sem contato e leads marcados como review quando houver volume suficiente.'
    }
  });
}

async function gatewaySales(_req, res) {
  const result = await fetchLeads(5000);
  if (result.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!result.ok) return sendJson(res, 502, { error: 'Falha ao montar vendas.', detail: result.detail });
  const summary = new Map(gateways.map((name) => [name, { gateway: name, gatewayLabel: gatewayLabel(name), salesCount: 0, grossRevenue: 0, lastPaidAt: '' }]));
  const items = [];
  (Array.isArray(result.data) ? result.data : []).forEach((lead) => {
    const payload = asObject(lead.payload);
    if (!isPaidLead(lead, payload)) return;
    const gateway = leadGateway(lead, payload);
    const amount = Number(lead.pix_amount || payload.payment?.amount || 0);
    const paidAt = lead.updated_at || lead.created_at;
    const row = summary.get(gateway);
    row.salesCount += 1;
    row.grossRevenue = Number((row.grossRevenue + amount).toFixed(2));
    row.lastPaidAt = !row.lastPaidAt || Date.parse(paidAt) > Date.parse(row.lastPaidAt) ? paidAt : row.lastPaidAt;
    items.push({ gateway, gatewayLabel: gatewayLabel(gateway), amount, paidAt, txid: lead.pix_txid || payload.payment?.txid || '', sessionId: lead.session_id, lead: { name: lead.name, email: lead.email, phone: lead.phone }, status: lead.last_event || payload.payment?.status || '' });
  });
  const summaryRows = Array.from(summary.values()).sort((a, b) => b.grossRevenue - a.grossRevenue || b.salesCount - a.salesCount);
  sendJson(res, 200, { ok: true, summary: summaryRows, detail: { totalSales: items.length, totalGrossRevenue: Number(items.reduce((sum, item) => sum + item.amount, 0).toFixed(2)) }, items: items.slice(0, 500) });
}

async function backredirects(_req, res) {
  const result = await supabaseFetch('lead_pageviews?select=page,created_at&order=created_at.desc&limit=5000');
  if (result.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!result.ok) return sendJson(res, 502, { error: 'Falha ao buscar backredirects.', detail: result.detail });
  const counts = new Map();
  (Array.isArray(result.data) ? result.data : []).forEach((row) => counts.set(pageKey(row.page), Number(counts.get(pageKey(row.page)) || 0) + 1));
  const data = [];
  counts.forEach((backTotal, key) => {
    if (!key.startsWith('backredirect_')) return;
    const page = key.replace(/^backredirect_/, '');
    const pageViews = Number(counts.get(page) || 0);
    data.push({ page, backTotal, pageViews, rate: pageViews ? Math.round((backTotal / pageViews) * 1000) / 10 : 0 });
  });
  const totalBack = data.reduce((sum, row) => sum + row.backTotal, 0);
  const totalViews = data.reduce((sum, row) => sum + row.pageViews, 0);
  sendJson(res, 200, { ok: true, data, summary: { totalBack, totalViews, avgRate: totalViews ? Math.round((totalBack / totalViews) * 1000) / 10 : 0 } });
}

async function cloners(_req, res) {
  const result = await supabaseFetch('security_clone_events?select=*&order=created_at.desc&limit=500');
  if (result.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!result.ok) return sendJson(res, 200, { ok: true, data: [], groups: [], summary: { total: 0, high: 0, medium: 0, low: 0, lastEventAt: null } });
  const data = Array.isArray(result.data) ? result.data : [];
  const map = new Map();
  data.forEach((event) => {
    const payload = asObject(event.payload);
    const score = Number(payload.score || payload.riskScore || 0);
    const key = event.client_ip || payload.ip || event.user_agent || 'desconhecido';
    const current = map.get(key) || { key, ip: event.client_ip || '', userAgent: event.user_agent || '', total: 0, score: 0, lastEventAt: null };
    current.total += 1;
    current.score = Math.max(current.score, score);
    current.lastEventAt = !current.lastEventAt || Date.parse(event.created_at) > Date.parse(current.lastEventAt) ? event.created_at : current.lastEventAt;
    map.set(key, current);
  });
  const groups = Array.from(map.values()).map((item) => ({ ...item, risk: item.score >= 70 ? 'alto' : item.score >= 35 ? 'medio' : 'baixo' }));
  sendJson(res, 200, { ok: true, data, groups, summary: { total: data.length, high: groups.filter((i) => i.risk === 'alto').length, medium: groups.filter((i) => i.risk === 'medio').length, low: groups.filter((i) => i.risk === 'baixo').length, lastEventAt: data[0]?.created_at || null } });
}

async function loadBlacklist() {
  const result = await supabaseFetch('app_settings?key=eq.ip_blacklist&select=value&limit=1');
  if (result.missing) return { ok: false, missing: true, entries: [] };
  if (!result.ok) return { ok: false, detail: result.detail, entries: [] };
  const row = Array.isArray(result.data) ? result.data[0] : null;
  return { ok: true, entries: Array.isArray(row?.value?.entries) ? row.value.entries : [] };
}

async function saveBlacklist(entries) {
  const value = { entries, updatedAt: new Date().toISOString() };
  const patch = await supabaseFetch('app_settings?key=eq.ip_blacklist', { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify({ value, updated_at: new Date().toISOString() }) });
  if (patch.ok) return patch;
  return supabaseFetch('app_settings', { method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=minimal' }, body: JSON.stringify({ key: 'ip_blacklist', value }) });
}

async function blacklist(req, res) {
  const loaded = await loadBlacklist();
  if (loaded.missing) return sendJson(res, 500, { error: 'Supabase nao configurado.' });
  if (!loaded.ok) return sendJson(res, 502, { error: 'Falha ao buscar blacklist.', detail: loaded.detail });
  if (req.method === 'GET') return sendJson(res, 200, { ok: true, entries: loaded.entries });
  if (req.method === 'POST') {
    const body = await readJson(req);
    const ip = String(body.ip || '').trim().slice(0, 80);
    if (!ip) return sendJson(res, 400, { error: 'IP invalido.' });
    const next = loaded.entries.filter((entry) => entry.ip !== ip);
    next.unshift({ ip, reason: String(body.reason || 'Bloqueio manual').trim().slice(0, 180), sessionId: String(body.sessionId || '').trim().slice(0, 100), createdAt: new Date().toISOString() });
    const saved = await saveBlacklist(next.slice(0, 500));
    if (!saved.ok) return sendJson(res, 502, { error: 'Falha ao salvar blacklist.', detail: saved.detail });
    return sendJson(res, 200, { ok: true, entries: next.slice(0, 500) });
  }
  if (req.method === 'DELETE') {
    const ip = String(req.query?.ip || '').trim();
    const next = loaded.entries.filter((entry) => entry.ip !== ip);
    const saved = await saveBlacklist(next);
    if (!saved.ok) return sendJson(res, 502, { error: 'Falha ao remover IP.', detail: saved.detail });
    return sendJson(res, 200, { ok: true, entries: next });
  }
  sendJson(res, 405, { error: 'Metodo nao permitido.' });
}

async function exportLeads(_req, res) {
  const result = await fetchLeads(10000);
  if (!result.ok) {
    res.statusCode = result.missing ? 500 : 502;
    res.end('Falha ao exportar leads');
    return;
  }
  const header = ['session_id', 'name', 'email', 'phone', 'cpf', 'stage', 'last_event', 'utm_source', 'utm_campaign', 'quiz_status', 'quiz_score', 'created_at', 'updated_at'];
  const lines = [header.join(',')];
  (Array.isArray(result.data) ? result.data : []).forEach((lead) => {
    const quiz = asObject(lead.payload).quiz || {};
    lines.push([lead.session_id, lead.name, lead.email, lead.phone, lead.cpf, lead.stage, lead.last_event, lead.utm_source, lead.utm_campaign, quiz.status, quiz.score, lead.created_at, lead.updated_at].map(csvCell).join(','));
  });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="leads-rockstar-${new Date().toISOString().slice(0, 10)}.csv"`);
  res.end(lines.join('\n'));
}

function routeFromReq(req) {
  if (Array.isArray(req.query?.path)) return req.query.path.join('/');
  if (typeof req.query?.path === 'string') return req.query.path;
  const url = new URL(req.url || '/api/admin', 'https://local.test');
  return url.pathname.replace(/^\/api\/admin\/?/, '').replace(/\/$/, '');
}

export default async function handler(req, res) {
  if (!ensureAllowedRequest(req, res, { requireSession: false })) return;
  const route = routeFromReq(req);

  if (route === 'login') {
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Metodo nao permitido.' });
    const body = await readJson(req);
    if (!verifyAdminPassword(body.password || '')) return sendJson(res, 401, { error: 'Senha invalida.' });
    issueAdminCookie(res);
    return sendJson(res, 200, { ok: true });
  }
  if (route === 'me') return verifyAdminCookie(req) ? sendJson(res, 200, { ok: true }) : sendJson(res, 401, { ok: false });
  if (!requireAdmin(req, res)) return;

  if (route === 'overview') return overview(req, res);
  if (route === 'leads') return leads(req, res);
  if (route === 'pages') return pages(req, res);
  if (route === 'settings') return settings(req, res);
  if (route === 'sales-insights') return salesInsights(req, res);
  if (route === 'gateway-sales') return gatewaySales(req, res);
  if (route === 'backredirects') return backredirects(req, res);
  if (route === 'clonadores') return cloners(req, res);
  if (route === 'ip-blacklist') return blacklist(req, res);
  if (route === 'leads-export') return exportLeads(req, res);
  if (route === 'test-integration') {
    const body = await readJson(req);
    const kind = String(body.kind || 'integracao').trim();
    return sendJson(res, 200, { ok: true, message: `${kind} configurado no painel. O disparo real sera conectado quando o checkout/pagamento do funil entrar no ar.` });
  }
  sendJson(res, 404, { error: 'Rota admin nao encontrada.' });
}
