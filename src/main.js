import './styles.css';
import './hero-polish.css';

const quiz = [
  {
    eyebrow: 'GTA VI',
    question: 'Qual jogo esta chegando na nova fase da Rockstar?',
    options: ['GTA VI', 'Minecraft 2', 'FIFA Street'],
    answer: 0,
  },
  {
    eyebrow: 'GTA V',
    question: 'GTA V ficou famoso por qual cidade principal?',
    options: ['Los Santos', 'Hyrule', 'Mushroom Kingdom'],
    answer: 0,
  },
  {
    eyebrow: 'GTA V',
    question: 'Qual desses personagens e protagonista de GTA V?',
    options: ['Franklin', 'Mario', 'Sonic'],
    answer: 0,
  },
  {
    eyebrow: 'GTA V',
    question: 'Qual atividade combina mais com GTA V?',
    options: ['Dirigir carros pela cidade', 'Cuidar de fazenda medieval', 'Montar castelo de gelo'],
    answer: 0,
  },
  {
    eyebrow: 'Online',
    question: 'GTA Online permite jogar com outras pessoas?',
    options: ['Sim', 'Nao', 'So offline'],
    answer: 0,
  },
  {
    eyebrow: 'GTA VI',
    question: 'Qual dupla aparece muito nos materiais de GTA VI?',
    options: ['Lucia e Jason', 'CJ e Ryder', 'Niko e Roman'],
    answer: 0,
  },
  {
    eyebrow: 'Vice City',
    question: 'GTA VI tem uma vibe mais proxima de qual clima?',
    options: ['Praias, neon e cidade viva', 'Neve eterna', 'Espaco sideral'],
    answer: 0,
  },
  {
    eyebrow: 'Rockstar',
    question: 'Qual empresa e conhecida pela serie GTA?',
    options: ['Rockstar Games', 'Nintendo', 'Roblox Corporation'],
    answer: 0,
  },
  {
    eyebrow: 'Perfil',
    question: 'Voce tem interesse em receber novidades de GTA VI?',
    options: ['Sim, tenho interesse', 'Nao conheco GTA', 'Nao jogo nada'],
    answer: 0,
  },
  {
    eyebrow: 'Final',
    question: 'Se fosse selecionado, voce gostaria de participar da proxima etapa?',
    options: ['Sim, quero participar', 'Nao quero', 'Talvez depois'],
    answer: 0,
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
        <span>${item.eyebrow}</span>
        <strong>${String(currentQuestion + 1).padStart(2, '0')}</strong>
      </div>
      <h2>${item.question}</h2>
      <div class="answers">
        ${item.options
          .map(
            (option, index) => `
              <button class="answer" data-index="${index}">
                <span>${option}</span>
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
  const correct = selected === quiz[currentQuestion].answer;
  const answers = document.querySelectorAll('.answer');

  answers.forEach((answer) => {
    const answerIndex = Number(answer.dataset.index);
    answer.disabled = true;
    answer.classList.toggle('is-correct', answerIndex === quiz[currentQuestion].answer);
    answer.classList.toggle('is-wrong', answerIndex === selected && !correct);
  });

  if (correct) {
    score += 1;
  }

  window.setTimeout(() => {
    currentQuestion += 1;

    if (currentQuestion >= quiz.length) {
      showResult(true);
      return;
    }

    isLocked = false;
    renderQuestion();
  }, 900);
}

function showResult(completed) {
  switchScreen('result');

  const approved = completed && score >= 6;
  const resultCard = document.querySelector('#resultCard');
  const title = approved ? 'Perfil selecionado' : 'Quase la';
  const copy = approved
    ? 'Voce concluiu a triagem inicial. A proxima etapa pode receber cadastro, plataforma e preferencias quando ligarmos Supabase.'
    : 'Voce concluiu o quiz. Tente novamente para melhorar seu perfil na selecao.';

  resultCard.innerHTML = `
    ${brand('light')}
    <p class="kicker">${score}/${quiz.length} respostas alinhadas</p>
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
