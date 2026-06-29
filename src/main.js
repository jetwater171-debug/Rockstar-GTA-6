import './styles.css';
import './hero-polish.css';
import './quiz-polish.css';
import './lead-flow.css';

const quiz = [
  {
    eyebrow: 'Experiencia',
    question: 'Voce ja jogou GTA V?',
    options: [
      { icon: 'V', label: 'Sim, joguei bastante', points: 2 },
      { icon: 'GT', label: 'Joguei um pouco', points: 1 },
      { icon: '01', label: 'Ainda nao joguei', points: 0 },
    ],
  },
  {
    eyebrow: 'GTA Online',
    question: 'Voce ja entrou no GTA Online?',
    options: [
      { icon: 'ON', label: 'Sim, jogo ou ja joguei online', points: 2 },
      { icon: 'RP', label: 'Conheco, mas joguei pouco', points: 1 },
      { icon: 'OFF', label: 'Nunca joguei online', points: 0 },
    ],
  },
  {
    eyebrow: 'Expectativa',
    question: 'Qual e sua expectativa para GTA VI?',
    options: [
      { icon: 'VI', label: 'Muito alta, estou acompanhando tudo', points: 2 },
      { icon: 'VIP', label: 'Alta, quero ver as novidades', points: 1 },
      { icon: 'NEW', label: 'Ainda estou conhecendo melhor', points: 0 },
    ],
  },
  {
    eyebrow: 'Interesse',
    question: 'O que mais chama sua atencao em GTA VI?',
    options: [
      { icon: 'ST', label: 'Historia, Lucia e Jason', points: 2 },
      { icon: 'MAP', label: 'Mundo aberto e exploracao', points: 2 },
      { icon: 'ON', label: 'Modo online e novidades futuras', points: 1 },
    ],
  },
  {
    eyebrow: 'Plataforma',
    question: 'Em qual plataforma voce pretende jogar primeiro?',
    options: [
      { icon: 'PS', label: 'PlayStation', points: 2 },
      { icon: 'XB', label: 'Xbox', points: 2 },
      { icon: 'PC', label: 'PC ou ainda vou decidir', points: 1 },
    ],
  },
  {
    eyebrow: 'Perfil',
    question: 'Qual estilo de jogador combina mais com voce?',
    options: [
      { icon: 'EXP', label: 'Exploro mapa, missoes e detalhes', points: 2 },
      { icon: 'ACT', label: 'Gosto de acao, carros e desafios', points: 2 },
      { icon: 'CAS', label: 'Jogo casualmente quando da', points: 1 },
    ],
  },
  {
    eyebrow: 'Frequencia',
    question: 'Com que frequencia voce joga games de mundo aberto?',
    options: [
      { icon: '7D', label: 'Toda semana', points: 2 },
      { icon: '30', label: 'Algumas vezes por mes', points: 1 },
      { icon: 'LOW', label: 'Raramente', points: 0 },
    ],
  },
  {
    eyebrow: 'Rockstar',
    question: 'Voce costuma acompanhar lancamentos da Rockstar?',
    options: [
      { icon: 'R*', label: 'Sim, acompanho noticias e trailers', points: 2 },
      { icon: 'VI', label: 'Acompanho principalmente GTA VI', points: 1 },
      { icon: 'NO', label: 'Nao acompanho muito', points: 0 },
    ],
  },
  {
    eyebrow: 'Promocao',
    question: 'Se for selecionado, voce participaria da proxima etapa?',
    options: [
      { icon: 'OK', label: 'Sim, quero participar', points: 2 },
      { icon: 'INFO', label: 'Sim, quero ver os detalhes', points: 1 },
      { icon: 'WAIT', label: 'Talvez depois', points: 0 },
    ],
  },
  {
    eyebrow: 'Final',
    question: 'Voce quer receber novidades e acesso a proxima fase?',
    options: [
      { icon: 'VIP', label: 'Quero receber a proxima etapa', points: 2 },
      { icon: 'NEWS', label: 'Quero receber novidades primeiro', points: 1 },
      { icon: 'LATER', label: 'Prefiro decidir depois', points: 0 },
    ],
  },
];

const storageKeys = {
  session: 'gta6_lead_session',
  quiz: 'gta6_quiz_summary',
  personal: 'gta6_personal_data',
  utm: 'gta6_utm_payload',
};

let currentQuestion = 0;
let score = 0;
let isLocked = false;
let quizAnswers = [];
let sessionReady = null;
let adminLeads = [];

const app = document.querySelector('#app');

