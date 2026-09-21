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

const PLAYFUL_VOICE_KEYWORDS = [
  'samantha', 'ava', 'allison', 'aria', 'jenny', 'serena', 'susan', 'zira',
  'hazel', 'siri', 'female', 'woman', 'english', 'natural', 'neural'
];
let preferredVoice = null;
let speechTimer = null;

function choosePlayfulVoice() {
  if (!('speechSynthesis' in window)) return null;
  const englishVoices = speechSynthesis.getVoices().filter(voice => /^en([_-]|$)/i.test(voice.lang));
  const voices = englishVoices.length ? englishVoices : speechSynthesis.getVoices();
  preferredVoice = voices.sort((a, b) => {
    const score = voice => PLAYFUL_VOICE_KEYWORDS.reduce((total, word, index) =>
      total + (voice.name.toLowerCase().includes(word) ? PLAYFUL_VOICE_KEYWORDS.length - index : 0), 0);
    return score(b) - score(a) || Number(b.localService) - Number(a.localService);
  })[0] || null;
  return preferredVoice;
}

function stopSpeaking() {
  clearTimeout(speechTimer);
  if ('speechSynthesis' in window) speechSynthesis.cancel();
}

function speak(text, { interrupt = true, onend } = {}) {
  if (!state.soundOn || !('speechSynthesis' in window)) return;
  if (interrupt) stopSpeaking();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = preferredVoice || choosePlayfulVoice();
  utterance.rate = 0.82;
  utterance.pitch = 1.2;
  utterance.volume = 1;
  if (onend) utterance.onend = onend;
  speechSynthesis.speak(utterance);
}

function speakWithPauses(lines, pause = 350) {
  if (!state.soundOn || !('speechSynthesis' in window)) return;
  stopSpeaking();
  const sayNext = index => {
    if (!state.soundOn || index >= lines.length) return;
    speak(lines[index], {
      interrupt: false,
      onend: () => { speechTimer = setTimeout(() => sayNext(index + 1), pause); }
    });
  };
  sayNext(0);
}

function introduceAnimal(animal) {
  if (!state.soundOn) return;
  stopSpeaking();
  speak(`Wow! It is a ${animal.name}!`, {
    interrupt: false,
    onend: () => {
      playAnimalSound(animal);
      speechTimer = setTimeout(() => speak(animal.fact, { interrupt: false }), 950);
    }
  });
}


function playToneSequence(notes, duration = 0.11) {
  if (!state.soundOn) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return;
  const ctx = new Ctx(), now = ctx.currentTime;
  notes.forEach((frequency, i) => {
    const start = now + i * duration;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.16, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(start); osc.stop(start + duration + 0.02);
  });
  setTimeout(() => ctx.close(), Math.max(700, notes.length * duration * 1000 + 150));
}

function playGameSound(kind) {
  if (kind === 'correct') playToneSequence([523.25, 659.25, 783.99], 0.12);
  if (kind === 'wrong') playToneSequence([220, 185], 0.16);
  if (kind === 'count') playToneSequence([392, 523.25], 0.1);
}

