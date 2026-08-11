import './styles.css';
import './hero-polish.css';
import './quiz-polish.css';
import './lead-flow.css';
import './desktop-polish.css';
import './processing-unified.css';
import './offers-clean.css';

const quiz = [
  {
    eyebrow: 'Experiência',
    question: 'Você já jogou GTA V?',
    options: [
      { icon: 'V', label: 'Sim, joguei bastante', points: 2 },
      { icon: 'GT', label: 'Joguei um pouco', points: 1 },
      { icon: '01', label: 'Ainda não joguei', points: 0 },
    ],
  },
  {
    eyebrow: 'GTA Online',
    question: 'Você já entrou no GTA Online?',
    options: [
      { icon: 'ON', label: 'Sim, jogo ou já joguei online', points: 2 },
      { icon: 'RP', label: 'Conheço, mas joguei pouco', points: 1 },
      { icon: 'OFF', label: 'Nunca joguei online', points: 0 },
    ],
  },
  {
    eyebrow: 'Expectativa',
    question: 'Qual é sua expectativa para GTA VI?',
    options: [
      { icon: 'VI', label: 'Muito alta, estou acompanhando tudo', points: 2 },
      { icon: 'VIP', label: 'Alta, quero ver as novidades', points: 1 },
      { icon: 'NEW', label: 'Ainda estou conhecendo melhor', points: 0 },
    ],
  },
  {
    eyebrow: 'Interesse',
    question: 'O que mais chama sua atenção em GTA VI?',
    options: [
      { icon: 'ST', label: 'História, Lucia e Jason', points: 2 },
      { icon: 'MAP', label: 'Mundo aberto e exploração', points: 2 },
      { icon: 'ON', label: 'Modo online e novidades futuras', points: 1 },
    ],
  },
  {
    eyebrow: 'Plataforma',
    question: 'Em qual plataforma você pretende jogar primeiro?',
    options: [
      { icon: 'PS', label: 'PlayStation', points: 2 },
      { icon: 'XB', label: 'Xbox', points: 2 },
      { icon: 'PC', label: 'PC ou ainda vou decidir', points: 1 },
    ],
  },
  {
    eyebrow: 'Perfil',
    question: 'Qual estilo de jogador combina mais com você?',
    options: [
      { icon: 'EXP', label: 'Exploro mapa, missões e detalhes', points: 2 },
      { icon: 'ACT', label: 'Gosto de ação, carros e desafios', points: 2 },
      { icon: 'CAS', label: 'Jogo casualmente quando dá', points: 1 },
    ],
  },
  {
    eyebrow: 'Frequência',
    question: 'Com que frequência você joga games de mundo aberto?',
    options: [
      { icon: '7D', label: 'Toda semana', points: 2 },
      { icon: '30', label: 'Algumas vezes por mês', points: 1 },
      { icon: 'LOW', label: 'Raramente', points: 0 },
    ],
  },
  {
    eyebrow: 'Rockstar',
    question: 'Você costuma acompanhar lançamentos da Rockstar?',
    options: [
      { icon: 'R*', label: 'Sim, acompanho notícias e trailers', points: 2 },
      { icon: 'VI', label: 'Acompanho principalmente GTA VI', points: 1 },
      { icon: 'NO', label: 'Não acompanho muito', points: 0 },
    ],
  },
  {
    eyebrow: 'Promoção',
    question: 'Se for selecionado, você participaria da próxima etapa?',
    options: [
      { icon: 'OK', label: 'Sim, quero participar', points: 2 },
      { icon: 'INFO', label: 'Sim, quero ver os detalhes', points: 1 },
      { icon: 'WAIT', label: 'Talvez depois', points: 0 },
    ],
  },
];

const storageKeys = {
  session: 'gta6_lead_session',
  quiz: 'gta6_quiz_summary',
  personal: 'gta6_personal_data',
  utm: 'gta6_utm_payload',
};

const gatewayKeys = ['sunize', 'paradise', 'atomopay', 'bravopay'];
const clarityTagAllowList = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'ttclid', 'gclid', 'src', 'sck'];

const gtaOffers = [
  {
    id: 'standard',
    tag: 'Standard',
    title: 'GTA VI Standard',
    description: 'A experiência completa da campanha de Jason e Lucia, com o retorno a Vice City e uma jornada pelo estado de Leonida.',
    price: 207.98,
    oldPrice: 349.9,
    badge: 'Jogo base',
    details: [
      'Edição digital para PS5 ou Xbox Series X|S',
      'Campanha completa para um jogador com Jason e Lucia',
      'Lançamento oficial em 19 de novembro de 2026',
    ],
  },
  {
    id: 'ultimate',
    tag: 'Ultimate',
    title: 'GTA VI Ultimate',
    description: 'O jogo base acompanhado da coleção oficial de veículos, armas, roupas, propriedades e atividades extras da história.',
    price: 289.3,
    oldPrice: 499.9,
    badge: 'Mais completa',
    details: [
      'Todo o conteúdo da Edição Standard',
      'Veículos exclusivos, como Grotti Cheetah e Vapid Dominator Buggy',
      'Armas, estilos, oficinas, lojas e propriedades adicionais',
    ],
  },
  {
    id: 'early',
    tag: '7 dias antes',
    title: 'GTA VI Acesso Antecipado',
    description: 'Tudo o que vem na Edição Ultimate, com acesso promocional planejado para começar sete dias antes da liberação geral.',
    price: 359.9,
    oldPrice: 599.9,
    badge: 'Liberado para você',
    exclusive: true,
    featured: true,
    premium: true,
    details: [
      'Todo o conteúdo da Edição Ultimate',
      'Mesmos veículos, armas, roupas, lojas e propriedades adicionais',
      'Acesso promocional planejado para 7 dias antes do lançamento geral*',
    ],
  },
];

let currentQuestion = 0;
let score = 0;
let isLocked = false;
let quizAnswers = [];
let sessionReady = null;
let adminLeads = [];
let adminOverview = null;
let adminSettings = null;
let adminExtras = {};
let adminCurrentTab = 'overview';
let adminSelectedLeadSession = null;
let adminLeadPagination = { offset: 0, limit: 200, hasMore: false, total: null };
let adminLeadFilters = { q: '', from: '', to: '' };
let siteConfig = { tracking: {}, features: {} };
let processingRaf = 0;
let processingStarted = false;

const app = document.querySelector('#app');

function setDocumentScreenMode(mode) {
  const classes = ['is-home-screen', 'is-quiz-screen'];
  document.documentElement.classList.remove(...classes);
  document.body.classList.remove(...classes);
  if (!mode) return;
  const className = `is-${mode}-screen`;
  document.documentElement.classList.add(className);
  document.body.classList.add(className);
}

function render() {
  clearProcessingExperience();
  const route = routeName();
  if (route === 'analise') {
    const personal = readJson(storageKeys.personal, {});
    if (!personal.name || !personal.email || !personal.phone) {
      window.history.replaceState({}, '', '/dados');
      setDocumentScreenMode(null);
      renderDataPage();
      return;
    }
    window.history.replaceState({}, '', '/processando');
    setDocumentScreenMode(null);
    renderProcessingPage();
    return;
  }
  if (route === 'dados') {
    setDocumentScreenMode(null);
    renderDataPage();
    return;
  }
  if (route === 'processando') {
    setDocumentScreenMode(null);
    renderProcessingPage();
    return;
  }
  if (route === 'ofertas') {
    setDocumentScreenMode(null);
    renderOffersPage();
    return;
  }
  if (route === 'admin') {
    setDocumentScreenMode(null);
    renderAdminPage();
    return;
  }
  renderExperience();
}

