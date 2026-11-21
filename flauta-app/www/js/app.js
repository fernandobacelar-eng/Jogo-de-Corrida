import { noteInfo, fullName, midiToFreq, freqToMidiFloat, describeFingering, MIN_MIDI, MAX_MIDI } from './notes.js';
import { PitchListener, playTone, audioContext } from './audio.js';
import { createFlute, renderStaff } from './flute.js';
import { LESSONS } from './lessons.js';

// ---------- Armazenamento ----------
const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('flauta.' + key);
      return v === null ? fallback : JSON.parse(v);
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('flauta.' + key, JSON.stringify(value)); } catch { /* sem armazenamento */ }
  },
};

const state = {
  a4: store.get('a4', 440),
  tolerance: store.get('tolerance', 40),
  completed: new Set(store.get('completed', [])),
  unlockAll: store.get('unlockAll', false),
  screen: 'afinar',
};

const $ = (id) => document.getElementById(id);
const listener = new PitchListener();
let wakeLock = null;

function toast(msg, ms = 3500) {
  const t = $('toast');
  t.textContent = msg;
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, ms);
}

async function keepAwake(on) {
  try {
    if (on && !wakeLock && navigator.wakeLock) wakeLock = await navigator.wakeLock.request('screen');
    if (!on && wakeLock) { await wakeLock.release(); wakeLock = null; }
  } catch { /* não suportado */ }
}

async function startMic(handler) {
  listener.onPitch = handler;
  try {
    await listener.start();
    keepAwake(true);
    return true;
  } catch (e) {
    const denied = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError');
    toast(denied
      ? 'Permita o acesso ao microfone para o app ouvir a flauta.'
      : 'Não foi possível usar o microfone: ' + (e.message || e));
    return false;
  }
}

function stopMic() {
  listener.stop();
  listener.onPitch = null;
  keepAwake(false);
}

function centsBetween(freq, midi) {
  return 1200 * Math.log2(freq / midiToFreq(midi, state.a4));
}

function setNeedle(el, cents, ok) {
  const c = Math.max(-50, Math.min(50, cents));
  el.style.left = (50 + c) + '%';
  el.classList.toggle('ok', !!ok);
  el.classList.toggle('off', Math.abs(cents) > 50);
  el.classList.remove('idle');
}

function idleNeedle(el) {
  el.style.left = '50%';
  el.classList.add('idle');
  el.classList.remove('ok', 'off');
}

// Desenha a notação numérica com pontos de oitava acima do número.
function jianpuHTML(n) {
  const dots = n.jianpuDots > 0 ? '•'.repeat(n.jianpuDots) : '';
  return `<span class="jianpu"><span class="jp-dots">${dots}</span>${n.jianpu}</span>`;
}

function metaHTML(n) {
  const alt = n.altName ? ` / ${n.altName}` : '';
  return `${n.letter}${alt} · oitava ${n.register.name} · ${jianpuHTML(n)}`;
}

function fingersHTML(keys) {
  const { left, right } = describeFingering(keys);
  const list = (arr) => arr.length ? arr.join(' · ') : '<em>nenhum dedo</em>';
  return `<div><span class="hand hand-left">Mão esquerda</span> ${list(left)}</div>
          <div><span class="hand hand-right">Mão direita</span> ${list(right)}</div>`;
}

// ---------- Navegação ----------
const SCREEN_TITLES = { afinar: 'Afinação', notas: 'Digitações', licoes: 'Lições', guia: 'Guia' };

function showScreen(name) {
  if (state.screen === name) return;
  leaveScreen(state.screen);
  state.screen = name;
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.screen === name));
  $('topbar-sub').textContent = SCREEN_TITLES[name];
  window.scrollTo(0, 0);
  if (name === 'licoes') renderLessonList();
}

function leaveScreen(name) {
  stopMic();
  stopReference();
  setMicButton($('btn-tuner'), false);
  setMicButton($('notas-listen'), false);
  $('notas-live').hidden = true;
  if (name === 'licoes') closeLesson();
}

function setMicButton(btn, on, onText = '⏹ Parar de ouvir', offText) {
  if (!btn.dataset.offText) btn.dataset.offText = offText || btn.textContent;
  btn.textContent = on ? onText : btn.dataset.offText;
  btn.classList.toggle('on', on);
}