function playAnimalSound(animal) {
  if (!state.soundOn) return;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) { speak(animal.phrase, { interrupt: false }); return; }
  const ctx = new Ctx(), now = ctx.currentTime;
  const osc=(type,start,duration,from,to,volume=.12)=>{const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(from,start);o.frequency.exponentialRampToValueAtTime(Math.max(40,to),start+duration);g.gain.setValueAtTime(volume,start);g.gain.exponentialRampToValueAtTime(.001,start+duration);o.connect(g);g.connect(ctx.destination);o.start(start);o.stop(start+duration+.03)};
  const noise=(start,duration,volume=.06)=>{const b=ctx.createBuffer(1,ctx.sampleRate*duration,ctx.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=(Math.random()*2-1)*(1-i/d.length);const s=ctx.createBufferSource(),g=ctx.createGain();s.buffer=b;g.gain.value=volume;s.connect(g);g.connect(ctx.destination);s.start(start);s.stop(start+duration)};
  const p={woof:()=>{osc('sawtooth',now,.16,180,80,.18);osc('sawtooth',now+.2,.16,150,70,.18)},meow:()=>osc('sine',now,.5,420,900,.15),moo:()=>osc('sawtooth',now,.75,110,70,.2),oink:()=>{osc('square',now,.18,260,180);osc('square',now+.22,.18,300,190)},baa:()=>osc('sawtooth',now,.55,260,170),neigh:()=>osc('sawtooth',now,.65,380,900),cluck:()=>{osc('square',now,.12,500,280);osc('square',now+.15,.12,620,300)},quack:()=>{osc('square',now,.18,320,170,.15);osc('square',now+.22,.18,320,160,.15)},roar:()=>{noise(now,.5,.08);osc('sawtooth',now,.7,90,45,.2)},trumpet:()=>osc('sawtooth',now,.65,220,650),ooh:()=>osc('sine',now,.7,300,500),ribbit:()=>{osc('square',now,.16,170,80);osc('square',now+.22,.16,150,70)},grr:()=>{noise(now,.45,.09);osc('sawtooth',now,.5,100,55,.16)},yip:()=>osc('square',now,.2,520,780),squeak:()=>osc('sine',now,.22,700,1100),honk:()=>osc('sawtooth',now,.3,240,120),hum:()=>osc('sine',now,.7,180,210),huff:()=>noise(now,.25,.07),grunt:()=>osc('sawtooth',now,.35,130,80),hoot:()=>{osc('sine',now,.35,280,190);osc('sine',now+.4,.35,260,180)},click:()=>{osc('square',now,.05,1200,1200,.08);osc('square',now+.1,.05,1500,1500,.08)},hello:()=>osc('sine',now,.4,300,450),buzz:()=>osc('sawtooth',now,.7,120,135,.06)};
  (p[animal.sound]||p.hello)(); setTimeout(()=>ctx.close(),1000);
}
const alphabet=[['A','Alligator','🐊'],['B','Bear','🐻'],['C','Cat','🐱'],['D','Dog','🐶'],['E','Elephant','🐘'],['F','Frog','🐸'],['G','Giraffe','🦒'],['H','Horse','🐴'],['I','Iguana','🦎'],['J','Jaguar','🐆'],['K','Koala','🐨'],['L','Lion','🦁'],['M','Monkey','🐵'],['N','Narwhal','🦄'],['O','Owl','🦉'],['P','Panda','🐼'],['Q','Quail','🐦'],['R','Rabbit','🐰'],['S','Sheep','🐑'],['T','Tiger','🐯'],['U','Unicorn','🦄'],['V','Vulture','🦅'],['W','Whale','🐋'],['X','X-ray fish','🐟'],['Y','Yak','🐂'],['Z','Zebra','🦓']];
const songs=[{title:'Hello, Animal Friends!',emoji:'🌈',lines:['Hello, hello, animal friends!','Clap your hands and stomp your feet!','Dog says woof and cow says moo!','We love learning, me and you!']},{title:'The Farmyard Song',emoji:'🚜',lines:['Down on the farm we sing today!','Pig says oink and sheep says baa!','Chicken clucks and horses neigh!','Happy animal friends shout hooray!']},{title:'ABC Animal Parade',emoji:'🔤',lines:['A is for alligator, B is for bear!','C is for cat with whiskers to share!','D is for dog and E elephant too!','Learning our letters is fun to do!']}];
function alphabetView(){const cards=alphabet.map(([l,n,e],i)=>`<button class="letter-card" data-letter="${i}"><b>${l}</b><span>${e}</span><strong>${n}</strong><small>Tap to hear</small></button>`).join('');return `${nav()}<section class="games-page"><div class="page-heading"><span>🔤</span><div><p class="eyebrow">Early letters</p><h1>ABC Animal Friends</h1><p>Learn each letter with a friendly animal.</p></div></div><div class="alphabet-grid">${cards}</div></section>`}
function countingView(){const target=state.countingTarget,animal=animals[(target+3)%animals.length];return `${nav()}<section class="mini-game"><button class="back" data-view="games">← Games</button><div class="game-box"><p class="eyebrow">Numbers 1–10</p><h1>Count & Tap!</h1><p class="count-sub">How many ${animal.name}s can you count?</p><div class="count-row big-count">${Array.from({length:target},(_,i)=>`<button class="count-object" data-count-object="${i}">${animal.emoji}</button>`).join('')}</div><div class="number-choices">${[1,2,3,4,5,6,7,8,9,10].map(n=>`<button data-count="${n}">${n}</button>`).join('')}</div><div id="count-feedback" class="feedback">${state.countAnswer||''}</div><button class="primary small" data-new-count>New number →</button></div></section>`}
function songsView(){return `${nav()}<section class="games-page"><div class="page-heading"><span>🎵</span><div><p class="eyebrow">Sing & learn</p><h1>Animal Songs</h1><p>Original little songs made for our animal friends.</p></div></div><div class="song-grid">${songs.map((s,i)=>`<article class="song-card"><span class="song-emoji">${s.emoji}</span><h2>${s.title}</h2><p>${s.lines.join(' ')}</p><button class="primary" data-song="${i}">▶ Sing with me</button></article>`).join('')}</div><div class="game-tip">🎤 <b>Tip:</b> Sing the last word of each line together with your grown-up.</div></section>`}