function render() {
  const route = routeName();
  if (route === 'dados') {
    renderDataPage();
    return;
  }
  if (route === 'admin') {
    renderAdminPage();
    return;
  }
  renderExperience();
}

function renderExperience() {
  app.innerHTML = `
    <main class="experience">
      <section class="hero screen is-active" id="home" aria-label="Inicio do quiz">
        <div class="hero__art" aria-hidden="true"></div>
        <div class="hero__grain" aria-hidden="true"></div>
        <div class="hero__speed-lines" aria-hidden="true"></div>
        <div class="hero__bottom-glass" aria-hidden="true"></div>
        <div class="particle-field" id="particles" aria-hidden="true"></div>

        <header class="topbar">
          <div class="topbar__logo">${brandMark('symbol')}</div>
        </header>

        <div class="hero__content">
          <div class="hero__invite">
            <p class="kicker">Grand Theft Auto VI</p>
            <h1><span>Participe da</span><span>Promoção</span></h1>
          </div>
          <p class="hero__copy">
            Responda o questionario promocional da Rockstar para participar da
            promocao exclusiva do GTA 6.
          </p>
          <div class="hero__actions">
            <button class="rockstar-button" id="startButton">
              <span>Quero participar</span>
              <i aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <footer class="legal-note">
          Prototipo visual nao oficial. GTA, Rockstar Games e marcas relacionadas pertencem aos respectivos titulares.
        </footer>
      </section>

      <section class="quiz-screen screen" id="quiz" aria-label="Quiz GTA VI">
        <header class="quiz-header">
          <div class="quiz-header__logo" aria-label="Simbolo Rockstar Games">${brandMark('quiz')}</div>
        </header>
        <div class="quiz-shell">
          <div class="progress-track" aria-hidden="true"><span id="progressBar"></span></div>
          <article class="question-panel" id="questionPanel"></article>
        </div>
      </section>
    </main>
  `;

  initSession();
  persistUtm();
  trackPage('home');
  buildParticles();
  bindIntro();
  renderQuestion(true);
}

function renderDataPage(success = false) {
  const personal = readJson(storageKeys.personal, {});
  app.innerHTML = `
    <main class="data-screen" data-page="dados">
      <section class="data-shell">
        <article class="data-card">
          <div class="data-logo">${brandMark('quiz')}</div>
          <p class="data-kicker">Triagem oficial GTA VI</p>
          <h1>${success ? 'Dados recebidos' : 'Complete seu perfil'}</h1>
          <p class="data-copy">
            ${success
              ? 'Seu perfil foi registrado para a proxima etapa da selecao promocional.'
              : 'Informe seus dados principais para vincular sua sessao ao perfil avaliado no quiz.'}
          </p>
          ${success ? successMarkup() : dataFormMarkup(personal)}
        </article>
      </section>
    </main>
  `;

  initSession();
  trackPage('dados');
  if (!success) bindDataForm();
}

function dataFormMarkup(personal) {
  return `
    <form class="data-form" id="leadForm">
      <label class="field-rs">
        <span>Nome completo</span>
        <input id="leadName" name="name" value="${escapeAttr(personal.name || '')}" autocomplete="name" required />
      </label>
      <label class="field-rs">
        <span>E-mail</span>
        <input id="leadEmail" name="email" value="${escapeAttr(personal.email || '')}" type="email" autocomplete="email" required />
      </label>
      <label class="field-rs">
        <span>Telefone</span>
        <input id="leadPhone" name="phone" value="${escapeAttr(personal.phone || '')}" inputmode="tel" autocomplete="tel" required />
      </label>
      <label class="field-rs">
        <span>CPF</span>
        <input id="leadCpf" name="cpf" value="${escapeAttr(personal.cpf || '')}" inputmode="numeric" autocomplete="off" />
      </label>
      <button class="data-submit" type="submit">Continuar</button>
      <div class="form-status-rs" id="leadStatus" role="status"></div>
    </form>
  `;
}

function successMarkup() {
  return `
    <div class="data-form">
      <button class="data-submit" type="button" disabled>Perfil em analise</button>
      <p class="form-status-rs is-ok">A proxima etapa do funil sera conectada aqui.</p>
    </div>
  `;
}

