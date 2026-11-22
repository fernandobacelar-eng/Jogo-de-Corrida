import { noteInfo, fullName, midiToFreq, freqToMidiFloat, describeFingering, findByFingering, KEY_INFO, MIN_MIDI, MAX_MIDI } from './notes.js';
import { PitchListener, playTone, audioContext } from './audio.js';
import { createFlute, renderStaff } from './flute.js';
import { LESSONS } from './lessons.js';
import { initV2 } from './v2.js';
import { createScoreStrip, renderSingleNote } from './score.js';
import { SONGS } from './songs.js';

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
  screen: 'inicio',
};

const $ = (id) => document.getElementById(id);
const listener = new PitchListener();
let v2 = null; // módulo da versão 2 (músicas, ritmo, leitura)
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
  listener.onLevel = null;
  keepAwake(false);
}

function centsBetween(freq, midi) {
  return 1200 * Math.log2(freq / midiToFreq(midi, state.a4));
}

function setNeedle(el, cents, ok) {
  const c = Math.max(-50, Math.min(50, cents));
  if (el.dataset.gauge) el.style.transform = `rotate(${c * 1.8}deg)`;
  else el.style.left = (50 + c) + '%';
  el.classList.toggle('ok', !!ok);
  el.classList.toggle('off', Math.abs(cents) > 50);
  el.classList.remove('idle');
}

function idleNeedle(el) {
  if (el.dataset.gauge) el.style.transform = 'rotate(0deg)';
  else el.style.left = '50%';
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
const SCREEN_TITLES = { inicio: 'Início', musicas: 'Músicas', metro: 'Ritmo', leitura: 'Leitura', afinar: 'Afinação', notas: 'Digitações', licoes: 'Lições', descobrir: 'Descobrir a nota', guia: 'Guia' };

function showScreen(name) {
  if (state.screen === name) return;
  leaveScreen(state.screen);
  state.screen = name;
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.screen === name));
  $('topbar-sub').textContent = SCREEN_TITLES[name];
  window.scrollTo(0, 0);
  if (name === 'licoes') renderLessonList();
  if (name === 'inicio') renderHome();
  if (v2) v2.enter(name);
}

function leaveScreen(name) {
  stopMic();
  stopReference();
  setMicButton($('btn-tuner'), false);
  setMicButton($('notas-listen'), false);
  $('notas-live').hidden = true;
  if (name === 'licoes') closeLesson();
  if (v2) v2.leave(name);
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
      $('tuner').classList.remove('in-tune');
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
  $('tuner').classList.toggle('in-tune', ok && n.pc === 9);
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
  $('notas-tip').classList.remove('open');
  const oct = midi >= 84 ? 6 : midi >= 72 ? 5 : 4;
  if (oct !== currentOctave) renderGrid(oct);
  $('note-select').value = String(midi);
}

// Preenche a lista de notas da oitava escolhida.
function renderGrid(oct) {
  currentOctave = oct;
  $('oct-select').value = String(oct);
  const sel = $('note-select');
  sel.innerHTML = '';
  const start = (oct + 1) * 12;
  const end = oct === 6 ? MAX_MIDI : start + 11;
  for (let m = Math.max(start, MIN_MIDI); m <= end; m++) {
    const n = noteInfo(m);
    const o = document.createElement('option');
    o.value = m;
    o.textContent = `${n.name}${n.altName ? ' / ' + n.altName : ''}  (${n.letter})`;
    sel.appendChild(o);
  }
  sel.value = String(selected);
}

$('oct-select').addEventListener('change', (e) => {
  const oct = +e.target.value;
  // mantém o mesmo nome de nota na nova oitava, se existir
  const pc = selected % 12;
  let m = (oct + 1) * 12 + pc;
  if (m > MAX_MIDI) m = MAX_MIDI;
  renderGrid(oct);
  selectNote(m);
});
$('note-select').addEventListener('change', (e) => selectNote(+e.target.value));
$('notas-tip').addEventListener('click', () => $('notas-tip').classList.toggle('open'));

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
    celebrate();
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

// ---------- Descobrir ----------
const descKeys = new Set();
const descFlute = createFlute($('desc-flute'), {
  onKeyTap(k) {
    if (descKeys.has(k)) descKeys.delete(k);
    else {
      descKeys.add(k);
      // polegar: tecla de Si e alavanca de Si♭ não se apertam juntas
      if (k === 'T') descKeys.delete('Tb');
      if (k === 'Tb') descKeys.delete('T');
    }
    renderDescobrir();
  },
});

function keyName(k) {
  const info = KEY_INFO[k];
  const [first, ...rest] = info.name.split(' ');
  const side = info.hand === 'L' ? 'esquerdo' : 'direito';
  return [first, side, ...rest].join(' ');
}