function renderExperience() {
  setDocumentScreenMode('home');
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
            <div class="hero__gta-lockup" aria-label="GTA VI">
              <span>GTA</span>
              <strong>VI</strong>
            </div>
            <h1 class="hero__promo-title">
              <span class="hero__palm" aria-hidden="true"></span>
              <span class="hero__title-top">Participe da</span>
              <span class="hero__title-bottom">Promoção</span>
            </h1>
          </div>
          <p class="hero__copy">
            Responda ao questionário e desbloqueie sua
            participação na <strong>campanha exclusiva do GTA VI.</strong>
          </p>
          <div class="hero__actions">
            <button class="rockstar-button" id="startButton">
              <span>Quero participar</span>
              <i aria-hidden="true"></i>
            </button>
          </div>
        </div>

      </section>

      <section class="quiz-screen screen" id="quiz" aria-label="Quiz GTA VI">
        <header class="quiz-header">
          <div class="quiz-header__logo" aria-label="Símbolo Rockstar Games">${brandMark('quiz')}</div>
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
      ${flowTopbarMarkup()}
      <section class="data-shell">
        <article class="data-card">
          <p class="data-kicker">Perfil inicial aprovado</p>
          <h1>${success ? 'Dados recebidos' : 'Complete seus dados'}</h1>
          <p class="data-copy data-copy--small">
            ${success
              ? 'Seu contato foi registrado e o perfil segue para a última análise da lista de interesse.'
              : 'Seu perfil passou pela avaliação inicial do quiz. Agora complete seus dados para finalizar a análise e manter seu contato vinculado ao resultado.'}
          </p>
          ${success ? successMarkup() : dataFormMarkup(personal)}
          <p class="data-safe-note-rs">Projeto independente e não afiliado à Rockstar Games. Não solicitamos dados sensíveis.</p>
        </article>
      </section>
    </main>
  `;

  initSession();
  trackPage('dados');
  if (!success) bindDataForm();
}

function flowTopbarMarkup() {
  return `
    <header class="flow-topbar-rs">
      <div class="quiz-header__logo" aria-label="Símbolo Rockstar Games">${brandMark('quiz')}</div>
    </header>
  `;
}

function dataScoreMarkup(summary = {}) {
  const total = Number(summary.total || 0);
  const score = Number(summary.score || 0);
  const percent = total ? Math.round((score / total) * 100) : 0;
  const status = summary.status || (percent >= 70 ? 'Perfil forte' : percent >= 45 ? 'Perfil em análise' : 'Interesse registrado');
  return `
    <aside class="data-score-rs" aria-label="Resultado do quiz">
      <div class="data-score-ring-rs" style="--score:${Math.max(0, Math.min(100, percent))}">
        <strong>${percent}%</strong>
        <span>match</span>
      </div>
      <div>
        <small>Resultado do quiz</small>
        <b>${escapeHtml(status)}</b>
        <p>${total ? `${score} de ${total} pontos considerados no perfil.` : 'Quiz concluído e pronto para vinculação.'}</p>
      </div>
    </aside>
  `;
}

function dataFormMarkup(personal) {
  const phoneValue = String(personal.phone || '').replace(/\D/g, '').slice(0, 11);
  return `
    <form class="data-form" id="leadForm" data-clarity-mask="true">
      <div class="data-form-grid-rs">
        <label class="field-rs">
          <span>Nome completo</span>
          <input id="leadName" name="name" value="${escapeAttr(personal.name || '')}" autocomplete="name" required />
        </label>
        <label class="field-rs">
          <span>E-mail</span>
          <input id="leadEmail" name="email" value="${escapeAttr(personal.email || '')}" type="email" autocomplete="email" required />
        </label>
        <label class="field-rs data-field-wide-rs">
          <span>Número</span>
          <input id="leadPhone" name="phone" value="${escapeAttr(phoneValue)}" type="tel" inputmode="numeric" autocomplete="tel-national" minlength="10" maxlength="11" pattern="[0-9]{10,11}" title="Digite um telefone com DDD, usando 10 ou 11 números" required />
        </label>
      </div>
      <button class="data-submit" type="submit">Continuar</button>
      <div class="form-status-rs" id="leadStatus" role="status"></div>
    </form>
  `;
}

function successMarkup() {
  return `
    <div class="data-form">
      <button class="data-submit" type="button" disabled>Perfil em análise</button>
      <p class="form-status-rs is-ok">A próxima etapa do funil será conectada aqui.</p>
    </div>
  `;
}

function renderAdminPage() {
  app.innerHTML = `
    <main class="admin-screen" data-page="admin" data-clarity-mask="true">
      <section class="admin-shell-rs admin-shell-rs--pro">
        <article class="admin-card-rs" id="adminLoginCard">
          <div class="admin-logo-rs">${brandMark('quiz')}</div>
          <p class="admin-kicker-rs">Painel privado</p>
          <h1>Admin Rockstar</h1>
          <p class="admin-muted-rs">Central de leads, tracking, UTMfy, pixels e gateways da promoção GTA VI.</p>
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
          <aside class="admin-side-rs">
            <div class="admin-side-brand-rs">
              ${brandMark('quiz')}
              <div>
                <strong>GTA VI</strong>
                <span>Promo Admin</span>
              </div>
            </div>
            <nav class="admin-nav-rs" aria-label="Administração">
              <button class="is-active" data-admin-tab="overview" type="button">Visão geral</button>
              <button data-admin-tab="leads" type="button">Leads</button>
              <button data-admin-tab="tracking" type="button">Pixel</button>
              <button data-admin-tab="utmfy" type="button">UTMfy</button>
              <button data-admin-tab="gateways" type="button">Gateways</button>
              <button data-admin-tab="public" type="button">Público</button>
              <button data-admin-tab="sales" type="button">Vendas</button>
              <button data-admin-tab="backredirects" type="button">Backredirects</button>
              <button data-admin-tab="cloners" type="button">Clonadores</button>
              <button data-admin-tab="blacklist" type="button">Blacklist</button>
              <button data-admin-tab="audit" type="button">Auditoria</button>
              <button data-admin-tab="pages" type="button">Páginas</button>
            </nav>
            <div class="admin-side-foot-rs">
              <span>Supabase</span>
              <strong id="adminHealth">Conectando</strong>
            </div>
          </aside>
          <div class="admin-workspace-rs">
            <div class="admin-top-rs">
              <div>
                <p class="admin-kicker-rs">Dashboard operacional</p>
                <h1 id="adminTitle">Visão geral</h1>
                <p class="admin-muted-rs" id="adminSubtitle">Monitoramento do funil promocional em tempo real.</p>
              </div>
              <div class="admin-actions-rs">
                <button class="admin-button-rs admin-button-rs--ghost" id="saveAdminSettings" type="button">Salvar</button>
                <button class="admin-button-rs" id="refreshAdmin" type="button">Atualizar</button>
                <button class="admin-button-rs admin-button-rs--ghost" id="adminLogout" type="button">Sair</button>
              </div>
            </div>
            <div class="admin-alert-rs" id="adminStatus">Carregando painel...</div>
            <div class="admin-content-rs" id="adminContent"></div>
          </div>
        </article>
      </section>
    </main>
  `;
  initSession();
  trackPage('admin');
  bindAdmin();
}

function brand(variant) {
  return `<div class="brand brand--${variant}" aria-label="Rockstar inspired mark">${brandMark(variant)}</div>`;
}

function brandMark(variant = 'default') {
  const src = variant === 'symbol' || variant === 'quiz' ? '/assets/rockstar-logo-white-user-transparent.webp' : '/assets/rockstar-logo.webp';
  return `<img class="brand-mark brand-mark--${variant}" src="${src}" alt="Rockstar Games" />`;
}

function answerMark() {
  return '<img class="answer-logo" src="/assets/rockstar-logo-white-user-transparent.webp" alt="" />';
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
    trackClarityEvent('quiz_started', { stage: 'quiz' });
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
  setDocumentScreenMode(name === 'quiz' ? 'quiz' : 'home');
  window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
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
          <button class="answer" data-index="${index}" type="button">
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
  trackClarityEvent(`quiz_answer_${currentQuestion + 1}`, {
    stage: 'quiz',
    question_index: currentQuestion + 1,
    answer_points: points,
  });

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
  trackClarityEvent('quiz_completed', {
    stage: 'quiz',
    quiz_status: summary.status,
    quiz_score: score,
    quiz_total: total,
  });
  await trackLead({ stage: 'quiz', event: 'quiz_completed', quiz: summary });
  navigateTo('/dados');
}

function bindDataForm() {
  const form = document.querySelector('#leadForm');
  const status = document.querySelector('#leadStatus');
  const phoneInput = document.querySelector('#leadPhone');
  phoneInput?.addEventListener('input', () => {
    phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 11);
  });
  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-status-rs';
    status.textContent = 'Salvando seus dados...';

    const personal = {
      name: document.querySelector('#leadName')?.value.trim() || '',
      email: document.querySelector('#leadEmail')?.value.trim() || '',
      phone: phoneInput?.value.replace(/\D/g, '').slice(0, 11) || '',
    };
    if (!personal.name || !personal.email || !personal.phone) {
      trackClarityEvent('personal_submit_invalid', { stage: 'dados' });
      status.classList.add('is-error');
      status.textContent = 'Preencha nome, email e telefone para continuar.';
      return;
    }
    if (!/^\d{10,11}$/.test(personal.phone)) {
      trackClarityEvent('personal_submit_invalid', { stage: 'dados', field: 'phone' });
      status.classList.add('is-error');
      status.textContent = 'Digite um número de telefone com DDD (10 ou 11 números).';
      phoneInput?.focus();
      return;
    }
    writeJson(storageKeys.personal, personal);
    trackClarityEvent('personal_submitted', { stage: 'dados', lead_contact: 'captured' });
    const result = await trackLead({ stage: 'dados', event: 'personal_submitted', personal, quiz: readJson(storageKeys.quiz, null) });
    if (!result.ok && result.reason !== 'missing_supabase_config') {
      status.classList.add('is-error');
      status.textContent = 'Não foi possível salvar agora. Tente novamente.';
      return;
    }
    status.classList.add('is-ok');
    status.textContent = 'Dados registrados.';
    window.setTimeout(() => navigateTo('/processando'), 420);
  });
}

function renderProcessingPage() {
  app.innerHTML = `
    <main class="processing-screen" data-page="processando">
      ${flowTopbarMarkup()}
      <section class="processing-shell-rs">
        <article class="processing-card-rs processing-card-rs--unified">
          <header class="processing-intro-rs">
            <p class="processing-kicker-rs">Análise final</p>
            <h1>Verificando seu perfil</h1>
            <p class="processing-copy-rs">Assista ao comunicado. Conforme o vídeo avança, verificamos se seu perfil é adequado para a promoção.</p>
          </header>

          <div class="processing-stage-rs processing-stage-rs--unified">
            <div class="processing-analysis-strip-rs" aria-live="polite">
              <strong id="processingStatus">Toque no vídeo para iniciar a análise</strong>
              <div class="processing-profile-progress-rs" id="processingProfileProgress" role="progressbar" aria-label="Progresso da verificação" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span></span></div>
            </div>
            <div class="processing-video-shell-rs">
              <div class="processing-video-rs" role="group" aria-label="Vídeo explicativo da próxima etapa">
                <img src="/assets/gta-vi-poster.jpg" alt="" />
                <div class="processing-video-shade-rs"></div>
                <button class="processing-play-rs" type="button" aria-label="Assistir ao vídeo">
                  <span></span>
                </button>
              </div>
            </div>
          </div>
        </article>
        <footer class="processing-footer-rs">Projeto independente. Não afiliado à Rockstar Games.</footer>
      </section>
    </main>
  `;
  initSession();
  trackPage('processando');
  bindProcessingPage();
}

function bindProcessingPage() {
  const playButton = document.querySelector('.processing-play-rs');
  const video = document.querySelector('.processing-video-rs');
  const status = document.querySelector('#processingStatus');
  const progress = document.querySelector('#processingProfileProgress');
  const progressFill = progress?.querySelector('span');
  let completed = false;
  const goOffers = async (event = 'vsl_completed') => {
    if (completed || routeName() !== 'processando') return;
    completed = true;
    trackClarityEvent(event, { stage: 'processando' });
    await trackLead({
      stage: 'processando',
      event,
      personal: readJson(storageKeys.personal, {}),
      quiz: readJson(storageKeys.quiz, null),
    });
    navigateTo('/ofertas');
  };

  playButton?.addEventListener('click', () => {
    if (processingStarted) return;
    processingStarted = true;
    trackClarityEvent('vsl_started', { stage: 'processando' });
    playButton.classList.add('is-playing');
    playButton.setAttribute('aria-label', 'Vídeo em andamento');
    playButton.disabled = true;
    video?.classList.add('is-playing');

    const stages = [
      { at: 0, message: 'Validando suas respostas' },
      { at: 0.27, message: 'Cruzando interesses com a promoção' },
      { at: 0.56, message: 'Verificando compatibilidade do perfil' },
      { at: 0.8, message: 'Preparando seu resultado' },
      { at: 0.97, message: 'Perfil adequado para a promoção' },
    ];
    const startedAt = performance.now();
    const duration = 8500;
    const tick = (now) => {
      if (routeName() !== 'processando') return;
      const ratio = Math.min(1, (now - startedAt) / duration);
      const value = Math.round(ratio * 100);
      const currentStage = [...stages].reverse().find((stage) => ratio >= stage.at) || stages[0];
      if (status) status.textContent = currentStage.message;
      if (progressFill) progressFill.style.width = `${value}%`;
      progress?.setAttribute('aria-valuenow', String(value));
      if (ratio < 1) {
        processingRaf = window.requestAnimationFrame(tick);
        return;
      }
      video?.classList.add('is-complete');
      if (status) status.textContent = 'Perfil adequado para a promoção';
      goOffers('vsl_completed');
    };
    processingRaf = window.requestAnimationFrame(tick);
  });
}

function clearProcessingExperience() {
  if (processingRaf) window.cancelAnimationFrame(processingRaf);
  processingRaf = 0;
  processingStarted = false;
}

function renderOffersPage() {
  const personal = readJson(storageKeys.personal, {});
  const firstName = String(personal.name || '').trim().split(/\s+/)[0] || 'perfil';
  app.innerHTML = `
    <main class="offer-screen-rs" data-page="ofertas">
      ${flowTopbarMarkup()}
      <section class="offer-shell-rs">
        <article class="offer-approval-rs">
          <span class="offer-approved-pill-rs">Aprovado</span>
          <h1><span>Perfil 100%</span><span>aprovado</span></h1>
          <p data-clarity-mask="true">
            Parabéns, ${escapeHtml(firstName)}. Sua análise foi concluída e uma seleção especial foi liberada para este cadastro.
          </p>
        </article>

        <section class="offer-list-rs" aria-label="Escolha sua edição">
          ${gtaOffers.map(offerCardMarkup).join('')}
        </section>

      </section>
    </main>
  `;
  initSession();
  trackPage('ofertas');
  trackClarityEvent('offers_viewed', { stage: 'ofertas' });
  trackLead({
    stage: 'ofertas',
    event: 'offers_viewed',
    personal,
    quiz: readJson(storageKeys.quiz, null),
  });
  bindOffersPage();
}

function offerCardMarkup(offer) {
  const flags = [
    offer.featured ? 'offer-card-rs--featured' : '',
    offer.premium ? 'offer-card-rs--premium' : '',
  ].filter(Boolean).join(' ');
  return `
    <article class="offer-card-rs ${flags}" data-offer-card="${offer.id}">
      <div class="offer-card-top-rs">
        <span>${escapeHtml(offer.badge)}</span>
        <b>${escapeHtml(offer.tag)}</b>
      </div>
      ${offer.exclusive ? '<div class="offer-exclusive-rs">Oferta especial liberada para este perfil</div>' : ''}
      <div class="offer-card-copy-rs">
        <h2>${escapeHtml(offer.title)}</h2>
        <p>${escapeHtml(offer.description)}</p>
        <ul class="offer-benefits-rs">
          ${(offer.details || []).map((detail) => `<li>${escapeHtml(detail)}</li>`).join('')}
        </ul>
      </div>
      <div class="offer-price-rs">
        <span>${formatMoney(offer.oldPrice)}</span>
        <strong>${formatMoney(offer.price)}</strong>
      </div>
      <button class="offer-select-rs" type="button" data-offer-select="${offer.id}">
        Escolher
      </button>
    </article>
  `;
}

function bindOffersPage() {
  document.querySelectorAll('[data-offer-select]').forEach((button) => {
    button.addEventListener('click', async () => {
      const offer = gtaOffers.find((item) => item.id === button.dataset.offerSelect);
      if (!offer) return;
      localStorage.setItem('gta6_selected_offer', JSON.stringify(offer));
      document.querySelectorAll('[data-offer-card]').forEach((card) => card.classList.remove('is-selected'));
      button.closest('[data-offer-card]')?.classList.add('is-selected');
      document.querySelectorAll('[data-offer-select]').forEach((item) => {
        item.textContent = 'Escolher';
        item.disabled = false;
      });
      button.textContent = 'Selecionado';
      button.disabled = true;
      trackClarityEvent('offer_selected', {
        stage: 'ofertas',
        selected_offer_id: offer.id,
        selected_offer_title: offer.title,
        selected_offer_price: offer.price,
      });
      await trackLead({
        stage: 'ofertas',
        event: 'offer_selected',
        offer,
        personal: readJson(storageKeys.personal, {}),
        quiz: readJson(storageKeys.quiz, null),
      });
    });
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
      status.textContent = 'Senha inválida.';
      return;
    }
    showAdminPanel(loginCard, panel);
  });

  document.querySelector('#refreshAdmin')?.addEventListener('click', () => loadAdminData({ force: true }));
  document.querySelector('#saveAdminSettings')?.addEventListener('click', saveAdminSettings);
  document.querySelector('#adminLogout')?.addEventListener('click', async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }).catch(() => null);
    window.location.reload();
  });
  document.querySelectorAll('[data-admin-tab]').forEach((button) => {
    button.addEventListener('click', () => {
      adminCurrentTab = button.dataset.adminTab || 'overview';
      renderAdminPanel();
    });
  });
}

function showAdminPanel(loginCard, panel) {
  loginCard?.classList.add('hidden');
  panel?.classList.remove('hidden');
  loadAdminData({ force: true });
}

async function adminFetch(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Falha na requisicao admin.');
  }
  return response.json();
}

async function loadAdminData({ force = false } = {}) {
  const status = document.querySelector('#adminStatus');
  const q = document.querySelector('#adminSearch')?.value.trim() || '';
  const from = document.querySelector('#adminLeadsFrom')?.value || '';
  const to = document.querySelector('#adminLeadsTo')?.value || '';
  adminLeadFilters = { q, from, to };
  if (status) status.textContent = force ? 'Atualizando dados...' : 'Carregando...';
  try {
    const [overviewJson, leadsJson, pagesJson, settingsJson, salesJson, gatewaySalesJson, backJson, clonersJson, blacklistJson, auditJson] = await Promise.all([
      adminFetch('/api/admin/overview'),
      adminFetch(`/api/admin/leads?limit=200&offset=0&q=${encodeURIComponent(q)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
      adminFetch('/api/admin/pages'),
      adminFetch('/api/admin/settings'),
      adminFetch('/api/admin/sales-insights'),
      adminFetch('/api/admin/gateway-sales'),
      adminFetch('/api/admin/backredirects'),
      adminFetch('/api/admin/clonadores'),
      adminFetch('/api/admin/ip-blacklist'),
      adminFetch('/api/admin/audit-logs'),
    ]);
    adminOverview = overviewJson;
    adminLeads = Array.isArray(leadsJson.data) ? leadsJson.data : [];
    adminLeadPagination = leadsJson.pagination || { offset: 0, limit: 200, hasMore: false, total: adminLeads.length };
    adminSettings = settingsJson.settings || {};
    adminExtras = {
      sales: salesJson,
      gatewaySales: gatewaySalesJson,
      backredirects: backJson,
      cloners: clonersJson,
      blacklist: blacklistJson,
      audit: auditJson,
    };
    adminOverview.pagesList = Array.isArray(pagesJson.data) ? pagesJson.data : [];
    renderAdminPanel();
    document.querySelector('#adminHealth').textContent = 'Online';
    if (status) status.textContent = `${adminLeads.length} leads carregados. Última leitura ${formatDate(new Date().toISOString())}.`;
  } catch (error) {
    document.querySelector('#adminHealth').textContent = 'Erro';
    if (status) status.textContent = error.message || 'Falha ao carregar dados.';
  }
}