function renderAdminPage() {
  app.innerHTML = `
    <main class="admin-screen" data-page="admin">
      <section class="admin-shell-rs">
        <article class="admin-card-rs" id="adminLoginCard">
          <div class="admin-logo-rs">${brandMark('quiz')}</div>
          <p class="admin-kicker-rs">Painel privado</p>
          <h1>Admin Rockstar</h1>
          <p class="admin-muted-rs">Acompanhe leads, sessoes e etapas registradas no Supabase.</p>
          <form class="admin-login-form-rs" id="adminLoginForm">
            <label class="field-rs">
              <span>Senha do admin</span>
              <input id="adminPassword" type="password" autocomplete="current-password" required />
            </label>
            <button class="admin-button-rs" type="submit">Entrar</button>
            <div class="form-status-rs" id="adminLoginStatus"></div>
          </form>
        </article>

        <article class="admin-panel-rs hidden" id="adminPanel">
          <div class="admin-top-rs">
            <div>
              <p class="admin-kicker-rs">Dashboard</p>
              <h1>Leads GTA VI</h1>
              <p class="admin-muted-rs">Estrutura funcional baseada no painel do iFood Bag.</p>
            </div>
            <button class="admin-button-rs" id="refreshAdmin" type="button">Atualizar</button>
          </div>
          <div class="admin-stats-rs">
            <div class="admin-stat-rs"><span>Leads</span><strong id="statLeads">0</strong></div>
            <div class="admin-stat-rs"><span>Com telefone</span><strong id="statPhones">0</strong></div>
            <div class="admin-stat-rs"><span>Paginas</span><strong id="statPages">0</strong></div>
          </div>
          <div class="admin-toolbar-rs">
            <input id="adminSearch" placeholder="Buscar nome, email, telefone..." />
            <span class="admin-muted-rs" id="adminStatus">Carregando...</span>
          </div>
          <div class="admin-table-wrap-rs">
            <table class="admin-table-rs">
              <thead>
                <tr>
                  <th>Lead</th><th>Contato</th><th>Etapa</th><th>Quiz</th><th>Origem</th><th>Atualizado</th>
                </tr>
              </thead>
              <tbody id="adminLeadRows"></tbody>
            </table>
          </div>
        </article>
      </section>
    </main>
  `;
  bindAdmin();
}

function brand(variant) {
  return `<div class="brand brand--${variant}" aria-label="Rockstar inspired mark">${brandMark(variant)}</div>`;
}

function brandMark(variant = 'default') {
  const src = variant === 'symbol' || variant === 'quiz' ? '/assets/rockstar-logo-white-user-transparent.png' : '/assets/rockstar-logo.png';
  return `<img class="brand-mark brand-mark--${variant}" src="${src}" alt="Rockstar Games" />`;
}

function answerMark() {
  return '<img class="answer-logo" src="/assets/rockstar-logo-white-user-transparent.png" alt="" />';
}

function buildParticles() {
  const particles = document.querySelector('#particles');
  if (!particles) return;
  particles.innerHTML = Array.from({ length: 38 }, (_, index) => {
    const left = Math.round(Math.random() * 100);
    const delay = (Math.random() * 7).toFixed(2);
    const size = Math.round(2 + Math.random() * 5);
    return `<span style="--left:${left}%; --delay:${delay}s; --size:${size}px; --drift:${index % 2 ? 1 : -1};"></span>`;
  }).join('');
}

function bindIntro() {
  document.querySelector('#startButton')?.addEventListener('click', async () => {
    await initSession();
    await trackPage('quiz');
    await trackLead({ stage: 'quiz', event: 'quiz_started' });
    switchScreen('quiz');
    renderQuestion(true);
  });

  document.querySelector('.experience')?.addEventListener('pointermove', (event) => {
    const x = (event.clientX / window.innerWidth - 0.5).toFixed(3);
    const y = (event.clientY / window.innerHeight - 0.5).toFixed(3);
    document.documentElement.style.setProperty('--pointer-x', x);
    document.documentElement.style.setProperty('--pointer-y', y);
  });
}

function switchScreen(name) {
  document.querySelectorAll('.screen').forEach((screen) => {
    screen.classList.toggle('is-active', screen.id === name);
  });
}

function optionLabel(option) {
  return typeof option === 'string' ? option : option.label;
}

function optionPoints(option, index, item) {
  if (typeof option === 'string') return index === item.answer ? 1 : 0;
  return Number(option.points || 0);
}

function maxScore() {
  return quiz.reduce((total, item) => total + Math.max(...item.options.map((option, index) => optionPoints(option, index, item))), 0);
}