function renderDescobrir() {
  const keys = [...descKeys];
  descFlute.show(keys);
  $('desc-fingers').innerHTML = keys.length ? fingersHTML(keys) : '';
  const box = $('desc-result');
  if (!keys.length) {
    box.innerHTML = '<p class="muted">Nenhuma tecla marcada. Comece pelo polegar e pelos dedos da mão esquerda.</p>';
    return;
  }
  const { exact, near } = findByFingering(keys);
  let html = '';
  if (exact.length) {
    html += `<div class="kicker">${exact.length > 1 ? 'Com essa digitação saem estas notas' : 'Essa digitação é da nota'}</div>`;
    html += exact.map((r) => {
      const n = noteInfo(r.midi);
      return `<div class="match">
        <div class="match-name">${n.name}${n.octave}</div>
        <div class="match-info">${metaHTML(n)}${r.label ? `<br><b>${r.label}</b>` : ''}<br><span class="muted">${n.register.hint}</span></div>
        <button class="btn btn-round play-match" data-midi="${r.midi}" aria-label="Ouvir ${n.name}${n.octave}">🔊</button>
      </div>`;
    }).join('');
    if (exact.length > 1) html += '<p class="muted">O que escolhe a nota é o sopro: mais lento para a mais grave, mais rápido para a mais aguda.</p>';
  } else {
    html += '<div class="kicker">Não é uma digitação padrão</div><p>Nenhuma nota usa exatamente essa combinação de teclas.</p>';
  }
  if (near.length && !exact.length) {
    html += '<div class="kicker" style="margin-top:12px">Notas mais próximas</div>';
    html += near.map((r) => {
      const n = noteInfo(r.midi);
      const parts = [];
      if (r.missing.length) parts.push('aperte ' + r.missing.filter((k) => !(k === 'Cs' && r.missing.includes('C'))).map(keyName).join(', '));
      if (r.extra.length) parts.push('solte ' + r.extra.map(keyName).join(', '));
      return `<div class="match near">
        <div class="match-name">${n.name}${n.octave}</div>
        <div class="match-info">${parts.join('; ')}</div>
        <button class="btn btn-round play-match" data-midi="${r.midi}" aria-label="Ouvir">🔊</button>
      </div>`;
    }).join('');
  }
  box.innerHTML = html;
  box.querySelectorAll('.play-match').forEach((b) => b.addEventListener('click', () => {
    playTone(midiToFreq(+b.dataset.midi, state.a4), { duration: 1.5 });
  }));
}

$('desc-clear').addEventListener('click', () => { descKeys.clear(); renderDescobrir(); });
renderDescobrir();

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

// ---------- Mostrador do afinador ----------
(function buildTicks() {
  const g = document.querySelector('.gauge-ticks');
  for (let c = -50; c <= 50; c += 10) {
    const a = (c * 1.8 - 90) * Math.PI / 180;
    const r1 = c % 50 === 0 || c === 0 ? 62 : 66;
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 100 + r1 * Math.cos(a));
    line.setAttribute('y1', 100 + r1 * Math.sin(a));
    line.setAttribute('x2', 100 + 71 * Math.cos(a));
    line.setAttribute('y2', 100 + 71 * Math.sin(a));
    g.appendChild(line);
  }
})();

// ---------- Celebração ----------
function celebrate() {
  const box = $('confetti');
  const colors = ['#f5a524', '#ffd88a', '#3f7bff', '#9dbeff', '#34d399', '#ffffff'];
  box.innerHTML = '';
  for (let i = 0; i < 70; i++) {
    const p = document.createElement('i');
    p.style.left = Math.random() * 100 + '%';
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = (Math.random() * 0.4) + 's';
    p.style.animationDuration = (1.6 + Math.random() * 1.4) + 's';
    p.style.setProperty('--x', (Math.random() * 160 - 80) + 'px');
    p.style.setProperty('--r', (Math.random() * 720 - 360) + 'deg');
    box.appendChild(p);
  }
  clearTimeout(celebrate._t);
  celebrate._t = setTimeout(() => { box.innerHTML = ''; }, 3500);
}

// ---------- Tela Início ----------
const TIPS_DAY = [
  'Aqueça a flauta tocando notas longas por um minuto antes de afinar: flauta fria soa mais baixo.',
  'Para subir uma oitava, sopre mais rápido, e não mais forte. Diminua a abertura dos lábios.',
  'Mantenha os dedos curvados e perto das teclas, mesmo quando estiverem levantados.',
  'Inspire pela barriga, sem levantar os ombros. Solte o ar como um fio longo e constante.',
  'Estude um pouco todos os dias: 15 minutos diários rendem mais que duas horas uma vez por semana.',
  'Se o som sair com muito ar, gire a flauta levemente para fora e diminua a abertura dos lábios.',
  'Comece cada nota com a língua dizendo "tu", sem voz. Evite começar com a garganta.',
  'Depois de tocar, passe a vareta com um pano por dentro de cada parte da flauta.',
];

function nextLessonIndex() {
  const i = LESSONS.findIndex((l) => !state.completed.has(l.id));
  return i === -1 ? LESSONS.length - 1 : i;
}

