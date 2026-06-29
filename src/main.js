import './styles.css';
import './hero-polish.css';
import './quiz-polish.css';

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

let currentQuestion = 0;
let score = 0;
let isLocked = false;

const app = document.querySelector('#app');

function render() {
  app.innerHTML = `
    <main class="experience">
      <section class="hero screen is-active" id="home" aria-label="Inicio do quiz">
        <div class="hero__art" aria-hidden="true"></div>
        <div class="hero__grain" aria-hidden="true"></div>
        <div class="hero__speed-lines" aria-hidden="true"></div>
        <div class="hero__bottom-glass" aria-hidden="true"></div>
        <div class="particle-field" id="particles" aria-hidden="true"></div>

        <header class="topbar">
          <div class="topbar__logo">
            ${brandMark('symbol')}
          </div>
        </header>

        <div class="hero__content">
          <div class="hero__invite">
            <p class="kicker">Grand Theft Auto VI</p>
            <h1>
              <span>Participe da</span>
              <span>Promoção</span>
            </h1>
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
        <div class="quiz-ambient" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <div class="quiz-poster" aria-hidden="true"></div>
        <header class="quiz-header">
          <div class="quiz-header__logo" aria-label="Simbolo Rockstar Games">
            ${brandMark('quiz')}
          </div>
          <div class="quiz-header__status quiz-header__status--right">
            <div class="question-count" id="questionCount"></div>
          </div>
        </header>

        <div class="quiz-shell">
          <div class="progress-track" aria-hidden="true">
            <span id="progressBar"></span>
          </div>
          <article class="question-panel" id="questionPanel"></article>
        </div>
      </section>

      <section class="result-screen screen" id="result" aria-label="Resultado do quiz">
        <div class="result-burst" aria-hidden="true"></div>
        <div class="result-card" id="resultCard"></div>
      </section>
    </main>
  `;

  buildParticles();
  bindIntro();
  renderQuestion();
}

function brand(variant) {
  return `
    <div class="brand brand--${variant}" aria-label="Rockstar inspired mark">
      ${brandMark(variant)}
    </div>
  `;
}

function brandMark(variant = 'default') {
  const src = variant === 'symbol' || variant === 'quiz' ? '/assets/rockstar-logo-white-user-transparent.png' : '/assets/rockstar-logo.png';
  return `<img class="brand-mark brand-mark--${variant}" src="${src}" alt="Rockstar Games" />`;
}

function buildParticles() {
  const particles = document.querySelector('#particles');
  if (!particles) return;

  const nodes = Array.from({ length: 38 }, (_, index) => {
    const left = Math.round(Math.random() * 100);
    const delay = (Math.random() * 7).toFixed(2);
    const size = Math.round(2 + Math.random() * 5);
    return `<span style="--left:${left}%; --delay:${delay}s; --size:${size}px; --drift:${index % 2 ? 1 : -1};"></span>`;
  });

  particles.innerHTML = nodes.join('');
}

function bindIntro() {
  document.querySelector('#startButton')?.addEventListener('click', () => {
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

function optionIcon(option, index) {
  return typeof option === 'string' ? String.fromCharCode(65 + index) : option.icon;
}

function optionPoints(option, index, item) {
  if (typeof option === 'string') {
    return index === item.answer ? 1 : 0;
  }

  return Number(option.points || 0);
}

function maxScore() {
  return quiz.reduce((total, item) => {
    const best = Math.max(...item.options.map((option, index) => optionPoints(option, index, item)));
    return total + best;
  }, 0);
}

function renderQuestion(skipTransition = false) {
  const item = quiz[currentQuestion];
  const panel = document.querySelector('#questionPanel');
  const progress = document.querySelector('#progressBar');
  const questionCount = document.querySelector('#questionCount');

  if (!panel || !item) return;

  if (!skipTransition) {
    panel.classList.remove('question-panel--enter');
    panel.classList.add('question-panel--exit');
  }

  window.setTimeout(() => {
    panel.innerHTML = `
      <div class="question-panel__meta">
        <span>Pergunta ${currentQuestion + 1} de ${quiz.length}</span>
        <strong>${item.eyebrow}</strong>
      </div>
      <h2>${item.question}</h2>
      <div class="answers">
        ${item.options
          .map(
            (option, index) => `
              <button class="answer" data-index="${index}">
                <span class="answer__icon">${optionIcon(option, index)}</span>
                <span class="answer__text">${optionLabel(option)}</span>
                <b>${String.fromCharCode(65 + index)}</b>
              </button>
            `,
          )
          .join('')}
      </div>
    `;

    panel.classList.remove('question-panel--exit');
    panel.classList.add('question-panel--enter');
    panel.querySelectorAll('.answer').forEach((button) => {
      button.addEventListener('click', handleAnswer);
    });
  }, skipTransition ? 0 : 260);

  const progressValue = ((currentQuestion + 1) / quiz.length) * 100;
  if (progress) progress.style.width = `${progressValue}%`;
  if (questionCount) questionCount.textContent = `${currentQuestion + 1}/${quiz.length}`;
}

function handleAnswer(event) {
  if (isLocked) return;
  isLocked = true;

  const selected = Number(event.currentTarget.dataset.index);
  const item = quiz[currentQuestion];
  const selectedOption = item.options[selected];
  const answers = document.querySelectorAll('.answer');

  answers.forEach((answer) => {
    const answerIndex = Number(answer.dataset.index);
    answer.disabled = true;
    answer.classList.toggle('is-selected', answerIndex === selected);
    answer.classList.toggle('is-muted', answerIndex !== selected);
  });

  score += optionPoints(selectedOption, selected, item);

  window.setTimeout(() => {
    currentQuestion += 1;

    if (currentQuestion >= quiz.length) {
      showResult(true);
      return;
    }

    isLocked = false;
    renderQuestion();
  }, 720);
}

function showResult(completed) {
  switchScreen('result');

  const total = maxScore();
  const approved = completed && score >= Math.ceil(total * 0.55);
  const resultCard = document.querySelector('#resultCard');
  const title = approved ? 'Perfil pre-selecionado' : 'Perfil em analise';
  const copy = approved
    ? 'Seu perfil ficou alinhado com a triagem inicial. A proxima etapa coleta cadastro, plataforma e preferencias para finalizar a selecao.'
    : 'Voce concluiu a triagem. Algumas respostas ainda precisam de mais alinhamento para avancar na selecao.';

  resultCard.innerHTML = `
    ${brand('light')}
    <p class="kicker">${score}/${total} pontos de perfil</p>
    <h2>${title}</h2>
    <p>${copy}</p>
    <div class="result-actions">
      <button class="rockstar-button" id="retryButton">
        <span>TENTAR DE NOVO</span>
        <i aria-hidden="true"></i>
      </button>
    </div>
  `;

  document.querySelector('#retryButton')?.addEventListener('click', resetQuiz);
}

function resetQuiz() {
  currentQuestion = 0;
  score = 0;
  isLocked = false;
  switchScreen('home');
  renderQuestion(true);
}

render();