function renderQuestion(skipTransition = false) {
  const item = quiz[currentQuestion];
  const panel = document.querySelector('#questionPanel');
  const progress = document.querySelector('#progressBar');
  if (!panel || !item) return;

  if (!skipTransition) {
    panel.classList.remove('question-panel--enter');
    panel.classList.add('question-panel--exit');
  }

  window.setTimeout(() => {
    panel.innerHTML = `
      <h2>${item.question}</h2>
      <div class="answers">
        ${item.options.map((option, index) => `
          <button class="answer" data-index="${index}">
            <span class="answer__icon" aria-hidden="true">${answerMark()}</span>
            <span class="answer__text">${optionLabel(option)}</span>
          </button>
        `).join('')}
      </div>
    `;

    panel.classList.remove('question-panel--exit');
    panel.classList.add('question-panel--enter');
    panel.querySelectorAll('.answer').forEach((button) => button.addEventListener('click', handleAnswer));
  }, skipTransition ? 0 : 260);

  if (progress) progress.style.width = `${((currentQuestion + 1) / quiz.length) * 100}%`;
}

function handleAnswer(event) {
  if (isLocked) return;
  isLocked = true;

  const selected = Number(event.currentTarget.dataset.index);
  const item = quiz[currentQuestion];
  const selectedOption = item.options[selected];
  const points = optionPoints(selectedOption, selected, item);

  document.querySelectorAll('.answer').forEach((answer) => {
    const answerIndex = Number(answer.dataset.index);
    answer.disabled = true;
    answer.classList.toggle('is-selected', answerIndex === selected);
    answer.classList.toggle('is-muted', answerIndex !== selected);
  });

  score += points;
  quizAnswers.push({ question: item.question, answer: optionLabel(selectedOption), points });

  window.setTimeout(async () => {
    currentQuestion += 1;
    if (currentQuestion >= quiz.length) {
      await finishQuiz();
      return;
    }
    isLocked = false;
    renderQuestion();
  }, 680);
}

async function finishQuiz() {
  const total = maxScore();
  const approved = score >= Math.ceil(total * 0.55);
  const summary = {
    score,
    total,
    status: approved ? 'pre_selected' : 'review',
    answers: quizAnswers,
    completedAt: new Date().toISOString(),
  };
  writeJson(storageKeys.quiz, summary);
  await trackLead({ stage: 'quiz', event: 'quiz_completed', quiz: summary });
  navigateTo('/dados');
}

function bindDataForm() {
  const form = document.querySelector('#leadForm');
  const status = document.querySelector('#leadStatus');
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-status-rs';
    status.textContent = 'Salvando seus dados...';

    const personal = {
      name: document.querySelector('#leadName')?.value.trim() || '',
      email: document.querySelector('#leadEmail')?.value.trim() || '',
      phone: document.querySelector('#leadPhone')?.value.trim() || '',
      cpf: document.querySelector('#leadCpf')?.value.trim() || '',
    };
    if (!personal.name || !personal.email || !personal.phone) {
      status.classList.add('is-error');
      status.textContent = 'Preencha nome, email e telefone para continuar.';
      return;
    }
    writeJson(storageKeys.personal, personal);
    const result = await trackLead({ stage: 'dados', event: 'personal_submitted', personal, quiz: readJson(storageKeys.quiz, null) });
    if (!result.ok && result.reason !== 'missing_supabase_config') {
      status.classList.add('is-error');
      status.textContent = 'Nao foi possivel salvar agora. Tente novamente.';
      return;
    }
    status.classList.add('is-ok');
    status.textContent = 'Dados registrados.';
    window.setTimeout(() => renderDataPage(true), 420);
  });
}

function bindAdmin() {
  const loginCard = document.querySelector('#adminLoginCard');
  const panel = document.querySelector('#adminPanel');
  const form = document.querySelector('#adminLoginForm');
  const status = document.querySelector('#adminLoginStatus');

  fetch('/api/admin/me', { credentials: 'include' })
    .then((response) => {
      if (response.ok) showAdminPanel(loginCard, panel);
    })
    .catch(() => {});

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-status-rs';
    status.textContent = 'Validando...';
    const password = document.querySelector('#adminPassword')?.value || '';
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      status.classList.add('is-error');
      status.textContent = 'Senha invalida.';
      return;
    }
    showAdminPanel(loginCard, panel);
  });

  document.querySelector('#refreshAdmin')?.addEventListener('click', () => loadAdminData());
  document.querySelector('#adminSearch')?.addEventListener('input', debounce(() => loadAdminData(), 320));
}

function showAdminPanel(loginCard, panel) {
  loginCard?.classList.add('hidden');
  panel?.classList.remove('hidden');
  loadAdminData();
}

