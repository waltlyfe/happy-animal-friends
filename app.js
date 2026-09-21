import { animals } from './animals.js';

const app = document.querySelector('#app');
const state = {
  view: 'home',
  animalIndex: 0,
  score: 0,
  question: null,
  answered: false,
  game: 'quiz',
  memoryCards: [],
  memoryFlipped: [],
  memoryMatched: 0,
  countingTarget: 5,
  countAnswer: null,
  soundOn: true
};

function burst() {
  const confetti = document.createElement('div');
  confetti.className = 'confetti';
  confetti.innerHTML = '<i>⭐</i><i>💛</i><i>✨</i><i>🌟</i><i>💚</i>';
  document.body.append(confetti);
  setTimeout(() => confetti.remove(), 1000);
}

function speak(text) {
  if (!state.soundOn || !('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const voice = new SpeechSynthesisUtterance(text);
  voice.rate = 0.78;
  voice.pitch = 1.18;
  speechSynthesis.speak(voice);
}

function speakAnimal(animal) { speak(`${animal.name}. ${animal.phrase} ${animal.fact}`); }

function nav() {
  return `<header class="topbar">
    <button class="brand" data-view="home" aria-label="Go home"><span>🌈</span> Happy Animal Friends</button>
    <nav aria-label="Main navigation">
      <button data-view="learn">🐾 Learn</button>
      <button data-view="games">🎮 Games</button>
      <button data-view="quiz">⭐ Quiz</button>
      <button class="sound-toggle" data-toggle-sound aria-label="Toggle voice">${state.soundOn ? '🔊' : '🔇'}</button>
    </nav>
  </header>`;
}

function home() {
  return `${nav()}
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">A happy place to learn</p>
        <h1>Happy Animal<br><em>Friends</em></h1>
        <p class="subtitle">Let's Learn About Animals!</p>
        <button class="primary big" data-view="learn">Start Learning <span>→</span></button>
        <div class="tiny-note">Tap, listen, play, and earn stars! ⭐</div>
      </div>
      <div class="hero-art" aria-label="Happy animal friends">
        <div class="sun">☀️</div><div class="cloud c1">☁️</div><div class="cloud c2">☁️</div><div class="grass"></div>
        <span class="hero-animal dog">🐶</span><span class="hero-animal cat">🐱</span><span class="hero-animal duck">🦆</span>
        <span class="flower f1">🌼</span><span class="flower f2">🌷</span>
      </div>
    </section>
    <section class="choice-section">
      <h2>What shall we do?</h2>
      <div class="activity-grid">
        <button class="activity learn-card" data-view="learn"><span class="activity-emoji">🐮</span><strong>Meet the Animals</strong><small>Discover 24 animal friends!</small><b>Let's go →</b></button>
        <button class="activity quiz-card" data-view="quiz"><span class="activity-emoji">🦁</span><strong>Guess the Animal</strong><small>Can you find the right friend?</small><b>Play now →</b></button>
        <button class="activity game-card" data-view="games"><span class="activity-emoji">🎮</span><strong>Play & Count</strong><small>Try fun learning games!</small><b>Let's play →</b></button>
      </div>
    </section>`;
}

function learn() {
  const cards = animals.map((a, i) => `<button class="animal-card" data-animal="${i}" style="--animal:${a.color}"><span>${a.emoji}</span><strong>${a.name}</strong><small>${a.habitat}</small></button>`).join('');
  return `${nav()}<section class="page-heading"><span>🐾</span><div><p class="eyebrow">Animal friends</p><h1>Pick an animal!</h1><p>Tap a friend to learn, listen, and discover.</p></div><button class="quiz-link" data-view="quiz">⭐ Play quiz</button></section><section class="animal-grid">${cards}</section>`;
}

function animalDetail() {
  const a = animals[state.animalIndex];
  return `${nav()}<section class="detail">
    <button class="back" data-view="learn">← All animals</button>
    <div class="detail-card" style="--animal:${a.color}">
      <div class="detail-art"><span class="sparkle s1">✨</span><span class="sparkle s2">⭐</span><span class="detail-emoji">${a.emoji}</span></div>
      <div class="detail-copy">
        <p class="eyebrow">Say hello!</p><h1>This is a <em>${a.name.toUpperCase()}</em>!</h1>
        <p class="animal-fact">${a.fact}</p>
        <div class="fact-pill">🏡 Lives in: <b>${a.habitat}</b></div>
        <button class="sound-button" data-sound><span>🔊</span><b>${a.phrase}</b></button>
        <div class="detail-actions"><button class="primary next" data-next>Next Animal <span>→</span></button><button class="secondary" data-view="games">🎮 Games</button></div>
      </div>
    </div>
  </section>`;
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
  return `${nav()}<section class="quiz">
    <div class="quiz-top"><div><p class="eyebrow">Little animal game</p><h1>Guess the Animal</h1></div><div class="score"><span>Stars</span><b>${stars}</b><small>${state.score} earned</small></div></div>
    <div class="quiz-box"><p class="question">Which animal is this?</p><div class="quiz-animal">${correct.emoji}</div>
      <button class="hint-button" data-hint>🔊 Hear a clue</button>
      <div class="answers">${options.map(a => `<button class="answer" data-answer="${a.name}"><span>${a.emoji}</span>${a.name}</button>`).join('')}</div>
      <div id="feedback" class="feedback" role="status"></div>
    </div>
    <button class="back quiz-back" data-view="home">← Back home</button>
  </section>`;
}

function games() {
  return `${nav()}<section class="games-page">
    <div class="page-heading"><span>🎮</span><div><p class="eyebrow">Learning games</p><h1>Play & Learn</h1><p>Have fun while you practice animal skills.</p></div></div>
    <div class="game-menu">
      <button class="game-tile" data-game="count"><span>🔢</span><strong>Count the Animals</strong><small>Practice counting from 1 to 10</small></button>
      <button class="game-tile" data-game="memory"><span>🧠</span><strong>Animal Memory</strong><small>Match the animal friends</small></button>
      <button class="game-tile" data-view="quiz"><span>⭐</span><strong>Guess the Animal</strong><small>Test what you know</small></button>
    </div>
    <div class="game-tip">💡 <b>Grown-up tip:</b> Ask your child where each animal lives and what sound it makes.</div>
  </section>`;
}

function countGame() {
  const target = state.countingTarget;
  const animal = animals[target % animals.length];
  const choices = [target, target === 3 ? 5 : 3, target === 6 ? 8 : 7].sort(() => Math.random() - .5);
  return `${nav()}<section class="mini-game">
    <button class="back" data-view="games">← Games</button><div class="game-box">
      <p class="eyebrow">Counting game</p><h1>How many ${animal.name}s?</h1>
      <div class="count-row">${Array.from({length: target}, () => `<span>${animal.emoji}</span>`).join('')}</div>
      <p class="question">Count them and pick the number!</p>
      <div class="number-choices">${choices.map(n => `<button data-count="${n}">${n}</button>`).join('')}</div>
      <div id="count-feedback" class="feedback">${state.countAnswer || ''}</div>
    </div>
  </section>`;
}

function startMemory() {
  const picks = [...animals].sort(() => Math.random() - .5).slice(0, 6);
  state.memoryCards = [...picks, ...picks].sort(() => Math.random() - .5).map((a, i) => ({...a, id:i}));
  state.memoryFlipped = []; state.memoryMatched = 0; state.view = 'memory';
}

function memory() {
  const cards = state.memoryCards.map((a) => {
    const flipped = state.memoryFlipped.includes(a.id) || a.matched;
    return `<button class="memory-card ${flipped ? 'flipped' : ''} ${a.matched ? 'matched' : ''}" data-memory="${a.id}"><span>${flipped ? a.emoji : '❓'}</span><small>${flipped ? a.name : 'Animal'}</small></button>`;
  }).join('');
  return `${nav()}<section class="mini-game"><button class="back" data-view="games">← Games</button><div class="game-box"><p class="eyebrow">Memory game</p><h1>Match the Animals!</h1><p>Find two of the same animal. Matches: ${state.memoryMatched}/6</p><div class="memory-grid">${cards}</div>${state.memoryMatched === 6 ? '<div class="win-banner">🎉 You matched them all! <button class="primary small" data-memory-restart>Play again</button></div>' : ''}</div></section>`;
}

function render() {
  app.innerHTML =
    state.view === 'home' ? home() :
    state.view === 'learn' ? learn() :
    state.view === 'detail' ? animalDetail() :
    state.view === 'quiz' ? quiz() :
    state.view === 'games' ? games() :
    state.view === 'count' ? countGame() : memory();
}

function go(view) {
  state.view = view;
  if (view === 'quiz') newQuestion();
  render();
}

app.addEventListener('click', event => {
  const target = event.target.closest('button');
  if (!target) return;

  if (target.dataset.view) { go(target.dataset.view); return; }
  if (target.dataset.toggleSound !== undefined) { state.soundOn = !state.soundOn; render(); return; }

  if (target.dataset.animal !== undefined) {
    state.animalIndex = +target.dataset.animal; state.view = 'detail'; render();
    setTimeout(() => speakAnimal(animals[state.animalIndex]), 250); return;
  }
  if (target.dataset.sound !== undefined) { speakAnimal(animals[state.animalIndex]); return; }
  if (target.dataset.next !== undefined) {
    state.animalIndex = (state.animalIndex + 1) % animals.length; render();
    setTimeout(() => speakAnimal(animals[state.animalIndex]), 150); return;
  }

  if (target.dataset.hint !== undefined) { speakAnimal(state.question.correct); return; }

  if (target.dataset.answer) {
    const feedback = document.querySelector('#feedback');
    if (state.answered) return;
    if (target.dataset.answer === state.question.correct.name) {
      state.answered = true; state.score++;
      target.classList.add('correct');
      feedback.innerHTML = '🎉 <b>Great job!</b> You found the ' + state.question.correct.name + '! <button class="primary small" data-continue>Next one →</button>';
      burst(); speak('Great job! You found the ' + state.question.correct.name);
    } else {
      target.classList.add('wrong'); feedback.innerHTML = '💛 <b>Nice try!</b> Listen to the clue and try another friend!';
      setTimeout(() => target.classList.remove('wrong'), 500);
    }
    return;
  }

  if (target.dataset.continue !== undefined) { newQuestion(); render(); return; }

  if (target.dataset.game === 'count') { state.countingTarget = 3 + Math.floor(Math.random() * 7); state.countAnswer = null; state.view = 'count'; render(); return; }
  if (target.dataset.game === 'memory') { startMemory(); render(); return; }

  if (target.dataset.count) {
    const n = +target.dataset.count;
    const feedback = document.querySelector('#count-feedback');
    if (n === state.countingTarget) {
      state.score++; state.countAnswer = '🎉 Great counting! You got it!';
      burst(); speak('Great counting!');
      render();
    } else {
      state.countAnswer = '💛 Almost! Count each animal one more time.';
      feedback.textContent = state.countAnswer;
    }
    return;
  }

  if (target.dataset.memoryRestart !== undefined) { startMemory(); render(); return; }

  if (target.dataset.memory !== undefined) {
    const id = +target.dataset.memory;
    if (state.memoryFlipped.includes(id)) return;
    const card = state.memoryCards.find(c => c.id === id);
    if (card.matched || state.memoryFlipped.length >= 2) return;
    state.memoryFlipped.push(id); render();
    if (state.memoryFlipped.length === 2) {
      const [a,b] = state.memoryFlipped.map(x => state.memoryCards.find(c => c.id === x));
      if (a.name === b.name) {
        a.matched = b.matched = true; state.memoryMatched++; state.memoryFlipped = [];
        state.score++; burst(); speak('Match!');
        setTimeout(render, 450);
      } else {
        setTimeout(() => { state.memoryFlipped = []; render(); }, 750);
      }
    }
  }
});

render();