function renderAdminPanel() {
  document.querySelectorAll('[data-admin-tab]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.adminTab === adminCurrentTab);
  });
  const titles = {
    overview: ['Visão geral', 'Performance, funil e origem dos leads em uma tela.'],
    leads: ['Leads', 'Lista operacional com quiz, contato, UTM e etapa atual.'],
    tracking: ['Pixel', 'Configuração de Meta, TikTok e Google Tag.'],
    utmfy: ['UTMfy', 'Envio de eventos e padrao de order para atribuicao.'],
    gateways: ['Gateways', 'Multigateway preparado para Sunize, Paradise, AtomoPay e Bravo Pay.'],
    public: ['Público', 'Recomendações de audiência e segmentação para campanhas.'],
    sales: ['Vendas', 'Resumo por gateway e receita quando o checkout estiver conectado.'],
    backredirects: ['Backredirects', 'Tentativas de volta e pontos de abandono do funil.'],
    cloners: ['Clonadores', 'Sinais de clone, auditoria e risco por IP/user-agent.'],
    blacklist: ['Blacklist', 'Bloqueio manual de IPs suspeitos.'],
    audit: ['Auditoria', 'Histórico de acessos e alterações administrativas.'],
    pages: ['Páginas', 'Leitura de pageviews e etapas do funil.'],
  };
  const [title, subtitle] = titles[adminCurrentTab] || titles.overview;
  document.querySelector('#adminTitle').textContent = title;
  document.querySelector('#adminSubtitle').textContent = subtitle;

  const content = document.querySelector('#adminContent');
  if (!content) return;
  if (adminCurrentTab === 'leads') content.innerHTML = adminLeadsMarkup();
  else if (adminCurrentTab === 'tracking') content.innerHTML = trackingMarkup();
  else if (adminCurrentTab === 'utmfy') content.innerHTML = utmfyMarkup();
  else if (adminCurrentTab === 'gateways') content.innerHTML = gatewaysMarkup();
  else if (adminCurrentTab === 'public') content.innerHTML = publicMarkup();
  else if (adminCurrentTab === 'sales') content.innerHTML = salesMarkup();
  else if (adminCurrentTab === 'backredirects') content.innerHTML = backredirectsMarkup();
  else if (adminCurrentTab === 'cloners') content.innerHTML = clonersMarkup();
  else if (adminCurrentTab === 'blacklist') content.innerHTML = blacklistMarkup();
  else if (adminCurrentTab === 'audit') content.innerHTML = auditMarkup();
  else if (adminCurrentTab === 'pages') content.innerHTML = pagesMarkup();
  else content.innerHTML = overviewMarkup();
  bindAdminContent();
}

