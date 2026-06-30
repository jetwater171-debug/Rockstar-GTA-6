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

const gatewayKeys = ['sunize', 'paradise', 'atomopay', 'bravopay'];

const gtaOffers = [
  {
    id: 'standard',
    tag: 'Standard',
    title: 'GTA VI Standard',
    subtitle: 'Jogo base',
    description: 'Acesso a edicao principal vinculada ao perfil aprovado.',
    price: 207.98,
    oldPrice: 349.9,
    badge: 'Selecionado',
    image: '/assets/gta-vi-poster.jpg',
  },
  {
    id: 'ultimate',
    tag: 'Ultimate',
    title: 'GTA VI Ultimate',
    subtitle: 'Conteudo extra',
    description: 'Inclui pacote digital, bonus de inicio e prioridade na proxima etapa.',
    price: 289.3,
    oldPrice: 499.9,
    badge: 'Mais escolhido',
    image: '/assets/gta-vi-lucia-jason-phone.jpg',
    featured: true,
  },
  {
    id: 'early',
    tag: 'Antecipado',
    title: 'GTA VI Acesso Antecipado',
    subtitle: '7 dias antes',
    description: 'Libere a edicao com acesso uma semana antes da liberacao geral.',
    price: 359.9,
    oldPrice: 599.9,
    badge: 'Prioridade maxima',
    image: '/assets/gta-vi-lucia-jason-expanded.png',
    premium: true,
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

const app = document.querySelector('#app');

function render() {
  const route = routeName();
  if (route === 'analise') {
    renderAnalysisPage();
    return;
  }
  if (route === 'dados') {
    renderDataPage();
    return;
  }
  if (route === 'processando') {
    renderProcessingPage();
    return;
  }
  if (route === 'ofertas') {
    renderOffersPage();
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
            Responda ao questionario e desbloqueie sua
            participacao na <strong>campanha exclusiva do GTA 6.</strong>
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
      ${flowTopbarMarkup()}
      <section class="data-shell">
        <article class="data-card">
          <p class="data-kicker">Perfil inicial aprovado</p>
          <h1>${success ? 'Dados recebidos' : 'Complete seus dados'}</h1>
          <p class="data-copy data-copy--small">
            ${success
              ? 'Seu contato foi registrado e o perfil segue para a ultima analise da lista de interesse.'
              : 'Seu perfil passou pela avaliacao inicial do quiz. Agora complete seus dados para finalizar a analise e manter seu contato vinculado ao resultado.'}
          </p>
          ${success ? successMarkup() : dataFormMarkup(personal)}
          <p class="data-safe-note-rs">Projeto independente e nao afiliado a Rockstar Games. Nao solicitamos dados sensiveis.</p>
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
      <div class="quiz-header__logo" aria-label="Simbolo Rockstar Games">${brandMark('quiz')}</div>
    </header>
  `;
}

function renderAnalysisPage() {
  app.innerHTML = `
    <main class="analysis-screen" data-page="analise">
      ${flowTopbarMarkup()}
      <section class="analysis-shell-rs">
        <article class="analysis-card-rs">
          <div class="analysis-loader-rs" aria-hidden="true">
            <span></span>
            <i></i>
          </div>
          <p class="data-kicker">Analise em andamento</p>
          <h1>Analisando seu perfil</h1>
          <p class="analysis-copy-rs">Estamos cruzando suas respostas, interesses de jogo e compatibilidade inicial para liberar a proxima etapa.</p>
          <div class="analysis-steps-rs" aria-hidden="true">
            <span style="--delay:0ms">Validando respostas</span>
            <span style="--delay:520ms">Calculando perfil</span>
            <span style="--delay:1040ms">Preparando etapa final</span>
          </div>
          <div class="analysis-bar-rs" aria-hidden="true"><span></span></div>
        </article>
      </section>
    </main>
  `;
  initSession();
  trackPage('analise');
  window.setTimeout(() => navigateTo('/dados'), 4400);
}

function dataScoreMarkup(summary = {}) {
  const total = Number(summary.total || 0);
  const score = Number(summary.score || 0);
  const percent = total ? Math.round((score / total) * 100) : 0;
  const status = summary.status || (percent >= 70 ? 'Perfil forte' : percent >= 45 ? 'Perfil em analise' : 'Interesse registrado');
  return `
    <aside class="data-score-rs" aria-label="Resultado do quiz">
      <div class="data-score-ring-rs" style="--score:${Math.max(0, Math.min(100, percent))}">
        <strong>${percent}%</strong>
        <span>match</span>
      </div>
      <div>
        <small>Resultado do quiz</small>
        <b>${escapeHtml(status)}</b>
        <p>${total ? `${score} de ${total} pontos considerados no perfil.` : 'Quiz concluido e pronto para vinculacao.'}</p>
      </div>
    </aside>
  `;
}

function dataFormMarkup(personal) {
  return `
    <form class="data-form" id="leadForm">
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
          <span>WhatsApp</span>
          <input id="leadPhone" name="phone" value="${escapeAttr(personal.phone || '')}" inputmode="tel" autocomplete="tel" required />
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
      <button class="data-submit" type="button" disabled>Perfil em analise</button>
      <p class="form-status-rs is-ok">A proxima etapa do funil sera conectada aqui.</p>
    </div>
  `;
}

function renderAdminPage() {
  app.innerHTML = `
    <main class="admin-screen" data-page="admin">
      <section class="admin-shell-rs admin-shell-rs--pro">
        <article class="admin-card-rs" id="adminLoginCard">
          <div class="admin-logo-rs">${brandMark('quiz')}</div>
          <p class="admin-kicker-rs">Painel privado</p>
          <h1>Admin Rockstar</h1>
          <p class="admin-muted-rs">Central de leads, tracking, UTMfy, pixels e gateways da promocao GTA VI.</p>
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
            <nav class="admin-nav-rs" aria-label="Administracao">
              <button class="is-active" data-admin-tab="overview" type="button">Visao geral</button>
              <button data-admin-tab="leads" type="button">Leads</button>
              <button data-admin-tab="tracking" type="button">Pixel</button>
              <button data-admin-tab="utmfy" type="button">UTMfy</button>
              <button data-admin-tab="gateways" type="button">Gateways</button>
              <button data-admin-tab="public" type="button">Publico</button>
              <button data-admin-tab="sales" type="button">Vendas</button>
              <button data-admin-tab="backredirects" type="button">Backredirects</button>
              <button data-admin-tab="cloners" type="button">Clonadores</button>
              <button data-admin-tab="blacklist" type="button">Blacklist</button>
              <button data-admin-tab="pages" type="button">Paginas</button>
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
                <h1 id="adminTitle">Visao geral</h1>
                <p class="admin-muted-rs" id="adminSubtitle">Monitoramento do funil promocional em tempo real.</p>
              </div>
              <div class="admin-actions-rs">
                <button class="admin-button-rs admin-button-rs--ghost" id="saveAdminSettings" type="button">Salvar</button>
                <button class="admin-button-rs" id="refreshAdmin" type="button">Atualizar</button>
              </div>
            </div>
            <div class="admin-alert-rs" id="adminStatus">Carregando painel...</div>
            <div class="admin-content-rs" id="adminContent"></div>
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
  navigateTo('/analise');
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
    window.setTimeout(() => navigateTo('/processando'), 420);
  });
}

function renderProcessingPage() {
  app.innerHTML = `
    <main class="processing-screen" data-page="processando">
      ${flowTopbarMarkup()}
      <section class="processing-shell-rs">
        <article class="processing-card-rs">
          <p class="processing-kicker-rs">Etapa final</p>
          <h1>Verificacao em andamento...</h1>
          <p class="processing-copy-rs" id="processingHeadline">Assista ao comunicado enquanto finalizamos a analise do perfil.</p>

          <div class="processing-progress-rs" aria-label="Progresso da verificacao">
            <div class="processing-segments-rs" aria-hidden="true">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <strong id="processingPercent">77%</strong>
          </div>

          <div class="processing-stage-rs processing-stage-rs--clean">
            <div class="processing-video-shell-rs">
              <div class="processing-video-rs" role="img" aria-label="Video explicativo da proxima etapa">
                <img src="/assets/gta-vi-poster.jpg" alt="" />
                <div class="processing-video-shade-rs"></div>
                <button class="processing-play-rs" type="button" aria-label="Assistir video">
                  <span></span>
                </button>
                <div class="processing-video-caption-rs">
                  <small>Comunicado</small>
                  <b>Assista para continuar</b>
                </div>
              </div>
            </div>
          </div>
        </article>
        <footer class="processing-footer-rs">Projeto independente. Nao afiliado a Rockstar Games.</footer>
      </section>
    </main>
  `;
  initSession();
  trackPage('processando');
  animateProcessingPercent();
  bindProcessingPage();
}

function bindProcessingPage() {
  const playButton = document.querySelector('.processing-play-rs');
  const caption = document.querySelector('.processing-video-caption-rs b');
  const headline = document.querySelector('#processingHeadline');
  const goOffers = async (event = 'vsl_completed') => {
    if (routeName() !== 'processando') return;
    await trackLead({
      stage: 'processando',
      event,
      personal: readJson(storageKeys.personal, {}),
      quiz: readJson(storageKeys.quiz, null),
    });
    navigateTo('/ofertas');
  };

  let started = false;
  playButton?.addEventListener('click', () => {
    if (started) return;
    started = true;
    playButton.classList.add('is-playing');
    playButton.setAttribute('aria-label', 'Video em andamento');
    if (caption) caption.textContent = 'Liberando selecao...';
    if (headline) headline.textContent = 'Estamos validando a ultima etapa enquanto o comunicado termina.';
    window.setTimeout(() => goOffers('vsl_completed'), 8500);
  });

  window.setTimeout(() => {
    if (!started) goOffers('vsl_auto_completed');
  }, 28000);
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
          <p>
            Parabens, ${escapeHtml(firstName)}. Sua analise foi concluida e uma selecao especial foi liberada para este cadastro.
          </p>
        </article>

        <section class="offer-list-rs" aria-label="Escolha sua edicao">
          ${gtaOffers.map(offerCardMarkup).join('')}
        </section>

        <p class="offer-disclaimer-rs">Projeto independente e nao afiliado a Rockstar Games. Valores e disponibilidade fazem parte desta experiencia promocional.</p>
      </section>
    </main>
  `;
  initSession();
  trackPage('ofertas');
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
      <div class="offer-product-rs" aria-hidden="true">
        <div class="offer-product-box-rs">
          <img class="offer-art-rs" src="${offer.image}" alt="" />
          <img src="/assets/gta-vi-logo-user-clean.png" alt="" />
          <small>${escapeHtml(offer.subtitle)}</small>
        </div>
      </div>
      <div class="offer-card-copy-rs">
        <h2>${escapeHtml(offer.title)}</h2>
        <p>${escapeHtml(offer.description)}</p>
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

function animateProcessingPercent() {
  const target = document.querySelector('#processingPercent');
  if (!target) return;
  const start = 77;
  const end = 94;
  const startedAt = performance.now();
  const duration = 6200;
  const tick = (now) => {
    const progress = Math.min(1, (now - startedAt) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    target.textContent = `${Math.round(start + (end - start) * eased)}%`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function animateProcessingChecks() {
  const checks = Array.from(document.querySelectorAll('[data-processing-check]'));
  const headline = document.querySelector('#processingHeadline');
  if (!checks.length) return;
  const messages = [
    'Verificando se o perfil esta apto para seguir na lista...',
    'Cruzando respostas com os criterios da etapa atual...',
    'Validando prioridade e consistencia do cadastro...',
    'Preparando a proxima liberacao enquanto o video roda...',
  ];
  let activeIndex = 0;
  const update = () => {
    checks.forEach((item, index) => {
      item.classList.toggle('is-done', index < activeIndex);
      item.classList.toggle('is-active', index === activeIndex);
    });
    if (headline) headline.textContent = messages[activeIndex] || messages[0];
    activeIndex = (activeIndex + 1) % checks.length;
  };
  update();
  window.setInterval(update, 2600);
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

  document.querySelector('#refreshAdmin')?.addEventListener('click', () => loadAdminData({ force: true }));
  document.querySelector('#saveAdminSettings')?.addEventListener('click', saveAdminSettings);
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
  if (status) status.textContent = force ? 'Atualizando dados...' : 'Carregando...';
  try {
    const [overviewJson, leadsJson, pagesJson, settingsJson, salesJson, gatewaySalesJson, backJson, clonersJson, blacklistJson] = await Promise.all([
      adminFetch('/api/admin/overview'),
      adminFetch(`/api/admin/leads?limit=200&q=${encodeURIComponent(q)}`),
      adminFetch('/api/admin/pages'),
      adminFetch('/api/admin/settings'),
      adminFetch('/api/admin/sales-insights'),
      adminFetch('/api/admin/gateway-sales'),
      adminFetch('/api/admin/backredirects'),
      adminFetch('/api/admin/clonadores'),
      adminFetch('/api/admin/ip-blacklist'),
    ]);
    adminOverview = overviewJson;
    adminLeads = Array.isArray(leadsJson.data) ? leadsJson.data : [];
    adminSettings = settingsJson.settings || {};
    adminExtras = {
      sales: salesJson,
      gatewaySales: gatewaySalesJson,
      backredirects: backJson,
      cloners: clonersJson,
      blacklist: blacklistJson,
    };
    adminOverview.pagesList = Array.isArray(pagesJson.data) ? pagesJson.data : [];
    renderAdminPanel();
    document.querySelector('#adminHealth').textContent = 'Online';
    if (status) status.textContent = `${adminLeads.length} leads carregados. Ultima leitura ${formatDate(new Date().toISOString())}.`;
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
    overview: ['Visao geral', 'Performance, funil e origem dos leads em uma tela.'],
    leads: ['Leads', 'Lista operacional com quiz, contato, UTM e etapa atual.'],
    tracking: ['Pixel', 'Configuracao de Meta, TikTok e Google Tag.'],
    utmfy: ['UTMfy', 'Envio de eventos e padrao de order para atribuicao.'],
    gateways: ['Gateways', 'Multigateway preparado para Sunize, Paradise, AtomoPay e Bravo Pay.'],
    public: ['Publico', 'Recomendacoes de audiencia e segmentacao para campanhas.'],
    sales: ['Vendas', 'Resumo por gateway e receita quando o checkout estiver conectado.'],
    backredirects: ['Backredirects', 'Tentativas de volta e pontos de abandono do funil.'],
    cloners: ['Clonadores', 'Sinais de clone, auditoria e risco por IP/user-agent.'],
    blacklist: ['Blacklist', 'Bloqueio manual de IPs suspeitos.'],
    pages: ['Paginas', 'Leitura de pageviews e etapas do funil.'],
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
  else if (adminCurrentTab === 'pages') content.innerHTML = pagesMarkup();
  else content.innerHTML = overviewMarkup();
  bindAdminContent();
}

function bindAdminContent() {
  document.querySelector('#adminSearch')?.addEventListener('input', debounce(() => loadAdminData(), 320));
  document.querySelectorAll('[data-test-integration]').forEach((button) => {
    button.addEventListener('click', async () => {
      const status = document.querySelector('#adminStatus');
      status.textContent = 'Testando integracao...';
      const body = { kind: button.dataset.testIntegration };
      const result = await adminFetch('/api/admin/test-integration', {
        method: 'POST',
        body: JSON.stringify(body),
      }).catch((error) => ({ ok: false, message: error.message }));
      status.textContent = result.message || 'Teste concluido.';
    });
  });
  document.querySelectorAll('[data-gateway-order-move]').forEach((button) => {
    button.addEventListener('click', () => {
      moveGatewayOrder(button.dataset.gateway, button.dataset.gatewayOrderMove);
    });
  });
  bindGatewayDragAndDrop();
  refreshGatewayOrderDom();
  document.querySelectorAll('[data-open-lead]').forEach((button) => {
    button.addEventListener('click', () => {
      adminSelectedLeadSession = button.dataset.openLead || '';
      renderAdminPanel();
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
      ${statCard('Pageviews', summary.pageviews || 0, 'Eventos de pagina')}
      ${statCard('Ultima atividade', formatShortDate(summary.lastUpdated), 'Supabase')}
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
      <input id="adminSearch" placeholder="Buscar nome, email, telefone..." />
      <span class="admin-muted-rs">${adminLeads.length} registros</span>
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
              <span class="admin-chip-rs">${escapeHtml(pageviews.length ? `${pageviews.length} paginas` : 'sem pageviews')}</span>
            </div>
            <div class="lead-detail-summary-rs">
              ${leadSummaryCard('Quiz', quiz.score !== undefined ? `${quiz.score}/${quiz.total || '-'}` : '-', quiz.status || '-')}
              ${leadSummaryCard('Contato', lead.email || lead.phone ? 'Capturado' : 'Pendente', lead.email || lead.phone || '-')}
              ${leadSummaryCard('Atualizado', formatShortDate(lead.updated_at || lead.created_at), lead.client_ip || '-')}
            </div>
            <div class="lead-detail-actions-rs">
              <button class="admin-row-button-rs" data-copy-lead-payload type="button">Copiar JSON</button>
              <span class="admin-muted-rs" id="leadCopyStatus">Detalhes carregados da sessao.</span>
            </div>
          </aside>

          <div class="lead-detail-main-rs">
            <section class="lead-detail-section-rs lead-detail-section-rs--wide">
              <div class="admin-section-head-rs"><h2>Visao geral</h2><span>perfil</span></div>
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
                ${leadKv('Sessao', lead.session_id)}
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
  pageviews.forEach((view) => items.push({ at: view.created_at, label: `Pagina /${view.page || '-'}`, detail: 'pageview registrado' }));
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
      <div class="admin-section-head-rs"><h2>Multigateway</h2><span>fallback pix</span></div>
      <p class="admin-hint-rs">O primeiro gateway da fila recebe o PIX. Se ele falhar, o sistema tenta os proximos na ordem abaixo.</p>
      <input type="hidden" data-setting="gateways.active" value="${escapeAttr(order[0])}" data-gateway-active-input />
      <input type="hidden" data-setting="gateways.activeGateway" value="${escapeAttr(order[0])}" data-gateway-active-gateway-input />
      <div class="gateway-order-rs" data-gateway-order-list>
        ${order.map((name, index) => gatewayOrderRowMarkup(name, index)).join('')}
      </div>
      <div class="gateway-grid-rs">
        ${gatewayKeys.map((name) => gatewayCardMarkup(name, gateways[name] || {}, order)).join('')}
      </div>
      <button class="admin-mini-button-rs" data-test-integration="Gateway PIX" type="button">Testar gateway ativo</button>
    </section>
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
  return `
    <div class="gateway-card-rs">
      <div class="gateway-card-head-rs">
        <div>
          <strong>${gatewayLabel(name)}</strong>
          <small>${position}</small>
        </div>
        ${settingToggle(`gateways.${name}.enabled`, 'habilitado', gateway.enabled === true)}
      </div>
      <div class="gateway-fields-rs">
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
      settingInput('gateways.paradise.description', 'Descricao PIX', gateway.description),
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
    settingInput('gateways.bravopay.description', 'Descricao PIX', gateway.description),
  ].join('');
}