function renderHome() {
  const h = new Date().getHours();
  $('home-greet').textContent = h < 5 ? 'Boa noite' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
  const done = LESSONS.filter((l) => state.completed.has(l.id)).length;
  const total = LESSONS.length;
  $('home-done').textContent = done;
  $('home-total').textContent = `de ${total} lições`;
  const c = 2 * Math.PI * 50;
  const fg = $('home-ring-fg');
  fg.style.strokeDasharray = c;
  fg.style.strokeDashoffset = c * (1 - done / total);
  const i = nextLessonIndex();
  const allDone = done === total;
  $('home-continue-title').textContent = allDone ? 'Todas concluídas! Revise qualquer lição' : `Lição ${i + 1} · ${LESSONS[i].title}`;
  $('home-continue').querySelector('.bc-kicker').textContent = done === 0 ? 'Começar' : allDone ? 'Parabéns' : 'Continuar';
  $('home-sub').textContent = done === 0 ? 'Comece afinando a flauta, depois faça a primeira lição.' : allDone ? 'Você concluiu todas as lições.' : `Você já concluiu ${done} ${done === 1 ? 'lição' : 'lições'}. Continue assim!`;
  const day = Math.floor(Date.now() / 86400000);
  $('home-tip').textContent = TIPS_DAY[day % TIPS_DAY.length];
}

$('home-continue').addEventListener('click', () => {
  const done = LESSONS.filter((l) => state.completed.has(l.id)).length;
  showScreen('licoes');
  if (done < LESSONS.length) openLesson(nextLessonIndex());
});
document.querySelectorAll('[data-go]').forEach((b) => b.addEventListener('click', () => showScreen(b.dataset.go)));

// ---------- Abertura e apresentação ----------
async function runIntro() {
  const intro = $('intro');
  await new Promise((ok) => {
    const im = $('intro-logo').querySelector('img');
    if (im.complete) ok(); else { im.onload = ok; im.onerror = ok; setTimeout(ok, 800); }
  });
  intro.classList.add('play');
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    intro.classList.add('out');
    setTimeout(() => {
      intro.hidden = true;
      startOnboarding(); // a apresentação aparece sempre que o app abre
    }, 450);
  };
  intro.addEventListener('click', finish);
  setTimeout(finish, 2800);
}

function startOnboarding() {
  const onb = $('onb');
  onb.hidden = false;
  const slides = onb.querySelectorAll('.onb-slide');
  const dots = onb.querySelectorAll('#onb-dots i');
  const stopDemos = startOnbDemos();
  let idx = 0;
  const go = (i) => {
    idx = Math.max(0, Math.min(slides.length - 1, i));
    $('onb-track').style.transform = `translateX(${-idx * 100}%)`;
    dots.forEach((dot, k) => dot.classList.toggle('on', k === idx));
    $('onb-next').textContent = idx === slides.length - 1 ? 'Começar' : 'Próximo';
  };
  const end = () => {
    stopDemos();
    store.set('onboarded', true);
    onb.classList.add('out');
    setTimeout(() => { onb.hidden = true; }, 400);
  };
  $('onb-next').onclick = () => (idx === slides.length - 1 ? end() : go(idx + 1));
  $('onb-skip').onclick = end;
  let x0 = null;
  onb.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  onb.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) go(idx + (dx < 0 ? 1 : -1));
    x0 = null;
  });
}

// Demonstrações animadas das telas novas da apresentação (até chegarem as ilustrações).
function startOnbDemos() {
  const timers = [];
  // Música: a partitura corre e as notas ficam verdes
  if ($('demo-score')) {
    const demoSong = { ...SONGS[0], notes: SONGS[0].notes.slice(0, 14) };
    const strip = createScoreStrip($('demo-score'), demoSong, { labels: true });
    let i = 0;
    const step = () => {
      if (i === 0) strip.reset();
      if (i > 0) strip.mark(i - 1, 'ok');
      strip.mark(i, 'cur');
      strip.focus(i);
      const n = noteInfo(demoSong.notes[i][0]);
      $('demo-song-name').textContent = `${n.name}${n.octave}`;
      i = (i + 1) % demoSong.notes.length;
    };
    step();
    timers.push(setInterval(step, 750));
  }
  // Leitura: uma nota aparece, depois o nome é revelado
  if ($('demo-staff')) {
    const pool = [67, 72, 64, 76, 69, 62, 74, 71];
    let k = 0;
    const show = () => {
      const m = pool[k++ % pool.length];
      renderSingleNote($('demo-staff'), m);
      const name = $('demo-read-name');
      name.classList.remove('show');
      const n = noteInfo(m);
      name.textContent = `${n.name}${n.octave}`;
      timers.push(setTimeout(() => name.classList.add('show'), 900));
    };
    show();
    timers.push(setInterval(show, 2200));
  }
  return () => timers.forEach((t) => { clearInterval(t); clearTimeout(t); });
}

// ---------- Versão 2 ----------
v2 = initV2({ $, listener, startMic, stopMic, store, state, setNeedle, idleNeedle, createFlute, fingersHTML, celebrate, toast });

// ---------- Início ----------
renderHome();
runIntro();
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