function bindAdminContent() {
  document.querySelector('#adminSearch')?.addEventListener('input', debounce(() => loadAdminData(), 320));
  document.querySelectorAll('#adminLeadsFrom, #adminLeadsTo').forEach((input) => input.addEventListener('change', () => loadAdminData({ force: true })));
  document.querySelector('#adminLoadMore')?.addEventListener('click', loadMoreAdminLeads);
  document.querySelectorAll('[data-test-integration]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = document.querySelector('#adminStatus');
      status.textContent = 'Testando integração...';
      const body = { kind: button.dataset.testIntegration };
      const result = await adminFetch('/api/admin/test-integration', {
        method: 'POST',
        body: JSON.stringify(body),
      }).catch((error) => ({ ok: false, message: error.message }));
      status.textContent = result.message || 'Teste concluído.';
    });
  });
  document.querySelectorAll('[data-gateway-config-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.gateway-card-rs');
      const panel = card?.querySelector('[data-gateway-config-panel]');
      const isOpen = !card?.classList.contains('is-open');
      card?.classList.toggle('is-open', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
      if (panel) panel.hidden = !isOpen;
      button.textContent = isOpen ? 'Recolher' : 'Configurar';
    });
  });
  document.querySelector('[data-gateway-test-open]')?.addEventListener('click', () => {
    const modal = document.querySelector('[data-gateway-test-modal]');
    modal?.classList.remove('hidden');
    modal?.setAttribute('aria-hidden', 'false');
    document.body.classList.add('admin-modal-open-rs');
    window.setTimeout(() => document.querySelector('#gatewayTestAmount')?.focus(), 80);
  });
  document.querySelectorAll('[data-gateway-test-close]').forEach((button) => {
    button.addEventListener('click', () => {
      const modal = document.querySelector('[data-gateway-test-modal]');
      modal?.classList.add('hidden');
      modal?.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('admin-modal-open-rs');
    });
  });
  document.querySelector('[data-gateway-test-run]')?.addEventListener('click', runGatewayTests);
  document.querySelector('[data-gateway-test-clear]')?.addEventListener('click', () => {
    const results = document.querySelector('#gatewayTestResults');
    const status = document.querySelector('#gatewayTestStatus');
    if (results) results.innerHTML = '<div class="gateway-test-empty-rs">Defina o valor, escolha os gateways e gere os PIXs de teste.</div>';
    if (status) status.textContent = '';
  });
  bindGatewayTestCopyButtons();
  document.querySelectorAll('[data-gateway-order-move]').forEach((button) => {
    button.addEventListener('click', () => {
      moveGatewayOrder(button.dataset.gateway, button.dataset.gatewayOrderMove);
    });
  });
  bindGatewayDragAndDrop();
  refreshGatewayOrderDom();
  document.querySelectorAll('[data-open-lead]').forEach((button) => {
    button.addEventListener('click', async () => {
      adminSelectedLeadSession = button.dataset.openLead || '';
      renderAdminPanel();
      try {
        const result = await adminFetch(`/api/admin/leads?session_id=${encodeURIComponent(adminSelectedLeadSession)}`);
        const index = adminLeads.findIndex((lead) => lead.session_id === adminSelectedLeadSession);
        if (index >= 0 && result.data) adminLeads[index] = result.data;
        renderAdminPanel();
      } catch (error) {
        const status = document.querySelector('#adminStatus');
        if (status) status.textContent = error.message || 'Falha ao carregar detalhes do lead.';
      }
    });
  });
  document.querySelectorAll('[data-close-lead]').forEach((button) => {
    button.addEventListener('click', () => {
      adminSelectedLeadSession = null;
      renderAdminPanel();
    });
  });
  document.querySelector('[data-copy-lead-payload]')?.addEventListener('click', async () => {
    const payload = document.querySelector('#leadPayloadJson')?.textContent || '';
    const status = document.querySelector('#leadCopyStatus');
    await navigator.clipboard?.writeText(payload).catch(() => {});
    if (status) status.textContent = 'JSON copiado.';
  });
  document.querySelector('#adminExportLeads')?.addEventListener('click', () => {
    window.open('/api/admin/leads-export', '_blank', 'noopener');
  });
  document.querySelector('#blacklistForm')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const ip = document.querySelector('#blacklistIp')?.value.trim() || '';
    const reason = document.querySelector('#blacklistReason')?.value.trim() || '';
    const status = document.querySelector('#adminStatus');
    status.textContent = 'Salvando bloqueio...';
    await adminFetch('/api/admin/ip-blacklist', { method: 'POST', body: JSON.stringify({ ip, reason }) });
    adminCurrentTab = 'blacklist';
    await loadAdminData({ force: true });
  });
  document.querySelectorAll('[data-remove-ip]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = document.querySelector('#adminStatus');
      status.textContent = 'Removendo IP...';
      await adminFetch(`/api/admin/ip-blacklist?ip=${encodeURIComponent(button.dataset.removeIp || '')}`, { method: 'DELETE' });
      adminCurrentTab = 'blacklist';
      await loadAdminData({ force: true });
    });
  });
  document.querySelectorAll('[data-block-cloner]').forEach((button) => {
    button.addEventListener('click', async () => {
      const ip = button.dataset.blockCloner || '';
      if (!ip) return;
      const status = document.querySelector('#adminStatus');
      if (status) status.textContent = `Bloqueando ${ip}...`;
      await adminFetch('/api/admin/ip-blacklist', {
        method: 'POST',
        body: JSON.stringify({ ip, reason: 'Bloqueado pela auditoria de clonadores' }),
      });
      adminCurrentTab = 'blacklist';
      await loadAdminData({ force: true });
    });
  });
}

function overviewMarkup() {
  const summary = adminOverview?.summary || {};
  const funnel = adminOverview?.funnel || {};
  const maxFunnel = Math.max(1, ...Object.values(funnel).map((value) => Number(value || 0)));
  const sources = adminOverview?.sources || [];
  return `
    <div class="admin-stats-rs admin-stats-rs--wide">
      ${statCard('Leads', summary.totalLeads || 0, 'Total carregado')}
      ${statCard('Com contato', summary.withContact || 0, 'Email ou telefone')}
      ${statCard('Quiz completo', summary.quizDone || 0, 'Avaliacoes finalizadas')}
      ${statCard('Qualificados', summary.qualified || 0, 'Pre-selecionados')}
      ${statCard('Pageviews', summary.pageviews || 0, 'Eventos de página')}
      ${statCard('Última atividade', formatShortDate(summary.lastUpdated), 'Supabase')}
    </div>
    <section class="admin-grid-2-rs">
      <div class="admin-section-rs">
        <div class="admin-section-head-rs"><h2>Funil nativo</h2><span>live</span></div>
        <div class="admin-funnel-rs">
          ${Object.entries({ home: 'Inicio', quiz: 'Quiz', dados: 'Dados', qualificados: 'Qualificados' }).map(([key, label]) => {
            const value = Number(funnel[key] || 0);
            return `<div class="admin-funnel-row-rs"><strong>${label}</strong><i><b style="width:${Math.max(4, (value / maxFunnel) * 100)}%"></b></i><span>${value}</span></div>`;
          }).join('')}
        </div>
      </div>
      <div class="admin-section-rs">
        <div class="admin-section-head-rs"><h2>Origens</h2><span>utm</span></div>
        <div class="admin-source-list-rs">
          ${sources.length ? sources.map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${item.value}</strong></div>`).join('') : '<p class="admin-empty-rs">Sem origem registrada ainda.</p>'}
        </div>
      </div>
    </section>
  `;
}

function adminLeadsMarkup() {
  const selectedLead = adminLeads.find((lead) => lead.session_id === adminSelectedLeadSession);
  return `
    <div class="admin-toolbar-rs">
      <input id="adminSearch" placeholder="Buscar nome, email, telefone..." value="${escapeAttr(adminLeadFilters.q)}" />
      <label class="admin-date-filter-rs"><span>De</span><input id="adminLeadsFrom" type="date" value="${escapeAttr(adminLeadFilters.from)}" /></label>
      <label class="admin-date-filter-rs"><span>Até</span><input id="adminLeadsTo" type="date" value="${escapeAttr(adminLeadFilters.to)}" /></label>
      <span class="admin-muted-rs">${adminLeadPagination.total ?? adminLeads.length} registros</span>
      ${adminLeadPagination.hasMore ? '<button class="admin-row-button-rs" id="adminLoadMore" type="button">Carregar mais</button>' : ''}
    </div>
    <div class="admin-table-wrap-rs">
      <table class="admin-table-rs">
        <thead><tr><th>Lead</th><th>Contato</th><th>Etapa</th><th>Quiz</th><th>Origem</th><th>Atualizado</th><th></th></tr></thead>
        <tbody>${leadRowsMarkup(adminLeads)}</tbody>
      </table>
    </div>
    ${selectedLead ? leadDetailMarkup(selectedLead) : ''}
  `;
}

async function loadMoreAdminLeads() {
  if (!adminLeadPagination.hasMore) return;
  const button = document.querySelector('#adminLoadMore');
  const { q, from, to } = adminLeadFilters;
  const offset = adminLeads.length;
  if (button) button.disabled = true;
  try {
    const result = await adminFetch(`/api/admin/leads?limit=200&offset=${offset}&q=${encodeURIComponent(q)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
    const incoming = Array.isArray(result.data) ? result.data : [];
    const known = new Set(adminLeads.map((lead) => lead.session_id));
    adminLeads.push(...incoming.filter((lead) => !known.has(lead.session_id)));
    adminLeadPagination = result.pagination || { offset, limit: 200, hasMore: incoming.length === 200, total: null };
    renderAdminPanel();
  } catch (error) {
    const status = document.querySelector('#adminStatus');
    if (status) status.textContent = error.message || 'Falha ao carregar mais leads.';
    if (button) button.disabled = false;
  }
}

function leadRowsMarkup(leads) {
  if (!leads.length) return '<tr><td colspan="7">Nenhum lead encontrado ainda.</td></tr>';
  return leads.map((lead) => {
    const payload = lead.payload || {};
    const quiz = payload.quiz || {};
    const quizText = quiz.score !== undefined ? `${quiz.score}/${quiz.total || '-'}` : '-';
    return `
      <tr class="admin-lead-row-rs" data-open-lead="${escapeAttr(lead.session_id || '')}">
        <td><strong>${escapeHtml(lead.name || lead.nome || '-')}</strong><br><span class="admin-chip-rs">${escapeHtml(lead.session_id || '-')}</span></td>
        <td>${escapeHtml(lead.email || '-')}<br>${escapeHtml(lead.phone || lead.telefone || '-')}</td>
        <td>${escapeHtml(lead.stage || lead.etapa || '-')}<br>${escapeHtml(lead.last_event || lead.evento || '-')}</td>
        <td>${escapeHtml(quizText)}<br>${escapeHtml(quiz.status || lead.quiz_status || '-')}</td>
        <td>${escapeHtml(lead.utm_source || '-')}<br>${escapeHtml(lead.utm_campaign || '')}</td>
        <td>${escapeHtml(formatDate(lead.updated_at || lead.created_at))}</td>
        <td><button class="admin-row-button-rs" data-open-lead="${escapeAttr(lead.session_id || '')}" type="button">Abrir</button></td>
      </tr>
    `;
  }).join('');
}