document.querySelectorAll('.nav-btn').forEach((b) => b.addEventListener('click', () => showScreen(b.dataset.screen)));

// ---------- Afinar ----------
let refStop = null;

function stopReference() {
  if (refStop) { refStop(); refStop = null; }
  const b = $('btn-ref');
  b.textContent = '▶ Tocar Lá de referência';
  b.classList.remove('on');
}

$('btn-ref').addEventListener('click', () => {
  if (refStop) { stopReference(); return; }
  audioContext();
  refStop = playTone(state.a4, { duration: 0, volume: 0.3 });
  $('btn-ref').textContent = '⏹ Parar referência';
  $('btn-ref').classList.add('on');
});

function updateCalib() {
  $('calib-hz').textContent = state.a4;
  store.set('a4', state.a4);
  if (refStop) { refStop(); refStop = playTone(state.a4, { duration: 0, volume: 0.3 }); }
}
$('calib-minus').addEventListener('click', () => { if (state.a4 > 430) { state.a4--; updateCalib(); } });
$('calib-plus').addEventListener('click', () => { if (state.a4 < 450) { state.a4++; updateCalib(); } });

function onTunerPitch(r) {
  const needle = $('tuner-needle');
  if (refStop) {
    idleNeedle(needle);
    $('tuner-msg').textContent = 'Pare o som de referência para o app ouvir só a flauta.';
    $('tuner-msg').className = 'tuner-msg';
    return;
  }
  if (!r || !r.stable) {
    if (!r) {
      idleNeedle(needle);
      $('tuner-note').textContent = '–';
      $('tuner-hz').textContent = '';
      $('tuner-msg').textContent = 'Toque uma nota longa e estável.';
      $('tuner-msg').className = 'tuner-msg';
    }
    return;
  }
  const midi = Math.round(freqToMidiFloat(r.freq, state.a4));
  const cents = centsBetween(r.freq, midi);
  const n = noteInfo(midi);
  $('tuner-note').textContent = `${n.name}${n.octave}`;
  $('tuner-hz').textContent = `${r.freq.toFixed(1)} Hz · ${cents >= 0 ? '+' : ''}${Math.round(cents)} cents`;
  const ok = Math.abs(cents) <= 5;
  setNeedle(needle, cents, ok);
  const msg = $('tuner-msg');
  let text, cls;
  if (ok) { text = 'Afinado! ✓'; cls = 'good'; }
  else if (cents > 0) { text = 'Alto: puxe a cabeça da flauta um pouco para fora.'; cls = 'warn'; }
  else { text = 'Baixo: empurre a cabeça da flauta um pouco para dentro.'; cls = 'warn'; }
  if (n.pc !== 9) { text = `Você está tocando ${n.name}. Para afinar, toque o Lá. ` + (ok ? '' : `(${cents > 0 ? 'alto' : 'baixo'})`); cls = ''; }
  msg.textContent = text;
  msg.className = 'tuner-msg ' + cls;
}

$('btn-tuner').addEventListener('click', async () => {
  if (listener.running) { stopMic(); setMicButton($('btn-tuner'), false); idleNeedle($('tuner-needle')); return; }
  stopReference();
  if (await startMic(onTunerPitch)) setMicButton($('btn-tuner'), true);
});

// ---------- Notas ----------
const notasFlute = createFlute($('notas-flute'));
let selected = 69;
let currentOctave = 4;

function selectNote(midi) {
  selected = midi;
  const n = noteInfo(midi);
  $('notas-name').textContent = `${n.name}${n.octave}`;
  $('notas-meta').innerHTML = metaHTML(n);
  renderStaff($('notas-staff'), n);
  notasFlute.show(n.fingering);
  $('notas-fingers').innerHTML = fingersHTML(n.fingering);
  $('notas-tip').textContent = [n.tip, n.register.hint].filter(Boolean).join(' ');
  const oct = midi >= 84 ? 6 : midi >= 72 ? 5 : 4;
  if (oct !== currentOctave) renderGrid(oct);
  document.querySelectorAll('#note-grid button').forEach((b) => b.classList.toggle('active', +b.dataset.midi === midi));
}