function nav() {
  return `<header class="topbar">
    <button class="brand" data-view="home" aria-label="Go home"><span>🌈</span> Happy Animal Friends</button>
    <nav aria-label="Main navigation">
      <button data-view="learn">🐾 Learn</button>
      <button data-view="songs">🎵 Songs</button>
      <button data-view="abc">🔤 ABC</button>
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
        <button class="activity game-card" data-view="games"><span class="activity-emoji">🎮</span><strong>Play & Count</strong><small>Try fun learning games!</small><b>Let's play →</b></button><button class="activity song-card-home" data-view="songs"><span class="activity-emoji">🎵</span><strong>Sing Animal Songs</strong><small>Clap, sing, and learn!</small><b>Sing now →</b></button><button class="activity abc-card-home" data-view="abc"><span class="activity-emoji">🔤</span><strong>ABC Animal Friends</strong><small>Learn A to Z with animals!</small><b>Learn letters →</b></button>
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
      <button class="game-tile" data-game="count"><span>🔢</span><strong>Count the Animals</strong><small>Practice counting from 1 to 10</small></button><button class="game-tile" data-view="counting"><span>🔢</span><strong>Count & Tap</strong><small>Choose the number you see</small></button><button class="game-tile" data-view="abc"><span>🔤</span><strong>ABC Animal Friends</strong><small>Learn A to Z</small></button><button class="game-tile" data-view="songs"><span>🎵</span><strong>Animal Songs</strong><small>Sing along and learn</small></button>
      <button class="game-tile" data-game="memory"><span>🧠</span><strong>Animal Memory</strong><small>Match the animal friends</small></button>
      <button class="game-tile" data-view="quiz"><span>⭐</span><strong>Guess the Animal</strong><small>Test what you know</small></button>
    </div>
    <div class="game-tip">💡 <b>Grown-up tip:</b> Ask your child where each animal lives and what sound it makes.</div>
  </section>`;
}