function leadDetailMarkup(lead) {
  const payload = lead.payload || {};
  const quiz = payload.quiz || {};
  const answers = Array.isArray(quiz.answers) ? quiz.answers : [];
  const pageviews = Array.isArray(lead.pageviews) ? lead.pageviews : [];
  const timeline = leadTimeline(lead, pageviews);
  const utm = payload.utm || {};
  return `
    <div class="lead-modal-rs" role="dialog" aria-modal="true" aria-label="Detalhes do lead">
      <div class="lead-modal-backdrop-rs" data-close-lead></div>
      <article class="lead-modal-panel-rs lead-modal-panel-rs--ifood">
        <button class="lead-modal-close-rs" data-close-lead type="button" aria-label="Fechar detalhes do lead">×</button>
        <div class="lead-detail-shell-rs">
          <aside class="lead-detail-rail-rs">
            <div class="lead-detail-hero-rs">
              <span class="lead-detail-kicker-rs">Lead completo</span>
              <h2>${escapeHtml(lead.name || lead.nome || 'Lead sem nome')}</h2>
              <p>${escapeHtml(lead.session_id || '-')} | ${escapeHtml(lead.stage || '-')} | ${escapeHtml(lead.last_event || '-')}</p>
            </div>
            <div class="lead-detail-tags-rs">
              <span class="admin-chip-rs">${escapeHtml(quiz.status || 'sem quiz')}</span>
              <span class="admin-chip-rs">${escapeHtml(lead.utm_source || utm.utm_source || 'sem origem')}</span>
              <span class="admin-chip-rs">${escapeHtml(pageviews.length ? `${pageviews.length} páginas` : 'sem pageviews')}</span>
            </div>
            <div class="lead-detail-summary-rs">
              ${leadSummaryCard('Quiz', quiz.score !== undefined ? `${quiz.score}/${quiz.total || '-'}` : '-', quiz.status || '-')}
              ${leadSummaryCard('Contato', lead.email || lead.phone ? 'Capturado' : 'Pendente', lead.email || lead.phone || '-')}
              ${leadSummaryCard('Atualizado', formatShortDate(lead.updated_at || lead.created_at), lead.client_ip || '-')}
            </div>
            <div class="lead-detail-actions-rs">
              <button class="admin-row-button-rs" data-copy-lead-payload type="button">Copiar JSON</button>
              <span class="admin-muted-rs" id="leadCopyStatus">Detalhes carregados da sessão.</span>
            </div>
          </aside>

          <div class="lead-detail-main-rs">
            <section class="lead-detail-section-rs lead-detail-section-rs--wide">
              <div class="admin-section-head-rs"><h2>Visão geral</h2><span>perfil</span></div>
              <div class="lead-detail-stat-grid-rs">
                ${leadInfoCard('Etapa atual', lead.stage || lead.etapa || '-', lead.last_event || lead.evento || '-')}
                ${leadInfoCard('Quiz', quiz.score !== undefined ? `${quiz.score}/${quiz.total || '-'}` : '-', quiz.status || '-')}
                ${leadInfoCard('Origem', lead.utm_source || utm.utm_source || '-', lead.utm_campaign || utm.utm_campaign || '-')}
                ${leadInfoCard('Criado', formatShortDate(lead.created_at), lead.client_ip || '-')}
              </div>
            </section>

            <section class="lead-detail-section-rs">
              <div class="admin-section-head-rs"><h2>Identidade e contato</h2><span>lead</span></div>
              <div class="lead-kv-rs">
                ${leadKv('Nome', lead.name || lead.nome)}
                ${leadKv('Email', lead.email)}
                ${leadKv('Telefone', lead.phone || lead.telefone)}
                ${leadKv('Sessão', lead.session_id)}
              </div>
            </section>

            <section class="lead-detail-section-rs">
              <div class="admin-section-head-rs"><h2>Origem e tracking</h2><span>utm</span></div>
              <div class="lead-kv-rs">
                ${leadKv('utm_source', lead.utm_source || utm.utm_source)}
                ${leadKv('utm_medium', lead.utm_medium || utm.utm_medium)}
                ${leadKv('utm_campaign', lead.utm_campaign || utm.utm_campaign)}
                ${leadKv('utm_content', lead.utm_content || utm.utm_content)}
                ${leadKv('utm_term', lead.utm_term || utm.utm_term)}
                ${leadKv('fbclid', lead.fbclid || utm.fbclid)}
                ${leadKv('ttclid', lead.ttclid || utm.ttclid)}
                ${leadKv('gclid', lead.gclid || utm.gclid)}
                ${leadKv('referrer', lead.referrer || utm.referrer)}
                ${leadKv('landing_page', lead.landing_page || utm.landing_page)}
              </div>
            </section>

            <section class="lead-detail-section-rs lead-detail-section-rs--wide">
              <div class="admin-section-head-rs"><h2>Jornada registrada</h2><span>${timeline.length} eventos</span></div>
              <div class="lead-detail-pages-rs">
                ${timeline.length ? timeline.map((item, index) => `
                  <article class="lead-detail-page-rs">
                    <div class="lead-detail-page-index-rs">${index + 1}</div>
                    <div>
                      <strong>${escapeHtml(item.label)}</strong>
                      <span>${escapeHtml(item.detail)}</span>
                      <small>${escapeHtml(formatDate(item.at))}</small>
                    </div>
                  </article>
                `).join('') : '<p class="admin-empty-rs">Sem trajetoria registrada.</p>'}
              </div>
            </section>

            <section class="lead-detail-section-rs lead-detail-section-rs--wide">
              <div class="admin-section-head-rs"><h2>Respostas do quiz</h2><span>${answers.length}</span></div>
              <div class="lead-answer-list-rs">
                ${answers.length ? answers.map((item) => `<div><span>${escapeHtml(item.question || '-')}</span><strong>${escapeHtml(item.answer || '-')}</strong><em>${escapeHtml(`${item.points ?? 0} pts`)}</em></div>`).join('') : '<p class="admin-empty-rs">Sem respostas registradas.</p>'}
              </div>
            </section>

            <section class="lead-detail-section-rs lead-detail-section-rs--wide">
              <div class="admin-section-head-rs"><h2>Payload completo</h2><span>debug</span></div>
              <pre class="lead-json-rs" id="leadPayloadJson">${escapeHtml(JSON.stringify(payload, null, 2))}</pre>
            </section>
          </div>
        </div>
      </article>
    </div>
  `;
}

function leadSummaryCard(label, value, hint) {
  return `<article><strong>${escapeHtml(value || '-')}</strong><span>${escapeHtml(label)}</span><em>${escapeHtml(hint || '-')}</em></article>`;
}

function leadInfoCard(label, value, hint) {
  return `<div class="lead-info-card-rs"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '-')}</strong><em>${escapeHtml(hint || '-')}</em></div>`;
}

function leadKv(label, value) {
  return `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value || '-')}</strong></div>`;
}

function leadTimeline(lead, pageviews = []) {
  const payload = lead.payload || {};
  const quiz = payload.quiz || {};
  const items = [];
  if (lead.created_at) items.push({ at: lead.created_at, label: 'Primeiro registro', detail: lead.stage || 'lead criado' });
  pageviews.forEach((view) => items.push({ at: view.created_at, label: `Página /${view.page || '-'}`, detail: 'pageview registrado' }));
  if (quiz.completedAt) items.push({ at: quiz.completedAt, label: 'Quiz finalizado', detail: `${quiz.score ?? '-'} de ${quiz.total ?? '-'} pontos` });
  if (lead.name || lead.email || lead.phone) items.push({ at: lead.updated_at || lead.created_at, label: 'Dados enviados', detail: [lead.name, lead.email, lead.phone].filter(Boolean).join(' · ') || 'contato capturado' });
  if (lead.last_event) items.push({ at: lead.updated_at || lead.created_at, label: 'Ultimo evento', detail: lead.last_event });
  return items
    .filter((item) => item.at)
    .sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
}

function trackingMarkup() {
  const tracking = adminSettings?.tracking || {};
  return `
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>Pixels e eventos</h2><span>tracking</span></div>
      <div class="admin-form-grid-rs">
        ${settingInput('tracking.metaPixel', 'Meta Pixel ID', tracking.metaPixel)}
        ${settingInput('tracking.metaAccessToken', 'Meta CAPI token', tracking.metaAccessToken, 'password')}
        ${settingInput('tracking.tiktokPixel', 'TikTok Pixel ID', tracking.tiktokPixel)}
        ${settingInput('tracking.googleTag', 'Google Tag / GTM', tracking.googleTag)}
        ${settingToggle('tracking.browserPixel', 'Pixel no navegador', tracking.browserPixel !== false)}
        ${settingToggle('tracking.serverEvents', 'Eventos server-side', tracking.serverEvents === true)}
      </div>
      <button class="admin-mini-button-rs" data-test-integration="Pixel" type="button">Testar tracking</button>
    </section>
  `;
}

function utmfyMarkup() {
  const utmfy = adminSettings?.utmfy || {};
  return `
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>UTMfy</h2><span>orders</span></div>
      <div class="admin-form-grid-rs">
        ${settingToggle('utmfy.enabled', 'Ativar UTMfy', utmfy.enabled === true)}
        ${settingInput('utmfy.apiKey', 'API key', utmfy.apiKey, 'password')}
        ${settingInput('utmfy.endpoint', 'Endpoint', utmfy.endpoint)}
        ${settingInput('utmfy.productName', 'Produto', utmfy.productName)}
        ${settingInput('utmfy.platform', 'Plataforma', utmfy.platform)}
      </div>
      <button class="admin-mini-button-rs" data-test-integration="UTMfy" type="button">Testar UTMfy</button>
    </section>
  `;
}

function gatewaysMarkup() {
  const gateways = adminSettings?.gateways || {};
  const order = gatewayOrderFromSettings(gateways);
  return `
    <section class="admin-section-rs">
      <div class="admin-section-head-rs gateway-admin-head-rs">
        <div>
          <h2>Multigateway</h2>
          <span>fallback pix</span>
        </div>
        <button class="admin-mini-button-rs gateway-test-open-rs" data-gateway-test-open type="button">Testar gateway</button>
      </div>
      <p class="admin-hint-rs">O primeiro gateway da fila recebe o PIX. Se ele falhar, o sistema tenta os proximos na ordem abaixo.</p>
      <input type="hidden" data-setting="gateways.active" value="${escapeAttr(order[0])}" data-gateway-active-input />
      <input type="hidden" data-setting="gateways.activeGateway" value="${escapeAttr(order[0])}" data-gateway-active-gateway-input />
      <div class="gateway-order-rs" data-gateway-order-list>
        ${order.map((name, index) => gatewayOrderRowMarkup(name, index)).join('')}
      </div>
      <div class="gateway-grid-rs">
        ${gatewayKeys.map((name) => gatewayCardMarkup(name, gateways[name] || {}, order)).join('')}
      </div>
      ${gatewayTestMarkup(gateways, order)}
    </section>
  `;
}

function gatewayTestMarkup(gateways = {}, order = gatewayKeys) {
  const active = order[0] || gatewayKeys[0];
  return `
    <div class="gateway-test-modal-rs hidden" data-gateway-test-modal aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="gatewayTestTitle">
      <button class="gateway-test-backdrop-rs" data-gateway-test-close type="button" aria-label="Fechar teste de gateway"></button>
      <div class="gateway-test-dialog-rs">
        <div class="gateway-test-head-rs">
          <div>
            <span>teste real</span>
            <h2 id="gatewayTestTitle">Gerar PIX de teste</h2>
          </div>
          <button class="gateway-test-close-rs" data-gateway-test-close type="button" aria-label="Fechar">Fechar</button>
        </div>
        <p class="admin-hint-rs">Gera PIXs reais direto nas credenciais salvas. Use valor baixo para validar fallback, QR Code e copia-e-cola antes de escalar tráfego.</p>
        <div class="gateway-test-controls-rs">
          <label class="field-rs">
            <span>Valor do teste</span>
            <input id="gatewayTestAmount" type="number" min="1" step="0.01" value="1.00" inputmode="decimal" />
          </label>
          <div class="gateway-test-options-rs" aria-label="Gateways para testar">
            ${gatewayKeys.map((name) => {
              const checked = name === active || gateways[name]?.enabled === true;
              return `
                <label>
                  <input type="checkbox" value="${escapeAttr(name)}" data-gateway-test-option ${checked ? 'checked' : ''} />
                  <span>${escapeHtml(gatewayLabel(name))}</span>
                </label>
              `;
            }).join('')}
          </div>
          <div class="gateway-test-actions-rs">
            <button class="admin-mini-button-rs" data-gateway-test-run type="button">Gerar teste</button>
            <button class="admin-row-button-rs" data-gateway-test-clear type="button">Limpar</button>
          </div>
        </div>
        <p class="admin-muted-rs gateway-test-status-rs" id="gatewayTestStatus"></p>
        <div class="gateway-test-results-rs" id="gatewayTestResults">
          <div class="gateway-test-empty-rs">Defina o valor, escolha os gateways e gere os PIXs de teste.</div>
        </div>
      </div>
    </div>
  `;
}