function renderGrid(oct) {
  currentOctave = oct;
  document.querySelectorAll('#octave-tabs .tab').forEach((t) => t.classList.toggle('active', +t.dataset.oct === oct));
  const grid = $('note-grid');
  grid.innerHTML = '';
  const start = (oct + 1) * 12;
  const end = oct === 6 ? MAX_MIDI : start + 11;
  for (let m = Math.max(start, MIN_MIDI); m <= end; m++) {
    const n = noteInfo(m);
    const b = document.createElement('button');
    b.className = 'note-btn' + (n.sharp ? ' sharp' : '') + (m === selected ? ' active' : '');
    b.dataset.midi = m;
    b.innerHTML = `<b>${n.name}</b><small>${n.letter}</small>`;
    b.addEventListener('click', () => {
      selectNote(m);
      document.querySelector('#screen-notas .note-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    grid.appendChild(b);
  }
}

document.querySelectorAll('#octave-tabs .tab').forEach((t) => t.addEventListener('click', () => renderGrid(+t.dataset.oct)));

$('notas-play').addEventListener('click', () => {
  listener.mute(1800);
  playTone(midiToFreq(selected, state.a4), { duration: 1.5 });
});

function onNotasPitch(r) {
  const needle = $('notas-needle');
  if (!r) { $('notas-live-text').textContent = 'Toque uma nota…'; idleNeedle(needle); return; }
  if (!r.stable) return;
  const mf = freqToMidiFloat(r.freq, state.a4);
  const midi = Math.round(mf);
  const cents = (mf - midi) * 100;
  if (midi < MIN_MIDI || midi > MAX_MIDI) {
    $('notas-live-text').textContent = 'Som fora da extensão da flauta.';
    idleNeedle(needle);
    return;
  }
  const n = noteInfo(midi);
  $('notas-live-text').innerHTML = `Ouvindo: <b>${n.name}${n.octave}</b> · ${cents >= 0 ? '+' : ''}${Math.round(cents)} cents`;
  setNeedle(needle, cents, Math.abs(cents) <= 10);
  if (midi !== selected) selectNote(midi);
}

$('notas-listen').addEventListener('click', async () => {
  if (listener.running) {
    stopMic();
    setMicButton($('notas-listen'), false);
    $('notas-live').hidden = true;
    return;
  }
  if (await startMic(onNotasPitch)) {
    setMicButton($('notas-listen'), true);
    $('notas-live').hidden = false;
  }
});

// ---------- Lições ----------
const lessonFlute = createFlute($('lesson-flute'));
const HOLD_MS = 600;
const lesson = { index: -1, pos: 0, results: [], hold: 0, lastT: 0, needRelease: false, advancing: false };

$('tolerance').value = String(state.tolerance);
$('tolerance').addEventListener('change', (e) => { state.tolerance = +e.target.value; store.set('tolerance', state.tolerance); });

function isUnlocked(i) {
  return state.unlockAll || i === 0 || state.completed.has(LESSONS[i - 1].id) || state.completed.has(LESSONS[i].id);
}

function renderLessonList() {
  const ol = $('lesson-list');
  ol.innerHTML = '';
  LESSONS.forEach((l, i) => {
    const li = document.createElement('li');
    const done = state.completed.has(l.id);
    const open = isUnlocked(i);
    li.className = 'lesson-item' + (done ? ' done' : '') + (open ? '' : ' locked');
    li.innerHTML = `
      <span class="lesson-num">${done ? '✓' : open ? i + 1 : '🔒'}</span>
      <span class="lesson-body"><b>${l.title}</b><small>${l.level} · ${l.notes.length} notas</small></span>
      <span class="lesson-go">›</span>`;
    li.addEventListener('click', () => {
      if (!open) { toast('Conclua a lição anterior para liberar esta.'); return; }
      openLesson(i);
    });
    ol.appendChild(li);
  });
  $('btn-unlock').hidden = state.unlockAll;
}

$('btn-unlock').addEventListener('click', () => {
  state.unlockAll = true;
  store.set('unlockAll', true);
  renderLessonList();
});

async function openLesson(i) {
  const l = LESSONS[i];
  Object.assign(lesson, { index: i, pos: 0, results: [], hold: 0, needRelease: false, advancing: false });
  $('lesson-list-view').hidden = true;
  $('lesson-view').hidden = false;
  $('lesson-stage').hidden = false;
  $('lesson-done').hidden = true;
  $('lesson-title').textContent = `${i + 1}. ${l.title}`;
  $('lesson-intro').textContent = l.intro;
  const tol = state.tolerance;
  const zone = $('lesson-ok-zone');
  zone.style.left = (50 - tol) + '%';
  zone.style.width = (tol * 2) + '%';
  renderChips();
  showTarget();
  window.scrollTo(0, 0);
  await startMic(onLessonPitch);
}

function closeLesson() {
  stopMic();
  lesson.index = -1;
  $('lesson-view').hidden = true;
  $('lesson-list-view').hidden = false;
}

function renderChips() {
  const l = LESSONS[lesson.index];
  $('lesson-chips').innerHTML = l.notes.map((m, k) => {
    const r = lesson.results[k];
    const cls = r === true ? 'ok' : r === false ? 'skip' : k === lesson.pos ? 'current' : '';
    return `<span class="chip ${cls}">${fullName(m)}</span>`;
  }).join('');
  const cur = $('lesson-chips').querySelector('.current');
  if (cur) cur.scrollIntoView({ block: 'nearest', inline: 'center' });
}

function showTarget() {
  const m = LESSONS[lesson.index].notes[lesson.pos];
  const n = noteInfo(m);
  $('lesson-name').textContent = `${n.name}${n.octave}`;
  $('lesson-meta').innerHTML = metaHTML(n);
  renderStaff($('lesson-staff'), n);
  lessonFlute.show(n.fingering);
  $('lesson-fingers').innerHTML = fingersHTML(n.fingering);
  lesson.hold = 0;
  $('lesson-hold').style.width = '0%';
  $('lesson-stage').classList.remove('success');
  idleNeedle($('lesson-needle'));
  setFeedback(lesson.needRelease ? 'Mesma nota de novo: pare o som e toque outra vez.' : 'Toque a nota indicada.', '');
}

function setFeedback(text, cls) {
  const el = $('lesson-fb-text');
  el.textContent = text;
  el.className = 'feedback-text ' + cls;
}

function onLessonPitch(r) {
  if (lesson.index < 0 || lesson.advancing) return;
  const now = performance.now();
  const dt = lesson.lastT ? Math.min(100, now - lesson.lastT) : 16;
  lesson.lastT = now;
  const target = LESSONS[lesson.index].notes[lesson.pos];

  if (!r) {
    lesson.needRelease = false;
    lesson.hold = Math.max(0, lesson.hold - dt * 2);
    $('lesson-hold').style.width = (lesson.hold / HOLD_MS * 100) + '%';
    idleNeedle($('lesson-needle'));
    if (lesson.hold === 0) setFeedback('Toque a nota indicada.', '');
    return;
  }
  if (!r.stable) return;

  const mf = freqToMidiFloat(r.freq, state.a4);
  const played = Math.round(mf);
  const cents = (mf - target) * 100;
  const tol = state.tolerance;

  if (lesson.needRelease) {
    if (played !== target) lesson.needRelease = false;
    else { setFeedback('Mesma nota de novo: pare o som e toque outra vez.', ''); return; }
  }

  setNeedle($('lesson-needle'), cents, Math.abs(cents) <= tol);

  if (Math.abs(cents) <= tol) {
    lesson.hold += dt;
    setFeedback('Isso! Segure a nota…', 'good');
    if (lesson.hold >= HOLD_MS) return succeed();
  } else {
    lesson.hold = Math.max(0, lesson.hold - dt * 2);
    const pn = noteInfo(played);
    const tn = noteInfo(target);
    if (pn.pc === tn.pc && played !== target) {
      setFeedback(played > target
        ? 'Nota certa, mas uma oitava acima. Sopre mais devagar, com os lábios mais relaxados.'
        : 'Nota certa, mas uma oitava abaixo. Sopre mais rápido, com abertura menor.', 'warn');
    } else if (Math.abs(cents) <= 100) {
      setFeedback(cents > 0 ? 'Quase! Está um pouco alto: relaxe o sopro ou incline o ar para baixo.' : 'Quase! Está um pouco baixo: sopre um pouco mais rápido ou direcione o ar para cima.', 'warn');
    } else {
      setFeedback(`Você tocou ${pn.name}${pn.octave}. Confira a digitação no desenho.`, 'bad');
    }
  }
  $('lesson-hold').style.width = Math.min(100, lesson.hold / HOLD_MS * 100) + '%';
}

function succeed() {
  lesson.advancing = true;
  lesson.results[lesson.pos] = true;
  $('lesson-stage').classList.add('success');
  setFeedback('Correto! ✓', 'good');
  $('lesson-hold').style.width = '100%';
  try { navigator.vibrate && navigator.vibrate(60); } catch { /* sem vibração */ }
  setTimeout(nextNote, 550);
}

function nextNote() {
  const l = LESSONS[lesson.index];
  const prev = l.notes[lesson.pos];
  lesson.pos++;
  lesson.advancing = false;
  if (lesson.pos >= l.notes.length) return finishLesson();
  lesson.needRelease = l.notes[lesson.pos] === prev && lesson.results[lesson.pos - 1] === true;
  renderChips();
  showTarget();
}

function finishLesson() {
  stopMic();
  const l = LESSONS[lesson.index];
  const ok = lesson.results.filter((x) => x === true).length;
  const total = l.notes.length;
  const passed = ok / total >= 0.7;
  if (passed) {
    state.completed.add(l.id);
    store.set('completed', [...state.completed]);
  }
  renderChips();
  $('lesson-stage').hidden = true;
  $('lesson-done').hidden = false;
  $('lesson-done').classList.toggle('fail', !passed);
  $('lesson-done').querySelector('h2').textContent = passed ? 'Lição concluída!' : 'Quase lá!';
  $('lesson-done').querySelector('.done-icon').textContent = passed ? '✓' : '↻';
  $('lesson-done-text').textContent = passed
    ? `Você acertou ${ok} de ${total} notas.`
    : `Você acertou ${ok} de ${total} notas. Acerte pelo menos 70% (sem pular) para liberar a próxima lição.`;
  const hasNext = lesson.index + 1 < LESSONS.length;
  $('lesson-next').hidden = !hasNext || !(passed || state.unlockAll);
}

$('lesson-back').addEventListener('click', () => { closeLesson(); renderLessonList(); });
$('lesson-skip').addEventListener('click', () => {
  if (lesson.advancing) return;
  lesson.results[lesson.pos] = false;
  nextNote();
});
$('lesson-play').addEventListener('click', () => {
  const m = LESSONS[lesson.index].notes[lesson.pos];
  listener.mute(1800);
  playTone(midiToFreq(m, state.a4), { duration: 1.5 });
});
$('lesson-again').addEventListener('click', () => openLesson(lesson.index));
$('lesson-next').addEventListener('click', () => openLesson(lesson.index + 1));

// ---------- Guia ----------
const guiaFlute = createFlute($('guia-flute'));
guiaFlute.show(noteInfo(69).fingering);

// ---------- Clave de Sol: esconde se a fonte do aparelho não tiver o símbolo ----------
function clefSupported() {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 40;
    const g = c.getContext('2d');
    const draw = (ch) => {
      g.clearRect(0, 0, 40, 40);
      g.font = '30px serif';
      g.fillText(ch, 4, 32);
      return g.getImageData(0, 0, 40, 40).data.join(',');
    };
    // Compara com um caractere não atribuído (que vira "quadradinho")
    return draw('𝄞') !== draw('\u{1D127}');
  } catch { return true; }
}
if (!clefSupported()) document.body.classList.add('no-clef');

// ---------- Início ----------
$('calib-hz').textContent = state.a4;
idleNeedle($('tuner-needle'));
renderGrid(4);
selectNote(69);

// Pausa o microfone quando o app vai para segundo plano
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    stopReference();
    if (listener.running && state.screen !== 'licoes') {
      stopMic();
      setMicButton($('btn-tuner'), false);
      setMicButton($('notas-listen'), false);
      $('notas-live').hidden = true;
    } else if (listener.running) {
      stopMic();
    }
  } else if (state.screen === 'licoes' && lesson.index >= 0 && $('lesson-done').hidden) {
    startMic(onLessonPitch);
  }
});
