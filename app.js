import { animals } from './animals.js';

const app = document.querySelector('#app');
const state = { view: 'home', animalIndex: 0, score: 0, question: null, answered: false };

function burst() {
  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  confetti.innerHTML = '<i>⭐</i><i>💛</i><i>✨</i><i>🌟</i><i>💚</i>';
  document.body.append(confetti);
  setTimeout(() => confetti.remove(), 1000);
}

function speakAnimal(animal) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(animal.phrase);
  voice.rate = 0.75;
  voice.pitch = 1.25;
  speechSynthesis.speak(voice);
}

function nav() {
  return `<header class="topbar"><button class="brand" data-view="home" aria-label="Go home"><span>🌈</span> Happy Animal Friends</button><nav aria-label="Main navigation"><button data-view="learn">🐾 Learn</button><button data-view="quiz">⭐ Quiz</button></nav></header>`;
}

function home() {
  return `${nav()}<section class="hero"><div class="hero-copy"><p class="eyebrow">A happy place to learn</p><h1>Happy Animal<br><em>Friends</em></h1><p class="subtitle">Let's Learn About Animals!</p><button class="primary big" data-view="learn">Start Learning <span>→</span></button><div class="tiny-note">Tap, listen, and play!</div></div><div class="hero-art" aria-label="Happy animal friends"><div class="sun">☀️</div><div class="cloud c1">☁️</div><div class="cloud c2">☁️</div><div class="grass"></div><span class="hero-animal dog">🐶</span><span class="hero-animal cat">🐱</span><span class="hero-animal duck">🦆</span><span class="flower f1">🌼</span><span class="flower f2">🌷</span></div></section><section class="choice-section"><h2>What shall we do?</h2><div class="activity-grid"><button class="activity learn-card" data-view="learn"><span class="activity-emoji">🐮</span><strong>Meet the Animals</strong><small>Tap an animal to listen!</small><b>Let's go →</b></button><button class="activity quiz-card" data-view="quiz"><span class="activity-emoji">🦁</span><strong>Guess the Animal</strong><small>Can you find the right friend?</small><b>Play now →</b></button></div></section>`;
}

function learn() {
  const cards = animals.map((a, i) => `<button class="animal-card" data-animal="${i}" style="--animal:${a.color}"><span>${a.emoji}</span><strong>${a.name}</strong></button>`).join('');
  return `${nav()}<section class="page-heading"><span>🐾</span><div><p class="eyebrow">Animal friends</p><h1>Pick an animal!</h1><p>Tap a friend to learn their sound.</p></div><button class="quiz-link" data-view="quiz">⭐ Play quiz</button></section><section class="animal-grid">${cards}</section>`;
}

function animalDetail() {
  const a = animals[state.animalIndex];
  return `${nav()}<section class="detail"><button class="back" data-view="learn">← All animals</button><div class="detail-card" style="--animal:${a.color}"><div class="detail-art"><span class="sparkle s1">✨</span><span class="sparkle s2">⭐</span><span class="detail-emoji">${a.emoji}</span></div><div class="detail-copy"><p class="eyebrow">Say hello!</p><h1>This is a <em>${a.name.toUpperCase()}</em>!</h1><p class="animal-fact">${a.fact}</p><button class="sound-button" data-sound aria-label="Hear ${a.name} sound"><span>🔊</span><b>${a.phrase}</b></button><button class="primary next" data-next>Next Animal <span>→</span></button></div></div></section>`;
}

function newQuestion() {
  const correct = animals[Math.floor(Math.random() * animals.length)];
  const other = animals.filter(a => a !== correct).sort(() => Math.random() - .5).slice(0, 2);
  state.question = { correct, options: [correct, ...other].sort(() => Math.random() - .5) };
  state.answered = false;
}

function quiz() {
  if (!state.question) newQuestion();
  const { correct, options } = state.question;
  const stars = '⭐'.repeat(Math.min(state.score, 5)) || '☆';
  return `${nav()}<section class="quiz"><div class="quiz-top"><div><p class="eyebrow">Little animal game</p><h1>Guess the Animal</h1></div><div class="score" aria-label="${state.score} stars"><span>Stars</span><b>${stars}</b></div></div><div class="quiz-box"><p class="question">Which animal is this?</p><div class="quiz-animal" aria-label="animal to guess">${correct.emoji}</div><div class="answers">${options.map(a => `<button class="answer" data-answer="${a.name}"><span>${a.emoji}</span>${a.name}</button>`).join('')}</div><div id="feedback" class="feedback" role="status"></div></div><button class="back quiz-back" data-view="home">← Back home</button></section>`;
}

function render() {
  app.innerHTML = state.view === 'home' ? home() : state.view === 'learn' ? learn() : state.view === 'detail' ? animalDetail() : quiz();
}

app.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.dataset.view) { state.view = target.dataset.view; if (state.view === 'quiz') newQuestion(); render(); return; }
  if (target.dataset.animal !== undefined) { state.animalIndex = +target.dataset.animal; state.view = 'detail'; render(); setTimeout(() => speakAnimal(animals[state.animalIndex]), 250); return; }
  if (target.dataset.sound !== undefined) { speakAnimal(animals[state.animalIndex]); return; }
  if (target.dataset.next !== undefined) { state.animalIndex = (state.animalIndex + 1) % animals.length; render(); setTimeout(() => speakAnimal(animals[state.animalIndex]), 150); return; }
  if (target.dataset.answer) {
    const feedback = document.querySelector('#feedback');
    if (state.answered) return;
    if (target.dataset.answer === state.question.correct.name) {
      state.answered = true; state.score++; target.classList.add('correct'); feedback.innerHTML = '🎉 <b>Great job!</b> You found the ' + state.question.correct.name + '! <button class="primary small" data-continue>Next one →</button>'; burst();
    } else { target.classList.add('wrong'); feedback.innerHTML = '💛 <b>Nice try!</b> Try another friend!'; setTimeout(() => target.classList.remove('wrong'), 500); }
  }
  if (target.dataset.continue !== undefined) { newQuestion(); render(); }
});

render();