function gatewayOrderRowMarkup(name, index) {
  return `
    <div class="gateway-order-row-rs" data-gateway-order-item="${escapeAttr(name)}">
      <button class="gateway-drag-handle-rs" type="button" data-gateway-drag-handle aria-label="Arrastar ${escapeAttr(gatewayLabel(name))}">
        <span></span><span></span><span></span>
      </button>
      <div class="gateway-order-rank-rs">${index === 0 ? 'ativo' : `fallback ${index}`}</div>
      <div class="gateway-order-copy-rs">
        <strong>${gatewayLabel(name)}</strong>
        <span>${index === 0 ? 'Gateway principal da checkout' : 'Entra automaticamente se os anteriores falharem'}</span>
      </div>
      <div class="gateway-order-actions-rs">
        <button type="button" data-gateway-order-move="up" data-gateway="${escapeAttr(name)}" aria-label="Subir ${escapeAttr(gatewayLabel(name))}">SUBIR</button>
        <button type="button" data-gateway-order-move="down" data-gateway="${escapeAttr(name)}" aria-label="Descer ${escapeAttr(gatewayLabel(name))}">DESCER</button>
      </div>
    </div>
  `;
}

function gatewayCardMarkup(name, gateway, order = gatewayKeys) {
  const fallbackIndex = order.indexOf(name);
  const position = fallbackIndex === 0 ? 'principal' : fallbackIndex > 0 ? `fallback ${fallbackIndex}` : 'fora da fila';
  const panelId = `gatewayConfig-${name}`;
  return `
    <div class="gateway-card-rs" data-gateway-card="${escapeAttr(name)}">
      <div class="gateway-card-head-rs">
        <div>
          <strong>${gatewayLabel(name)}</strong>
          <small>${position}</small>
        </div>
        <div class="gateway-card-actions-rs">
          ${settingToggle(`gateways.${name}.enabled`, 'habilitado', gateway.enabled === true)}
          <button class="admin-row-button-rs gateway-config-toggle-rs" data-gateway-config-toggle="${escapeAttr(name)}" type="button" aria-expanded="false" aria-controls="${escapeAttr(panelId)}">Configurar</button>
        </div>
      </div>
      <div class="gateway-fields-rs" id="${escapeAttr(panelId)}" data-gateway-config-panel="${escapeAttr(name)}" hidden>
        ${gatewayFieldsMarkup(name, gateway)}
      </div>
    </div>
  `;
}

function gatewayFieldsMarkup(name, gateway) {
  const baseUrl = gateway.baseUrl || gateway.apiUrl || '';
  if (name === 'sunize') {
    return [
      settingInput('gateways.sunize.baseUrl', 'Base URL', baseUrl),
      settingInput('gateways.sunize.apiKey', 'API key', gateway.apiKey, 'password'),
      settingInput('gateways.sunize.apiSecret', 'API secret', gateway.apiSecret || gateway.secret, 'password'),
    ].join('');
  }
  if (name === 'paradise') {
    return [
      settingInput('gateways.paradise.baseUrl', 'Base URL', baseUrl),
      settingInput('gateways.paradise.apiKey', 'API key', gateway.apiKey, 'password'),
      settingInput('gateways.paradise.productHash', 'Product hash', gateway.productHash, 'password'),
      settingInput('gateways.paradise.orderbumpHash', 'Orderbump hash', gateway.orderbumpHash, 'password'),
      settingInput('gateways.paradise.source', 'Source', gateway.source || 'api_externa'),
      settingInput('gateways.paradise.description', 'Descrição PIX', gateway.description),
    ].join('');
  }
  if (name === 'atomopay') {
    return [
      settingInput('gateways.atomopay.baseUrl', 'Base URL', baseUrl),
      settingInput('gateways.atomopay.apiToken', 'API token', gateway.apiToken || gateway.apiKey, 'password'),
      settingInput('gateways.atomopay.offerHash', 'Offer hash', gateway.offerHash, 'password'),
      settingInput('gateways.atomopay.productHash', 'Product hash', gateway.productHash, 'password'),
      settingInput('gateways.atomopay.iofOfferHash', 'IOF offer hash', gateway.iofOfferHash, 'password'),
      settingInput('gateways.atomopay.iofProductHash', 'IOF product hash', gateway.iofProductHash, 'password'),
      settingInput('gateways.atomopay.correiosOfferHash', 'Correios offer hash', gateway.correiosOfferHash, 'password'),
      settingInput('gateways.atomopay.correiosProductHash', 'Correios product hash', gateway.correiosProductHash, 'password'),
      settingInput('gateways.atomopay.expressoOfferHash', 'Expresso offer hash', gateway.expressoOfferHash, 'password'),
      settingInput('gateways.atomopay.expressoProductHash', 'Expresso product hash', gateway.expressoProductHash, 'password'),
      settingInput('gateways.atomopay.webhookToken', 'Webhook token', gateway.webhookToken, 'password'),
    ].join('');
  }
  return [
    settingInput('gateways.bravopay.baseUrl', 'Base URL', baseUrl),
    settingInput('gateways.bravopay.apiKey', 'API key', gateway.apiKey, 'password'),
    settingInput('gateways.bravopay.webhookSecret', 'Webhook secret', gateway.webhookSecret || gateway.secret, 'password'),
    settingInput('gateways.bravopay.expiresIn', 'Expira em segundos', gateway.expiresIn || 3600, 'number'),
    settingInput('gateways.bravopay.description', 'Descrição PIX', gateway.description),
  ].join('');
}

function gatewayTestQrSrc(result = {}) {
  const direct = String(result.paymentQrUrl || result.paymentCodeBase64 || '').trim();
  if (direct) {
    if (/^https?:\/\//i.test(direct) || direct.startsWith('data:image')) return direct;
    return `data:image/png;base64,${direct}`;
  }
  const code = String(result.paymentCode || '').trim();
  return code ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(code)}` : '';
}

function gatewayTestResultsMarkup(results = [], amount = 0) {
  const list = Array.isArray(results) ? results : [];
  if (!list.length) return '<div class="gateway-test-empty-rs">Nenhum resultado retornado.</div>';
  return list.map((result) => {
    const ok = result?.ok === true;
    const qrSrc = gatewayTestQrSrc(result);
    const paymentCode = String(result?.paymentCode || '').trim();
    return `
      <article class="gateway-test-card-rs ${ok ? '' : 'gateway-test-card-rs--error'}">
        <div class="gateway-test-card-head-rs">
          <div>
            <span>Gateway de teste</span>
            <h3>${escapeHtml(result?.gatewayLabel || gatewayLabel(result?.gateway))}</h3>
          </div>
          <b>${ok ? 'Gerado' : 'Falhou'}</b>
        </div>
        <div class="gateway-test-meta-rs">
          <div><span>Valor</span><strong>${formatMoney(result?.amount || amount)}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(result?.statusRaw || (ok ? 'gerado' : 'falha'))}</strong></div>
          <div><span>TXID</span><strong>${escapeHtml(result?.txid || '-')}</strong></div>
        </div>
        ${ok && qrSrc ? `<img class="gateway-test-qr-rs" src="${escapeAttr(qrSrc)}" alt="QR Code ${escapeAttr(result?.gatewayLabel || '')}" />` : ''}
        ${paymentCode ? `
          <div class="gateway-test-copy-rs">
            <input value="${escapeAttr(paymentCode)}" readonly />
            <button class="admin-row-button-rs" data-gateway-test-copy type="button">Copiar código</button>
          </div>
        ` : ''}
        ${result?.detail ? `<p class="gateway-test-detail-rs">${escapeHtml(result.detail)}</p>` : ''}
      </article>
    `;
  }).join('');
}

function bindGatewayTestCopyButtons() {
  document.querySelectorAll('[data-gateway-test-copy]').forEach((button) => {
    button.addEventListener('click', async () => {
      const input = button.closest('.gateway-test-copy-rs')?.querySelector('input');
      const value = input?.value || '';
      await navigator.clipboard?.writeText(value).catch(() => {});
      button.textContent = 'Copiado';
      window.setTimeout(() => { button.textContent = 'Copiar código'; }, 1300);
    });
  });
}

async function runGatewayTests() {
  const runButton = document.querySelector('[data-gateway-test-run]');
  const amountInput = document.querySelector('#gatewayTestAmount');
  const status = document.querySelector('#gatewayTestStatus');
  const results = document.querySelector('#gatewayTestResults');
  const amount = Number(String(amountInput?.value || '').replace(',', '.'));
  const gateways = Array.from(document.querySelectorAll('[data-gateway-test-option]:checked')).map((item) => item.value);
  if (!Number.isFinite(amount) || amount < 1) {
    if (status) status.textContent = 'Informe um valor valido a partir de R$ 1,00.';
    amountInput?.focus();
    return;
  }
  if (!gateways.length) {
    if (status) status.textContent = 'Selecione ao menos um gateway para testar.';
    return;
  }
  if (runButton) runButton.disabled = true;
  if (status) status.textContent = 'Gerando PIXs de teste direto nos gateways salvos...';
  if (results) results.innerHTML = '<div class="gateway-test-empty-rs">Gerando testes. Aguarde alguns segundos...</div>';
  try {
    const data = await adminFetch('/api/admin/gateway-test-pix', {
      method: 'POST',
      body: JSON.stringify({ amount, gateways }),
    });
    if (results) results.innerHTML = gatewayTestResultsMarkup(data.results || [], data.amount || amount);
    const okCount = (data.results || []).filter((item) => item?.ok).length;
    const failCount = (data.results || []).filter((item) => !item?.ok).length;
    if (status) status.textContent = `Teste concluído: ${okCount} gerado(s), ${failCount} falha(s).`;
    bindGatewayTestCopyButtons();
  } catch (error) {
    if (status) status.textContent = error.message || 'Falha ao gerar PIXs de teste.';
    if (results) results.innerHTML = `<div class="gateway-test-empty-rs">${escapeHtml(error.message || 'Falha ao gerar PIXs de teste.')}</div>`;
  } finally {
    if (runButton) runButton.disabled = false;
  }
}

function pagesMarkup() {
  const pages = adminOverview?.pages || [];
  const list = adminOverview?.pagesList || [];
  return `
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>Páginas e eventos</h2><span>${list.length} bruto</span></div>
      <div class="admin-pages-rs">
        ${pages.length ? pages.map((item) => `<div><strong>${escapeHtml(item.page)}</strong><span>${item.views} views</span></div>`).join('') : '<p class="admin-empty-rs">Nenhuma página registrada ainda.</p>'}
      </div>
    </section>
  `;
}

function publicMarkup() {
  const pub = adminSettings?.public || {};
  const sales = adminExtras.sales || {};
  const data = sales.data || {};
  return `
    <section class="admin-grid-2-rs">
      <div class="admin-section-rs">
        <div class="admin-section-head-rs"><h2>Segmentacao</h2><span>Meta/TikTok</span></div>
        <div class="admin-form-grid-rs">
          ${settingInput('public.country', 'Pais', pub.country)}
          ${settingInput('public.gender', 'Genero', pub.gender)}
          ${settingInput('public.minAge', 'Idade minima', pub.minAge, 'number')}
          ${settingInput('public.maxAge', 'Idade máxima', pub.maxAge, 'number')}
          ${settingInput('public.devices', 'Dispositivos / plataformas', pub.devices)}
          ${settingInput('public.interests', 'Interesses', pub.interests)}
        </div>
        <label class="field-rs admin-field-wide-rs">
          <span>Recomendacao</span>
          <textarea data-setting="public.recommendation">${escapeHtml(pub.recommendation || '')}</textarea>
        </label>
      </div>
      <div class="admin-section-rs">
        <div class="admin-section-head-rs"><h2>Insights</h2><span>leads</span></div>
        <div class="admin-source-list-rs">
          ${(data.devices || []).map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${item.count}</strong></div>`).join('') || '<p class="admin-empty-rs">Sem dados de dispositivo ainda.</p>'}
        </div>
        <p class="admin-hint-rs">${escapeHtml(sales.audience?.recommendation || '')}</p>
        <p class="admin-hint-rs">${escapeHtml(sales.audience?.customAudience || '')}</p>
      </div>
    </section>
  `;
}