function countGame() {
  const target = state.countingTarget;
  const animal = animals[target % animals.length];
  const choices = [target, ...[1,2,3,4,5,6,7,8,9,10].filter(n => n !== target).sort(() => Math.random() - .5).slice(0, 2)].sort(() => Math.random() - .5);
  return `${nav()}<section class="mini-game">
    <button class="back" data-view="games">← Games</button><div class="game-box">
      <p class="eyebrow">Counting game</p><h1>How many ${animal.name}s?</h1>
      <div class="count-row">${Array.from({length: target}, () => `<span>${animal.emoji}</span>`).join('')}</div>
      <p class="question">Count them and pick the number!</p><button class="hint-button" data-speak-count>🔊 Hear the number</button>
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
    state.view === 'count' ? countGame() :
    state.view === 'counting' ? countingView() :
    state.view === 'abc' ? alphabetView() :
    state.view === 'songs' ? songsView() : memory();
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
  if (target.dataset.toggleSound !== undefined) { state.soundOn = !state.soundOn; if (!state.soundOn) stopSpeaking(); render(); return; }

  if (target.dataset.animal !== undefined) {
    state.animalIndex = +target.dataset.animal; state.view = 'detail'; render();
    setTimeout(() => introduceAnimal(animals[state.animalIndex]), 250); return;
  }
  if (target.dataset.sound !== undefined) { introduceAnimal(animals[state.animalIndex]); return; }
  if (target.dataset.letter !== undefined) { const [letter,name]=alphabet[+target.dataset.letter]; speakWithPauses([`Ready? ${letter} is for ${name}!`, `${letter}. ${name}.`]); return; }
  if (target.dataset.song !== undefined) { const song=songs[+target.dataset.song]; speakWithPauses(['Ready? Here we go!', ...song.lines], 450); burst(); return; }
  if (target.dataset.countObject !== undefined) { const n = +target.dataset.countObject + 1; playGameSound('count'); speak(String(n)); return; }
  if (target.dataset.newCount !== undefined) { state.countingTarget=1+Math.floor(Math.random()*10); state.countAnswer=null; render(); setTimeout(() => speakWithPauses(['Ready? Here we go!', `Let’s count together. ${state.countingTarget}!`]), 150); return; }
  if (target.dataset.speakCount !== undefined) { playGameSound('count'); speak(String(state.countingTarget)); return; }
  if (target.dataset.next !== undefined) {
    state.animalIndex = (state.animalIndex + 1) % animals.length; render();
    setTimeout(() => introduceAnimal(animals[state.animalIndex]), 150); return;
  }

  if (target.dataset.hint !== undefined) { speakWithPauses([`Here is a clue! It is a ${state.question.correct.name}.`, state.question.correct.fact]); return; }

  if (target.dataset.answer) {
    const feedback = document.querySelector('#feedback');
    if (state.answered) return;
    if (target.dataset.answer === state.question.correct.name) {
      state.answered = true; state.score++;
      target.classList.add('correct');
      feedback.innerHTML = '🎉 <b>Woo-hoo! You got it!</b> That is the ' + state.question.correct.name + '! <button class="primary small" data-continue>Next one →</button>';
      burst(); playGameSound('correct'); speakWithPauses(['Woo-hoo! You got it!', `That is the ${state.question.correct.name}!`]);
    } else {
      target.classList.add('wrong'); feedback.innerHTML = '💛 <b>Oops! Almost!</b> Let’s try again! Listen to the clue and choose another friend.';
      playGameSound('wrong'); speak('Oops! Almost! Let’s try again!');
      setTimeout(() => target.classList.remove('wrong'), 500);
    }
    return;
  }

  if (target.dataset.continue !== undefined) { newQuestion(); render(); return; }

  if (target.dataset.game === 'count') { state.countingTarget = 3 + Math.floor(Math.random() * 7); state.countAnswer = null; state.view = 'count'; render(); setTimeout(() => speakWithPauses(['Let’s count together!', `Ready? Here we go! There are ${state.countingTarget}.`]), 150); return; }
  if (target.dataset.game === 'memory') { startMemory(); render(); return; }

  if (target.dataset.count) {
    const n = +target.dataset.count;
    const feedback = document.querySelector('#count-feedback');
    if (n === state.countingTarget) {
      state.score++; state.countAnswer = '🎉 Woo-hoo! Great job! You counted them all!';
      burst(); playGameSound('correct'); speak('Woo-hoo! Great job! You counted them all!');
      render();
    } else {
      state.countAnswer = '💛 Almost! Let’s count them together!';
      playGameSound('wrong'); speak('Almost! Let’s count them together!');
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
        state.score++; burst(); playGameSound('correct'); speak('Amazing! You found a matching pair!');
        setTimeout(render, 450);
      } else {
        playGameSound('wrong'); speak('Oops! Almost! Let’s try again!');
        setTimeout(() => { state.memoryFlipped = []; render(); }, 750);
      }
    }
  }
});

choosePlayfulVoice();
if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = choosePlayfulVoice;

render();