async function loadAdminData() {
  const status = document.querySelector('#adminStatus');
  const q = document.querySelector('#adminSearch')?.value.trim() || '';
  if (status) status.textContent = 'Carregando...';
  try {
    const [leadsRes, pagesRes] = await Promise.all([
      fetch(`/api/admin/leads?limit=100&q=${encodeURIComponent(q)}`, { credentials: 'include' }),
      fetch('/api/admin/pages', { credentials: 'include' }),
    ]);
    if (!leadsRes.ok) throw new Error('leads');
    const leadsJson = await leadsRes.json();
    const pagesJson = pagesRes.ok ? await pagesRes.json() : { data: [] };
    adminLeads = Array.isArray(leadsJson.data) ? leadsJson.data : [];
    renderAdminRows(adminLeads, Array.isArray(pagesJson.data) ? pagesJson.data : []);
    if (status) status.textContent = `${adminLeads.length} lead(s) carregado(s)`;
  } catch (_error) {
    if (status) status.textContent = 'Falha ao carregar dados.';
  }
}

function renderAdminRows(leads, pages) {
  const rows = document.querySelector('#adminLeadRows');
  const statLeads = document.querySelector('#statLeads');
  const statPhones = document.querySelector('#statPhones');
  const statPages = document.querySelector('#statPages');
  if (statLeads) statLeads.textContent = String(leads.length);
  if (statPhones) statPhones.textContent = String(leads.filter((lead) => lead.phone || lead.telefone).length);
  if (statPages) statPages.textContent = String(pages.length);
  if (!rows) return;

  if (!leads.length) {
    rows.innerHTML = '<tr><td colspan="6">Nenhum lead encontrado ainda.</td></tr>';
    return;
  }

  rows.innerHTML = leads.map((lead) => {
    const payload = lead.payload || {};
    const quiz = payload.quiz || {};
    const quizText = quiz.score !== undefined ? `${quiz.score}/${quiz.total || '-'}` : '-';
    return `
      <tr>
        <td><strong>${escapeHtml(lead.name || lead.nome || '-')}</strong><br><span class="admin-chip-rs">${escapeHtml(lead.session_id || '-')}</span></td>
        <td>${escapeHtml(lead.email || '-')}<br>${escapeHtml(lead.phone || lead.telefone || '-')}</td>
        <td>${escapeHtml(lead.stage || '-')}<br>${escapeHtml(lead.last_event || '-')}</td>
        <td>${escapeHtml(quizText)}<br>${escapeHtml(quiz.status || '-')}</td>
        <td>${escapeHtml(lead.utm_source || '-')}<br>${escapeHtml(lead.utm_campaign || '')}</td>
        <td>${escapeHtml(formatDate(lead.updated_at || lead.created_at))}</td>
      </tr>
    `;
  }).join('');
}

function routeName() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/dados') return 'dados';
  if (path === '/admin') return 'admin';
  return 'home';
}

function navigateTo(path) {
  window.history.pushState({}, '', path);
  render();
}

async function initSession() {
  if (!sessionReady) {
    sessionReady = fetch('/api/site/session', { credentials: 'include' }).catch(() => null);
  }
  getSessionId();
  return sessionReady;
}

function getSessionId() {
  let sessionId = localStorage.getItem(storageKeys.session);
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    localStorage.setItem(storageKeys.session, sessionId);
  }
  return sessionId;
}

async function trackLead(payload = {}) {
  await initSession();
  const body = {
    sessionId: getSessionId(),
    utm: readJson(storageKeys.utm, {}),
    referrer: document.referrer || '',
    landing_page: window.location.pathname,
    sourceUrl: window.location.href,
    ...payload,
  };
  try {
    const response = await fetch('/api/lead/track', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return response.ok ? await response.json() : { ok: false };
  } catch (_error) {
    return { ok: false };
  }
}

async function trackPage(page) {
  await initSession();
  try {
    await fetch('/api/lead/pageview', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId: getSessionId(), page }),
    });
  } catch (_error) {}
}

function persistUtm() {
  const params = new URLSearchParams(window.location.search);
  const payload = readJson(storageKeys.utm, {});
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'ttclid', 'gclid', 'src', 'sck'].forEach((key) => {
    if (params.get(key)) payload[key] = params.get(key);
  });
  payload.referrer = payload.referrer || document.referrer || '';
  payload.landing_page = payload.landing_page || window.location.pathname;
  writeJson(storageKeys.utm, payload);
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_error) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('pt-BR');
}

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function resetQuiz() {
  currentQuestion = 0;
  score = 0;
  isLocked = false;
  quizAnswers = [];
  render();
}

window.addEventListener('popstate', render);
render();