function salesMarkup() {
  const sales = adminExtras.sales || {};
  const gateway = adminExtras.gatewaySales || {};
  const summary = sales.summary || {};
  const gatewayRows = gateway.summary || [];
  const items = gateway.items || [];
  return `
    <div class="admin-stats-rs admin-stats-rs--wide">
      ${statCard('Leads', summary.totalLeads || 0, 'base')}
      ${statCard('Contatos', summary.contacts || 0, 'email/telefone')}
      ${statCard('Qualificados', summary.qualified || 0, 'quiz')}
      ${statCard('Vendas', gateway.detail?.totalSales || 0, 'gateway')}
      ${statCard('Receita', formatMoney(gateway.detail?.totalGrossRevenue || 0), 'bruto')}
      ${statCard('Conversao', `${summary.conversion || 0}%`, 'qualificados')}
    </div>
    <section class="admin-grid-2-rs">
      <div class="admin-section-rs">
        <div class="admin-section-head-rs"><h2>Por gateway</h2><span>pix</span></div>
        <div class="gateway-grid-rs">
          ${gatewayRows.map((row) => `<div class="gateway-card-rs"><div class="gateway-card-head-rs"><strong>${escapeHtml(row.gatewayLabel)}</strong><span>${row.salesCount || 0}</span></div><b class="admin-money-rs">${formatMoney(row.grossRevenue || 0)}</b><small>${escapeHtml(formatDate(row.lastPaidAt))}</small></div>`).join('')}
        </div>
      </div>
      <div class="admin-section-rs">
        <div class="admin-section-head-rs"><h2>Campanhas</h2><span>utm</span></div>
        <div class="admin-source-list-rs">
          ${(sales.data?.campaigns || []).map((item) => `<div><span>${escapeHtml(item.label)}</span><strong>${item.count}</strong></div>`).join('') || '<p class="admin-empty-rs">Sem campanhas ainda.</p>'}
        </div>
      </div>
    </section>
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>Últimas vendas</h2><span>${items.length}</span></div>
      <div class="admin-table-wrap-rs"><table class="admin-table-rs"><thead><tr><th>Lead</th><th>Gateway</th><th>Valor</th><th>Status</th><th>Pago em</th></tr></thead><tbody>
        ${items.length ? items.map((item) => `<tr><td>${escapeHtml(item.lead?.name || item.sessionId || '-')}</td><td>${escapeHtml(item.gatewayLabel)}</td><td>${formatMoney(item.amount)}</td><td>${escapeHtml(item.status)}</td><td>${formatDate(item.paidAt)}</td></tr>`).join('') : '<tr><td colspan="5">Nenhuma venda paga ainda.</td></tr>'}
      </tbody></table></div>
    </section>
  `;
}

function backredirectsMarkup() {
  const back = adminExtras.backredirects || {};
  const settings = adminSettings?.backredirects || {};
  return `
    <section class="admin-grid-2-rs">
      <div class="admin-section-rs">
        <div class="admin-section-head-rs"><h2>Resumo</h2><span>${back.summary?.totalBack || 0}</span></div>
        <div class="admin-stats-rs">
          ${statCard('Voltas', back.summary?.totalBack || 0, 'eventos')}
          ${statCard('Views base', back.summary?.totalViews || 0, 'páginas')}
          ${statCard('Taxa média', `${back.summary?.avgRate || 0}%`, 'abandono')}
        </div>
        <div class="admin-pages-rs">${(back.data || []).map((item) => `<div><strong>${escapeHtml(item.page)}</strong><span>${item.backTotal} voltas / ${item.rate}%</span></div>`).join('') || '<p class="admin-empty-rs">Sem backredirects registrados.</p>'}</div>
      </div>
      <div class="admin-section-rs">
        <div class="admin-section-head-rs"><h2>Rotas</h2><span>config</span></div>
        <div class="admin-form-grid-rs">
          ${settingToggle('backredirects.enabled', 'Ativar backredirect', settings.enabled !== false)}
          ${settingInput('backredirects.home', 'Destino home', settings.home)}
          ${settingInput('backredirects.quiz', 'Destino quiz', settings.quiz)}
          ${settingInput('backredirects.dados', 'Destino dados', settings.dados)}
        </div>
      </div>
    </section>
  `;
}

function clonersMarkup() {
  const cloners = adminExtras.cloners || {};
  const groups = cloners.groups || [];
  return `
    <div class="admin-stats-rs admin-stats-rs--wide">
      ${statCard('Eventos', cloners.summary?.total || 0, 'total')}
      ${statCard('Alto risco', cloners.summary?.high || 0, 'bloquear')}
      ${statCard('Médio risco', cloners.summary?.medium || 0, 'observar')}
      ${statCard('Baixo risco', cloners.summary?.low || 0, 'ok')}
      ${statCard('Ultimo evento', formatShortDate(cloners.summary?.lastEventAt), 'clone')}
      ${statCard('Grupos', groups.length, 'ip/ua')}
    </div>
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>Sinais agrupados</h2><span>segurança</span></div>
      <div class="admin-table-wrap-rs"><table class="admin-table-rs"><thead><tr><th>Chave</th><th>Risco</th><th>Score</th><th>Eventos</th><th>Ultimo</th><th></th></tr></thead><tbody>
        ${groups.length ? groups.map((item) => `<tr><td>${escapeHtml(item.key)}</td><td><span class="admin-chip-rs">${escapeHtml(item.risk)}</span></td><td>${item.score}</td><td>${item.total}</td><td>${formatDate(item.lastEventAt)}</td><td>${item.ip ? `<button class="admin-row-button-rs" data-block-cloner="${escapeAttr(item.ip)}" type="button">Bloquear IP</button>` : ''}</td></tr>`).join('') : '<tr><td colspan="6">Nenhum sinal de clonagem registrado.</td></tr>'}
      </tbody></table></div>
    </section>
  `;
}

function blacklistMarkup() {
  const entries = adminExtras.blacklist?.entries || [];
  return `
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>Bloquear IP</h2><span>${entries.length}</span></div>
      <form class="admin-form-grid-rs" id="blacklistForm">
        <label class="field-rs"><span>IP</span><input id="blacklistIp" placeholder="127.0.0.1" required /></label>
        <label class="field-rs"><span>Motivo</span><input id="blacklistReason" placeholder="Clone / fraude / teste" /></label>
        <button class="admin-mini-button-rs" type="submit">Adicionar bloqueio</button>
      </form>
    </section>
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>IPs bloqueados</h2><span>manual</span></div>
      <div class="admin-table-wrap-rs"><table class="admin-table-rs"><thead><tr><th>IP</th><th>Motivo</th><th>Sessão</th><th>Criado</th><th></th></tr></thead><tbody>
        ${entries.length ? entries.map((entry) => `<tr><td>${escapeHtml(entry.ip)}</td><td>${escapeHtml(entry.reason || '-')}</td><td>${escapeHtml(entry.sessionId || '-')}</td><td>${formatDate(entry.createdAt)}</td><td><button class="admin-row-button-rs" data-remove-ip="${escapeAttr(entry.ip)}" type="button">Remover</button></td></tr>`).join('') : '<tr><td colspan="5">Nenhum IP bloqueado.</td></tr>'}
      </tbody></table></div>
    </section>
  `;
}

function statCard(label, value, hint) {
  return `<div class="admin-stat-rs"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><em>${escapeHtml(hint)}</em></div>`;
}

function settingInput(path, label, value = '', type = 'text') {
  const clean = value === '__SECRET_SET__' ? '' : value || '';
  return `
    <label class="field-rs">
      <span>${escapeHtml(label)}</span>
      <input data-setting="${path}" type="${type}" value="${escapeAttr(clean)}" placeholder="${value === '__SECRET_SET__' ? 'Secret ja configurado' : ''}" />
    </label>
  `;
}

function settingToggle(path, label, checked) {
  return `
    <label class="admin-switch-rs">
      <input data-setting="${path}" type="checkbox" ${checked ? 'checked' : ''} />
      <span>${escapeHtml(label)}</span>
    </label>
  `;
}

async function saveAdminSettings() {
  const status = document.querySelector('#adminStatus');
  const patch = {};
  document.querySelectorAll('[data-setting]').forEach((input) => {
    const path = input.dataset.setting;
    const value = input.type === 'checkbox' ? input.checked : String(input.value || '').trim();
    if (input.type !== 'checkbox' && !value && input.placeholder === 'Secret ja configurado') return;
    setDeep(patch, path, value);
  });
  const gatewayOrder = gatewayOrderFromDom();
  if (gatewayOrder.length) {
    setDeep(patch, 'gateways.gatewayOrder', gatewayOrder);
    setDeep(patch, 'gateways.active', gatewayOrder[0]);
    setDeep(patch, 'gateways.activeGateway', gatewayOrder[0]);
  }
  status.textContent = 'Salvando configurações...';
  try {
    const result = await adminFetch('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ settings: patch }),
    });
    adminSettings = result.settings || adminSettings;
    status.textContent = 'Configurações salvas.';
    renderAdminPanel();
  } catch (error) {
    status.textContent = error.message || 'Falha ao salvar.';
  }
}

function setDeep(target, path, value) {
  const keys = String(path || '').split('.').filter(Boolean);
  let ref = target;
  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      ref[key] = value;
      return;
    }
    ref[key] = ref[key] && typeof ref[key] === 'object' ? ref[key] : {};
    ref = ref[key];
  });
}

function gatewayOrderFromSettings(gateways = {}) {
  const rawOrder = Array.isArray(gateways.gatewayOrder)
    ? gateways.gatewayOrder
    : String(gateways.gatewayOrder || '').split(',');
  const active = gateways.activeGateway || gateways.active;
  const merged = [active, ...rawOrder, ...gatewayKeys]
    .map((name) => String(name || '').trim().toLowerCase())
    .filter((name, index, list) => gatewayKeys.includes(name) && list.indexOf(name) === index);
  return merged.length ? merged : gatewayKeys;
}

