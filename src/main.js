import './styles.css';

const quiz = [
  {
    eyebrow: 'Identidade',
    question: 'Qual dupla protagoniza a nova fase de GTA VI?',
    options: ['Lucia e Jason', 'Michael e Trevor', 'Tommy e Lance'],
    answer: 0,
  },
  {
    eyebrow: 'Mapa',
    question: 'GTA VI apresenta um estado ficticio inspirado principalmente em qual clima?',
    options: ['Florida moderna e neon', 'Alasca selvagem', 'Europa medieval'],
    answer: 0,
  },
  {
    eyebrow: 'Estilo',
    question: 'Qual elemento combina mais com a identidade visual de GTA VI?',
    options: ['Noites tropicais, neon e caos urbano', 'Castelos e magia antiga', 'Faroeste seco e silencioso'],
    answer: 0,
  },
  {
    eyebrow: 'Gameplay',
    question: 'Em GTA, qual comportamento mostra melhor que voce entende a experiencia?',
    options: ['Explorar missoes, mapa, historia e detalhes', 'Ignorar tudo e sair do jogo', 'Usar sempre a mesma rua'],
    answer: 0,
  },
  {
    eyebrow: 'Universo',
    question: 'Qual destes nomes esta mais associado a GTA?',
    options: ['Vice City', 'Hyrule', 'Raccoon City'],
    answer: 0,
  },
  {
    eyebrow: 'Comunidade',
    question: 'Qual atitude ajuda a manter uma comunidade boa em eventos online?',
    options: ['Respeitar regras e outros jogadores', 'Spammar golpes no chat', 'Vazar dados de pessoas'],
    answer: 0,
  },
  {
    eyebrow: 'Conhecimento',
    question: 'Qual empresa publica a serie Grand Theft Auto?',
    options: ['Rockstar Games', 'Mojang Studios', 'Valve'],
    answer: 0,
  },
  {
    eyebrow: 'Perfil',
    question: 'Para uma promocao gamer, qual dado faz mais sentido pedir primeiro?',
    options: ['Interesse na plataforma e no jogo', 'Senha pessoal', 'Codigo do cartao'],
    answer: 0,
  },
  {
    eyebrow: 'Lancamento',
    question: 'Qual plataforma costuma ser central em grandes lancamentos AAA?',
    options: ['Consoles atuais', 'Calculadoras escolares', 'TV sem internet'],
    answer: 0,
  },
  {
    eyebrow: 'Final',
    question: 'O que voce faria primeiro ao entrar em um novo GTA?',
    options: ['Explorar a cidade e sentir o mapa', 'Fechar antes do menu', 'Apagar o save'],
    answer: 0,
  },
];

let currentQuestion = 0;
let lives = 3;
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
        <div class="particle-field" id="particles" aria-hidden="true"></div>

        <header class="topbar">
          ${brand('dark')}
          <span class="topbar__tag">Selecao promocional</span>
        </header>

        <div class="hero__content">
          <p class="kicker">Vice City esta chamando</p>
          <h1>Entre no quiz e prove que seu perfil combina com GTA VI.</h1>
          <p class="hero__copy">
            Uma triagem rapida com 10 perguntas, 3 vidas e visual inspirado na energia
            neon, perigosa e cinematografica da nova era Grand Theft Auto.
          </p>
          <div class="hero__actions">
            <button class="rockstar-button" id="startButton">
              <span>QUERO PARTICIPAR</span>
              <i aria-hidden="true"></i>
            </button>
            <span class="hero__micro">Sem coleta de dados nesta primeira etapa.</span>
          </div>
        </div>

        <footer class="legal-note">
          Protótipo visual não oficial. GTA, Rockstar Games e marcas relacionadas pertencem aos respectivos titulares.
        </footer>
      </section>

      <section class="quiz-screen screen" id="quiz" aria-label="Quiz GTA VI">
        <div class="quiz-ambient" aria-hidden="true">
          <span></span><span></span><span></span>
        </div>
        <header class="quiz-header">
          ${brand('light')}
          <div class="quiz-header__status">
            <div class="lives" id="lives" aria-label="Vidas restantes"></div>
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
      <div class="brand-mark">R<span>*</span></div>
      <div class="brand-copy">
        <strong>ROCKSTAR</strong>
        <small>GTA VI QUIZ</small>
      </div>
    </div>
  `;
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
  const livesNode = document.querySelector('#lives');

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
  if (livesNode) {
    livesNode.innerHTML = Array.from({ length: 3 }, (_, index) => {
      const active = index < lives ? 'is-active' : '';
      return `<span class="${active}" aria-hidden="true"></span>`;
    }).join('');
  }
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
  } else {
    lives = Math.max(0, lives - 1);
  }

  window.setTimeout(() => {
    if (lives === 0) {
      showResult(false);
      return;
    }

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

  const approved = completed && score >= 7 && lives > 0;
  const resultCard = document.querySelector('#resultCard');
  const title = approved ? 'Perfil qualificado' : completed ? 'Quase na rota' : 'Vidas esgotadas';
  const copy = approved
    ? 'Voce passou pela triagem inicial. A proxima etapa pode receber cadastro, plataforma e preferencias quando ligarmos Supabase.'
    : completed
      ? 'Voce concluiu o quiz, mas ficou abaixo do corte inicial. Vale tentar de novo com mais atencao.'
      : 'A triagem encerrou antes da pergunta final. Recomece para tentar manter pelo menos uma vida ate o fim.';

  resultCard.innerHTML = `
    ${brand('light')}
    <p class="kicker">${score}/${quiz.length} acertos · ${lives} vida${lives === 1 ? '' : 's'}</p>
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
  lives = 3;
  score = 0;
  isLocked = false;
  switchScreen('home');
  renderQuestion(true);
}

render();
