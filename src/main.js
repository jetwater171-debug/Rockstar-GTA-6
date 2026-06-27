import './styles.css';

const quiz = [
  {
    eyebrow: 'GTA VI',
    question: 'Qual dupla esta no centro da nova fase de GTA VI?',
    options: ['Lucia e Jason', 'Franklin e Lamar', 'Tommy e Lance'],
    answer: 0,
  },
  {
    eyebrow: 'GTA V',
    question: 'Em GTA V, qual cidade e o grande palco da historia?',
    options: ['Liberty City', 'Los Santos', 'Vice City'],
    answer: 1,
  },
  {
    eyebrow: 'GTA V',
    question: 'Quais sao os tres protagonistas jogaveis de GTA V?',
    options: ['CJ, Big Smoke e Ryder', 'Niko, Roman e Packie', 'Michael, Franklin e Trevor'],
    answer: 2,
  },
  {
    eyebrow: 'Gameplay',
    question: 'Qual atividade marcou muito a campanha de GTA V?',
    options: ['Golpes planejados em equipe', 'Corridas de dragao', 'Batalhas por turnos'],
    answer: 0,
  },
  {
    eyebrow: 'Online',
    question: 'No GTA Online, o que os jogadores mais fazem para evoluir?',
    options: ['Completar missoes, eventos e negocios', 'Ficar apenas no menu', 'Trocar senha com desconhecidos'],
    answer: 0,
  },
  {
    eyebrow: 'Mapa',
    question: 'GTA VI retorna para uma regiao inspirada em qual vibe?',
    options: ['Neve eterna e montanhas geladas', 'Praias, neon e caos tropical', 'Castelos medievais'],
    answer: 1,
  },
  {
    eyebrow: 'Perfil',
    question: 'Qual resposta mostra melhor um jogador com perfil de GTA?',
    options: ['Explorar historia, mapa, carros e detalhes', 'Ignorar qualquer missao', 'Nunca testar nada novo'],
    answer: 0,
  },
  {
    eyebrow: 'Conhecimento',
    question: 'Qual empresa publica a serie Grand Theft Auto?',
    options: ['Valve', 'Rockstar Games', 'Mojang Studios'],
    answer: 1,
  },
  {
    eyebrow: 'Seguranca',
    question: 'Em uma promocao gamer seria correto pedir qual informacao?',
    options: ['Senha da conta', 'Codigo do cartao', 'Plataforma preferida'],
    answer: 2,
  },
  {
    eyebrow: 'Final',
    question: 'O que voce faria primeiro ao entrar em um GTA novo?',
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
          <p class="kicker">Grand Theft Auto VI</p>
          <h1>GTA VI Promo Quiz</h1>
          <p class="hero__copy">
            Responda uma triagem rapida inspirada no universo Rockstar: GTA V,
            GTA Online e a nova era de Vice City. Sao 10 perguntas, 3 vidas e
            um corte final para liberar a proxima etapa.
          </p>
          <div class="hero__release" aria-label="Informacoes do quiz">
            <span>10 perguntas</span>
            <span>3 vidas</span>
            <span>GTA V + GTA VI</span>
          </div>
          <div class="hero__actions">
            <button class="rockstar-button" id="startButton">
              <span>QUERO PARTICIPAR</span>
              <i aria-hidden="true"></i>
            </button>
            <span class="hero__micro">Sem coleta de dados nesta primeira etapa.</span>
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
          <div class="quiz-header__status quiz-header__status--left">
            <div class="lives" id="lives" aria-label="Vidas restantes"></div>
          </div>
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
      <div class="brand-copy">
        <strong>ROCKSTAR</strong>
        <small>GTA VI QUIZ</small>
      </div>
    </div>
  `;
}

function brandMark(variant = 'default') {
  return `<div class="brand-mark brand-mark--${variant}">R<span>*</span></div>`;
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
      <p class="question-panel__label">Selection quiz</p>
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
    <p class="kicker">${score}/${quiz.length} acertos - ${lives} vida${lives === 1 ? '' : 's'}</p>
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