function gatewayOrderFromDom() {
  return Array.from(document.querySelectorAll('[data-gateway-order-item]'))
    .map((item) => item.dataset.gatewayOrderItem)
    .filter((name) => gatewayKeys.includes(name));
}

function moveGatewayOrder(name, direction) {
  const list = document.querySelector('[data-gateway-order-list]');
  if (!list || !gatewayKeys.includes(name)) return;
  const rows = Array.from(list.querySelectorAll('[data-gateway-order-item]'));
  const index = rows.findIndex((row) => row.dataset.gatewayOrderItem === name);
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) return;
  if (direction === 'up') {
    list.insertBefore(rows[index], rows[targetIndex]);
  } else {
    list.insertBefore(rows[targetIndex], rows[index]);
  }
  refreshGatewayOrderDom();
}

function bindGatewayDragAndDrop() {
  const list = document.querySelector('[data-gateway-order-list]');
  if (!list) return;
  list.querySelectorAll('[data-gateway-drag-handle]').forEach((handle) => {
    handle.addEventListener('pointerdown', (event) => {
      if (event.button && event.button !== 0) return;
      const row = handle.closest('[data-gateway-order-item]');
      if (!row) return;
      event.preventDefault();
      row.classList.add('is-dragging');
      list.classList.add('is-sorting');
      handle.setPointerCapture?.(event.pointerId);

      const onPointerMove = (moveEvent) => {
        moveEvent.preventDefault();
        const afterElement = gatewayDragAfterElement(list, moveEvent.clientY);
        if (!afterElement) list.appendChild(row);
        else if (afterElement !== row) list.insertBefore(row, afterElement);
        refreshGatewayOrderDom();
      };

      const onPointerUp = () => {
        row.classList.remove('is-dragging');
        list.classList.remove('is-sorting');
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointercancel', onPointerUp);
        refreshGatewayOrderDom();
      };

      window.addEventListener('pointermove', onPointerMove, { passive: false });
      window.addEventListener('pointerup', onPointerUp, { once: true });
      window.addEventListener('pointercancel', onPointerUp, { once: true });
    });
  });
}

function gatewayDragAfterElement(list, y) {
  const rows = Array.from(list.querySelectorAll('[data-gateway-order-item]:not(.is-dragging)'));
  return rows.reduce((closest, row) => {
    const box = row.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: row };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function refreshGatewayOrderDom() {
  const order = gatewayOrderFromDom();
  document.querySelectorAll('[data-gateway-active-input], [data-gateway-active-gateway-input]').forEach((input) => {
    input.value = order[0] || gatewayKeys[0];
  });
  document.querySelectorAll('[data-gateway-order-item]').forEach((row, index) => {
    const rank = row.querySelector('.gateway-order-rank-rs');
    const description = row.querySelector('.gateway-order-copy-rs span');
    const buttons = row.querySelectorAll('[data-gateway-order-move]');
    row.classList.toggle('is-primary', index === 0);
    if (rank) rank.textContent = index === 0 ? 'ativo' : `fallback ${index}`;
    if (description) description.textContent = index === 0 ? 'Gateway principal da checkout' : 'Entra automaticamente se os anteriores falharem';
    buttons.forEach((button) => {
      button.disabled = (button.dataset.gatewayOrderMove === 'up' && index === 0)
        || (button.dataset.gatewayOrderMove === 'down' && index === order.length - 1);
    });
  });
}

function gatewayLabel(name) {
  return {
    sunize: 'Sunize',
    paradise: 'Paradise',
    atomopay: 'AtomoPay',
    bravopay: 'Bravo Pay',
  }[name] || name;
}

function formatShortDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));
}

function routeName() {
  const path = window.location.pathname.replace(/\/+$/, '') || '/';
  if (path === '/analise') return 'analise';
  if (path === '/dados') return 'dados';
  if (path === '/processando') return 'processando';
  if (path === '/ofertas') return 'ofertas';
  if (path === '/admin') return 'admin';
  return 'home';
}

function navigateTo(path) {
  window.history.pushState({}, '', path);
  render();
}

async function initSession({ force = false } = {}) {
  if (force || !sessionReady) {
    sessionReady = fetch('/api/site/session', { credentials: 'include', cache: 'no-store' })
      .then((response) => {
        if (!response.ok) sessionReady = null;
        return response;
      })
      .catch(() => {
        sessionReady = null;
        return null;
      });
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

function clarityValue(value) {
  if (Array.isArray(value)) return value.map(clarityValue).filter(Boolean);
  if (value === undefined || value === null || value === '') return '';
  return String(value).slice(0, 255);
}

function setClarityTag(key, value) {
  if (typeof window.clarity !== 'function') return;
  const cleanKey = clarityValue(key);
  const cleanValue = clarityValue(value);
  if (!cleanKey || !cleanValue || (Array.isArray(cleanValue) && !cleanValue.length)) return;
  try {
    window.clarity('set', cleanKey, cleanValue);
  } catch (_error) {}
}

function setClarityContext(page = routeName()) {
  if (typeof window.clarity !== 'function') return;
  const sessionId = getSessionId();
  try {
    window.clarity('identify', `session:${sessionId}`, sessionId, page, `session:${sessionId.slice(0, 8)}`);
  } catch (_error) {}

  setClarityTag('site', 'gta6_promo_quiz');
  setClarityTag('current_page', page);
  setClarityTag('current_path', window.location.pathname || '/');

  const utm = readJson(storageKeys.utm, {});
  clarityTagAllowList.forEach((key) => setClarityTag(key, utm[key]));

  const quiz = readJson(storageKeys.quiz, null);
  if (quiz) {
    setClarityTag('quiz_status', quiz.status);
    setClarityTag('quiz_score', quiz.score);
    setClarityTag('quiz_total', quiz.total);
  }

  const offer = readJson('gta6_selected_offer', null);
  if (offer) {
    setClarityTag('selected_offer_id', offer.id);
    setClarityTag('selected_offer_title', offer.title);
    setClarityTag('selected_offer_price', offer.price);
  }
}

function trackClarityEvent(name, tags = {}) {
  if (typeof window.clarity !== 'function') return;
  setClarityContext(tags.page || routeName());
  Object.entries(tags).forEach(([key, value]) => setClarityTag(key, value));
  const eventName = clarityValue(name);
  if (!eventName) return;
  try {
    window.clarity('event', eventName);
  } catch (_error) {}
}

function auditMarkup() {
  const rows = adminExtras.audit?.data || [];
  return `
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>Registro administrativo</h2><span>${rows.length}</span></div>
      <div class="admin-table-wrap-rs"><table class="admin-table-rs">
        <thead><tr><th>Ação</th><th>IP</th><th>Detalhes</th><th>Data</th></tr></thead>
        <tbody>${rows.length ? rows.map((row) => `
          <tr>
            <td><span class="admin-chip-rs">${escapeHtml(row.action || '-')}</span></td>
            <td>${escapeHtml(row.client_ip || '-')}</td>
            <td><code>${escapeHtml(JSON.stringify(row.detail || {}))}</code></td>
            <td>${formatDate(row.created_at)}</td>
          </tr>
        `).join('') : '<tr><td colspan="4">Nenhum registro de auditoria ainda.</td></tr>'}</tbody>
      </table></div>
    </section>
  `;
}

function appendTrackingScript(id, src) {
  if (!id || document.getElementById(id)) return;
  const script = document.createElement('script');
  script.id = id;
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
}

function initConfiguredTracking() {
  const tracking = siteConfig.tracking || {};
  if (tracking.browserPixel === false) return;

  const metaId = String(tracking.metaPixel || '').trim();
  if (/^\d{8,24}$/.test(metaId) && typeof window.fbq !== 'function') {
    const fbq = function (...args) { fbq.queue.push(args); };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    window.fbq = fbq;
    appendTrackingScript('gta-meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', metaId);
  }

  const tiktokId = String(tracking.tiktokPixel || '').trim();
  if (/^[A-Z0-9]{10,32}$/i.test(tiktokId) && !window.ttq) {
    const ttq = [];
    ttq.methods = ['page', 'track', 'identify', 'instances', 'debug', 'on', 'off', 'once', 'ready', 'alias', 'group', 'enableCookie', 'disableCookie'];
    ttq.setAndDefer = (target, method) => { target[method] = (...args) => target.push([method, ...args]); };
    ttq.methods.forEach((method) => ttq.setAndDefer(ttq, method));
    ttq.load = (id) => appendTrackingScript('gta-tiktok-pixel', `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${encodeURIComponent(id)}&lib=ttq`);
    window.ttq = ttq;
    ttq.load(tiktokId);
  }

  const googleTag = String(tracking.googleTag || '').trim();
  if (/^(G|GT|GTM)-[A-Z0-9-]+$/i.test(googleTag) && typeof window.gtag !== 'function') {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    appendTrackingScript('gta-google-tag', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(googleTag)}`);
    window.gtag('js', new Date());
    window.gtag('config', googleTag);
  }
}

function trackConfiguredEvent(name, data = {}) {
  if (siteConfig.tracking?.browserPixel !== false) {
    try { window.fbq?.('trackCustom', name, data); } catch (_error) {}
    try { window.ttq?.track?.(name, data); } catch (_error) {}
    try { window.gtag?.('event', name, data); } catch (_error) {}
  }
  if (siteConfig.tracking?.serverEvents === true) {
    fetch('/api/tracking/event', {
      method: 'POST',
      credentials: 'include',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        sessionId: getSessionId(),
        eventId: `${String(name).toLowerCase()}_${getSessionId()}_${Date.now()}`,
        sourceUrl: window.location.href,
        data,
      }),
    }).catch(() => null);
  }
}

async function loadSiteConfig() {
  try {
    const response = await fetch('/api/site/config', { credentials: 'include', cache: 'no-store' });
    if (!response.ok) return;
    siteConfig = await response.json();
    initConfiguredTracking();
  } catch (_error) {}
}

async function trackLead(payload = {}) {
  await initSession({ force: payload.event === 'personal_submitted' });
  const body = {
    sessionId: getSessionId(),
    utm: readJson(storageKeys.utm, {}),
    referrer: document.referrer || '',
    landing_page: window.location.pathname,
    sourceUrl: window.location.href,
    ...payload,
  };
  try {
    const send = () => fetch('/api/lead/track', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    let response = await send();
    if (response.status === 401) {
      await initSession({ force: true });
      response = await send();
    } else if (response.status >= 500) {
      await new Promise((resolve) => window.setTimeout(resolve, 240));
      response = await send();
    }
    const result = await response.json().catch(() => ({}));
    if (response.ok && payload.event) trackConfiguredEvent(payload.event, { stage: payload.stage || routeName() });
    return response.ok
      ? result
      : { ok: false, status: response.status, reason: result.reason || result.error || 'request_failed' };
  } catch (_error) {
    return { ok: false, reason: 'network_error' };
  }
}

async function trackPage(page) {
  await initSession();
  trackClarityEvent(`page_view_${page}`, { page, stage: page });
  trackConfiguredEvent('PageView', { page });
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
persistUtm();
loadSiteConfig();
render();