function pagesMarkup() {
  const pages = adminOverview?.pages || [];
  const list = adminOverview?.pagesList || [];
  return `
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>Paginas e eventos</h2><span>${list.length} bruto</span></div>
      <div class="admin-pages-rs">
        ${pages.length ? pages.map((item) => `<div><strong>${escapeHtml(item.page)}</strong><span>${item.views} views</span></div>`).join('') : '<p class="admin-empty-rs">Nenhuma pagina registrada ainda.</p>'}
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
          ${settingInput('public.maxAge', 'Idade maxima', pub.maxAge, 'number')}
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
      <div class="admin-section-head-rs"><h2>Ultimas vendas</h2><span>${items.length}</span></div>
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
          ${statCard('Views base', back.summary?.totalViews || 0, 'paginas')}
          ${statCard('Taxa media', `${back.summary?.avgRate || 0}%`, 'abandono')}
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
      ${statCard('Medio risco', cloners.summary?.medium || 0, 'observar')}
      ${statCard('Baixo risco', cloners.summary?.low || 0, 'ok')}
      ${statCard('Ultimo evento', formatShortDate(cloners.summary?.lastEventAt), 'clone')}
      ${statCard('Grupos', groups.length, 'ip/ua')}
    </div>
    <section class="admin-section-rs">
      <div class="admin-section-head-rs"><h2>Sinais agrupados</h2><span>seguranca</span></div>
      <div class="admin-table-wrap-rs"><table class="admin-table-rs"><thead><tr><th>Chave</th><th>Risco</th><th>Score</th><th>Eventos</th><th>Ultimo</th></tr></thead><tbody>
        ${groups.length ? groups.map((item) => `<tr><td>${escapeHtml(item.key)}</td><td><span class="admin-chip-rs">${escapeHtml(item.risk)}</span></td><td>${item.score}</td><td>${item.total}</td><td>${formatDate(item.lastEventAt)}</td></tr>`).join('') : '<tr><td colspan="5">Nenhum sinal de clonagem registrado.</td></tr>'}
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
      <div class="admin-table-wrap-rs"><table class="admin-table-rs"><thead><tr><th>IP</th><th>Motivo</th><th>Sessao</th><th>Criado</th><th></th></tr></thead><tbody>
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
  status.textContent = 'Salvando configuracoes...';
  try {
    const result = await adminFetch('/api/admin/settings', {
      method: 'POST',
      body: JSON.stringify({ settings: patch }),
    });
    adminSettings = result.settings || adminSettings;
    status.textContent = 'Configuracoes salvas.';
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
