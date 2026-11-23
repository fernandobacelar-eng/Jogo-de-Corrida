// Flauta Guia 2: Músicas, Metrônomo + exercícios de ritmo, Leitura de partitura.

import { noteInfo, midiToFreq, freqToMidiFloat } from './notes.js';
import { audioContext, playTone, click } from './audio.js';
import { createScoreStrip, renderSingleNote } from './score.js';
import { SONGS } from './songs.js';

export function initV2(ctx) {
  const { $, listener, startMic, stopMic, store, state, setNeedle, idleNeedle, createFlute, fingersHTML, celebrate, toast } = ctx;

  // ================= Metrônomo (agendador preciso com Web Audio) =================
  class Metronome {
    constructor() { this.timer = 0; this.running = false; }
    start({ bpm, beats, onBeat, startAt }) {
      const ac = audioContext();
      this.stop();
      this.running = true;
      this.bpm = bpm;
      this.beats = beats;
      this.beat = 0;
      this.next = startAt || ac.currentTime + 0.1;
      this.onBeat = onBeat;
      const tick = () => {
        while (this.next < ac.currentTime + 0.12) {
          const accent = this.beat % this.beats === 0;
          click(this.next, accent);
          const b = this.beat, when = this.next;
          if (this.onBeat) setTimeout(() => this.running && this.onBeat(b, when), Math.max(0, (when - ac.currentTime) * 1000));
          this.next += 60 / this.bpm;
          this.beat++;
        }
      };
      tick();
      this.timer = setInterval(tick, 25);
    }
    stop() { clearInterval(this.timer); this.running = false; }
  }
  const metro = new Metronome();

  const TEMPO_NAMES = [[60, 'Largo'], [76, 'Adagio'], [108, 'Andante'], [120, 'Moderato'], [168, 'Allegro'], [999, 'Presto']];
  const tempoName = (b) => TEMPO_NAMES.find(([lim]) => b < lim)[1];

  // ================= MÚSICAS =================
  const song = { cur: null, strip: null, flute: null, mode: 'wait', bpm: 80, idx: 0, results: [], hold: 0, lastT: 0,
    needRelease: false, peak: 0, playing: false, raf: 0, master: null, t0: 0, spb: 0.75, match: 0, ended: false };
  const best = store.get('songBest', {});

  function renderSongList() {
    $('songs-list').innerHTML = SONGS.map((s, i) => `
      <button class="lesson-item song-item" data-i="${i}">
        <span class="lesson-num song-ico">♪</span>
        <span class="lesson-body"><b>${s.title}</b><small>${s.level} · ${s.notes.length} notas${best[s.id] != null ? ` · melhor: ${best[s.id]}%` : ''}</small></span>
        <span class="lesson-go">›</span>
      </button>`).join('');
    $('songs-list').querySelectorAll('.song-item').forEach((b) => b.addEventListener('click', () => openSong(+b.dataset.i)));
  }

  function openSong(i) {
    stopSong();
    song.cur = SONGS[i];
    song.bpm = song.cur.bpm;
    $('songs-list-view').hidden = true;
    $('song-view').hidden = false;
    $('song-done').hidden = true;
    $('song-card').hidden = false;
    $('song-title').textContent = song.cur.title;
    $('song-bpm').textContent = song.bpm;
    song.strip = createScoreStrip($('song-score'), song.cur, { labels: $('song-names').checked });
    if (!song.flute) song.flute = createFlute($('song-flute'));
    song.idx = 0;
    song.results = [];
    showSongNote(0);
    song.strip.focus(0);
    setSongFb('Toque ▶ para ouvir a música ou 🎤 para tocar.', '');
    const tol = state.tolerance;
    $('song-ok-zone').style.left = (50 - tol) + '%';
    $('song-ok-zone').style.width = (tol * 2) + '%';
    window.scrollTo(0, 0);
  }

  function showSongNote(i) {
    const m = song.cur.notes[Math.min(i, song.cur.notes.length - 1)][0];
    if (!m) { $('song-note').textContent = 'pausa'; song.flute.show([]); return; }
    const n = noteInfo(m);
    $('song-note').textContent = `${n.name}${n.octave}`;
    song.flute.show(n.fingering);
  }

  function setSongFb(t, cls) {
    const e = $('song-fb');
    e.textContent = t;
    e.className = 'song-fb ' + cls;
  }

  function setPlayButtons(active) {
    $('song-play').textContent = active === 'play' ? '⏹ Parar' : '🎤 Tocar';
    $('song-play').classList.toggle('on', active === 'play');
    $('song-listen').textContent = active === 'listen' ? '⏹ Parar' : '▶ Ouvir';
    $('song-listen').classList.toggle('on', active === 'listen');
  }

  function stopSong() {
    song.playing = false;
    cancelAnimationFrame(song.raf);
    metro.stop();
    if (song.master) { try { song.master.disconnect(); } catch { /* já desconectado */ } song.master = null; }
    stopMic();
    listener.onLevel = null;
    setPlayButtons(null);
    $('song-count').hidden = true;
  }

  // ---- Ouvir a música (o app toca, a partitura corre) ----
  function listenSong() {
    if (song.playing) { stopSong(); return; }
    stopSong();
    const ac = audioContext();
    song.master = ac.createGain();
    song.master.connect(ac.destination);
    const spb = 60 / song.bpm;
    const t0 = ac.currentTime + 0.3;
    song.cur.notes.forEach(([m, d], i) => {
      if (m) playTone(midiToFreq(m, state.a4), { when: t0 + song.strip.beatsAt[i] * spb, duration: Math.max(0.12, d * spb * 0.9), volume: 0.22, dest: song.master });
    });
    song.strip.reset();
    song.playing = true;
    setPlayButtons('listen');
    setSongFb('Ouvindo a música…', '');
    const total = song.strip.totalBeats;
    let lastI = -1;
    const frame = () => {
      if (!song.playing) return;
      const b = (ac.currentTime - t0) / spb;
      if (b >= total + 0.5) { stopSong(); setSongFb('Agora é sua vez: toque 🎤 Tocar.', ''); song.strip.focus(0); showSongNote(0); return; }
      const i = song.strip.scrollToBeat(Math.max(0, b));
      if (i !== lastI && b >= 0) {
        if (lastI >= 0) song.strip.mark(lastI, null);
        song.strip.mark(i, 'cur');
        showSongNote(i);
        lastI = i;
      }
      song.raf = requestAnimationFrame(frame);
    };
    song.raf = requestAnimationFrame(frame);
  }

  // ---- Tocar ----
  async function playSong() {
    if (song.playing) { stopSong(); setSongFb('Parado.', ''); return; }
    stopSong();
    song.strip.reset();
    song.idx = 0;
    song.results = [];
    song.hold = 0;
    song.needRelease = false;
    song.peak = 0;
    song.ended = false;
    showSongNote(0);
    const ok = await startMic(song.mode === 'wait' ? onSongPitchWait : onSongPitchRhythm);
    if (!ok) return;
    listener.onLevel = onSongLevel;
    song.playing = true;
    setPlayButtons('play');
    if (song.mode === 'wait') {
      song.strip.mark(0, 'cur');
      song.strip.focus(0);
      setSongFb('Toque a primeira nota.', '');
    } else {
      startRhythmSong();
    }
  }

  function onSongLevel(rms) {
    if (rms > song.peak) song.peak = rms;
    if (song.needRelease && rms < song.peak * 0.45) { song.needRelease = false; song.peak = rms; }
  }

  function tolerance() { return state.tolerance; }

  // Modo "esperar por mim": avança quando a nota certa é sustentada.
  function onSongPitchWait(r) {
    if (!song.playing || song.ended) return;
    const now = performance.now();
    const dt = song.lastT ? Math.min(100, now - song.lastT) : 16;
    song.lastT = now;
    const target = song.cur.notes[song.idx][0];
    if (!target) { advanceWait(true); return; }
    if (!r) { song.needRelease = false; song.hold = 0; idleNeedle($('song-needle')); return; }
    if (!r.stable) return;
    const mf = freqToMidiFloat(r.freq, state.a4);
    const cents = (mf - target) * 100;
    if (song.needRelease) { setSongFb('Mesma nota: articule de novo (diga "tu").', ''); return; }
    setNeedle($('song-needle'), cents, Math.abs(cents) <= tolerance());
    if (Math.abs(cents) <= tolerance()) {
      song.hold += dt;
      if (song.hold >= 180) advanceWait(true);
    } else {
      song.hold = 0;
      const pn = noteInfo(Math.round(mf));
      setSongFb(`Você tocou ${pn.name}${pn.octave}.`, 'warn');
    }
  }

  function advanceWait(ok) {
    song.results[song.idx] = ok;
    song.strip.mark(song.idx, ok ? 'ok' : 'miss');
    const prev = song.cur.notes[song.idx][0];
    song.idx++;
    song.hold = 0;
    if (song.idx >= song.cur.notes.length) return finishSong();
    const next = song.cur.notes[song.idx][0];
    song.needRelease = next === prev;
    song.peak = 0;
    song.strip.mark(song.idx, 'cur');
    song.strip.focus(song.idx);
    showSongNote(song.idx);
    setSongFb('Isso!', 'good');
  }

  // Modo "com ritmo": a partitura corre no tempo; cada nota é avaliada na sua janela.
  function startRhythmSong() {
    const ac = audioContext();
    const spb = 60 / song.bpm;
    const beats = song.cur.beats;
    // contagem: um compasso inteiro (+ o resto do compasso quando a música começa em anacruse)
    const countIn = song.cur.pickup ? 2 * beats - song.cur.pickup : beats;
    const t0 = ac.currentTime + 0.3 + countIn * spb; // início da música
    song.t0 = t0;
    song.spb = spb;
    song.match = 0;
    song.lastT = 0;
    const firstClick = t0 - countIn * spb;
    $('song-count').hidden = false;
    metro.start({ bpm: song.bpm, beats, startAt: firstClick, onBeat: (b) => {
      const left = countIn - b;
      $('song-count').textContent = left > 0 ? left : '';
      if (left <= 0) $('song-count').hidden = true;
    } });
    setSongFb('Prepare-se… entre junto com a contagem.', '');
    const total = song.strip.totalBeats;
    let lastI = -1;
    const LAT = 0.08; // compensação aproximada da latência do microfone (s)
    const frame = () => {
      if (!song.playing) return;
      const b = (ac.currentTime - t0) / spb;
      song.strip.scrollToBeat(Math.max(0, b));
      const bl = (ac.currentTime - LAT - t0) / spb; // tempo musical "do que se ouve"
      let i = -1;
      if (bl >= 0) { i = 0; while (i + 1 < song.cur.notes.length && song.strip.beatsAt[i + 1] <= bl) i++; }
      if (i !== lastI) {
        if (lastI >= 0) judgeRhythmNote(lastI);
        if (i >= 0 && bl < total) { song.strip.mark(i, 'cur'); showSongNote(i); song.idx = i; song.match = 0; }
        lastI = i;
      }
      if (bl >= total) { if (lastI >= 0 && song.results[lastI] == null) judgeRhythmNote(lastI); return finishSong(); }
      song.raf = requestAnimationFrame(frame);
    };
    song.raf = requestAnimationFrame(frame);
  }

  function judgeRhythmNote(i) {
    const [m, d] = song.cur.notes[i];
    const durMs = d * song.spb * 1000;
    const ok = !m || song.match >= Math.min(220, durMs * 0.4);
    song.results[i] = ok;
    song.strip.mark(i, ok ? 'ok' : 'miss');
    setSongFb(ok ? 'Isso!' : 'Perdeu essa, continue!', ok ? 'good' : 'warn');
  }

  function onSongPitchRhythm(r) {
    if (!song.playing || song.ended) return;
    const now = performance.now();
    const dt = song.lastT ? Math.min(100, now - song.lastT) : 16;
    song.lastT = now;
    if (!r || !r.stable) { if (!r) idleNeedle($('song-needle')); return; }
    const target = song.cur.notes[song.idx] && song.cur.notes[song.idx][0];
    if (!target) return;
    const cents = (freqToMidiFloat(r.freq, state.a4) - target) * 100;
    const ok = Math.abs(cents) <= tolerance();
    setNeedle($('song-needle'), cents, ok);
    if (ok) song.match += dt;
  }

  function finishSong() {
    song.ended = true;
    stopSong();
    const total = song.cur.notes.length;
    const hits = song.results.filter(Boolean).length;
    const pct = Math.round((hits / total) * 100);
    const prevBest = best[song.cur.id];
    if (prevBest == null || pct > prevBest) { best[song.cur.id] = pct; store.set('songBest', best); }
    $('song-card').hidden = true;
    $('song-done').hidden = false;
    const stars = pct >= 90 ? '★★★' : pct >= 70 ? '★★☆' : pct >= 40 ? '★☆☆' : '☆☆☆';
    $('song-done-title').textContent = `${stars}  ${pct}%`;
    $('song-done-text').textContent = `Você acertou ${hits} de ${total} notas${song.mode === 'rhythm' ? ' no tempo' : ''}.` +
      (prevBest != null && pct > prevBest ? ' Novo recorde!' : '');
    $('song-done').classList.toggle('fail', pct < 70);
    if (pct >= 70) celebrate();
  }

  $('song-back').addEventListener('click', () => { stopSong(); $('song-view').hidden = true; $('songs-list-view').hidden = false; renderSongList(); });
  $('song-done-back').addEventListener('click', () => { $('song-view').hidden = true; $('songs-list-view').hidden = false; renderSongList(); });
  $('song-again').addEventListener('click', () => { $('song-done').hidden = true; $('song-card').hidden = false; playSong(); });
  $('song-listen').addEventListener('click', listenSong);
  $('song-play').addEventListener('click', playSong);
  $('song-slower').addEventListener('click', () => { if (song.bpm > 40) { song.bpm -= 4; $('song-bpm').textContent = song.bpm; } });
  $('song-faster').addEventListener('click', () => { if (song.bpm < 200) { song.bpm += 4; $('song-bpm').textContent = song.bpm; } });
  $('song-names').checked = store.get('songNames', true);
  $('song-names').addEventListener('change', (e) => {
    store.set('songNames', e.target.checked);
    if (song.cur) { const i = song.idx; song.strip = createScoreStrip($('song-score'), song.cur, { labels: e.target.checked }); song.strip.focus(i); }
  });
  $('song-mode').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    if (song.playing) stopSong();
    song.mode = b.dataset.mode;
    $('song-mode').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    setSongFb(song.mode === 'wait' ? 'O app espera você acertar cada nota.' : 'A partitura corre no tempo, com metrônomo.', '');
  }));
  renderSongList();

  // ================= METRÔNOMO =================
  const met = { bpm: store.get('metroBpm', 80), beats: 4, taps: [] };

  function renderMetro() {
    $('metro-bpm').textContent = met.bpm;
    $('metro-name').textContent = tempoName(met.bpm);
    $('metro-slider').value = met.bpm;
    $('metro-dots').innerHTML = Array.from({ length: met.beats }, (_, i) => `<i class="${i === 0 ? 'acc' : ''}"></i>`).join('');
    if (metro.running && !rh.active) metro.bpm = met.bpm;
    store.set('metroBpm', met.bpm);
  }
  function setBpm(b) { met.bpm = Math.max(40, Math.min(208, Math.round(b))); renderMetro(); }
  $('metro-minus').addEventListener('click', () => setBpm(met.bpm - 1));
  $('metro-plus').addEventListener('click', () => setBpm(met.bpm + 1));
  $('metro-slider').addEventListener('input', (e) => setBpm(+e.target.value));
  $('metro-sig').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
    met.beats = +b.dataset.b;
    $('metro-sig').querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
    renderMetro();
    if (metro.running && !rh.active) { stopMetro(); startMetro(); }
  }));
  $('metro-tap').addEventListener('click', () => {
    const t = performance.now();
    met.taps = met.taps.filter((x) => t - x < 2500);
    met.taps.push(t);
    if (met.taps.length >= 3) {
      const d = (met.taps[met.taps.length - 1] - met.taps[0]) / (met.taps.length - 1);
      setBpm(60000 / d);
    }
  });
  function startMetro() {
    metro.start({ bpm: met.bpm, beats: met.beats, onBeat: (b) => {
      const dots = $('metro-dots').querySelectorAll('i');
      dots.forEach((d, i) => d.classList.toggle('on', i === b % met.beats));
    } });
    $('metro-start').textContent = '⏹ Parar';
    $('metro-start').classList.add('on');
  }
  function stopMetro() {
    metro.stop();
    $('metro-start').textContent = '▶ Iniciar';
    $('metro-start').classList.remove('on');
    $('metro-dots').querySelectorAll('i').forEach((d) => d.classList.remove('on'));
  }
  $('metro-start').addEventListener('click', () => (metro.running ? stopMetro() : startMetro()));
  renderMetro();

  // ---- Exercícios de ritmo ----
  const B4 = 71;
  const RHYTHMS = [
    { title: 'Semínimas', desc: 'Uma nota em cada tempo.', notes: [1, 1, 1, 1, 1, 1, 1, 1] },
    { title: 'Mínimas e semínimas', desc: 'Notas de 2 tempos e de 1 tempo.', notes: [2, 2, 1, 1, 2] },
    { title: 'Colcheias', desc: 'Duas notas por tempo.', notes: [1, 1, 0.5, 0.5, 1, 0.5, 0.5, 0.5, 0.5, 2] },
    { title: 'Semínima pontuada', desc: 'Nota longa seguida de nota curta.', notes: [1.5, 0.5, 1, 1, 1.5, 0.5, 2] },
    { title: 'Misturando tudo', desc: 'Para quem já domina os anteriores.', notes: [0.5, 0.5, 1, 1.5, 0.5, 1, 0.5, 0.5, 0.5, 0.5, 2] },
  ];
  const rh = { active: false, ex: null, strip: null, onsets: [], expected: [], t0: 0, spb: 0, lastLevel: 0, quiet: true, lastOnset: 0, timer: 0, raf: 0 };

  $('rhythm-list').innerHTML = RHYTHMS.map((r, i) => `
    <button class="lesson-item song-item" data-i="${i}">
      <span class="lesson-num song-ico">${i + 1}</span>
      <span class="lesson-body"><b>${r.title}</b><small>${r.desc}</small></span>
      <span class="lesson-go">›</span>
    </button>`).join('');
  $('rhythm-list').querySelectorAll('button').forEach((b) => b.addEventListener('click', () => openRhythm(+b.dataset.i)));

  function openRhythm(i) {
    stopMetro();
    rh.ex = RHYTHMS[i];
    $('metro-main').hidden = true;
    $('rhythm-view').hidden = false;
    $('rh-title').textContent = rh.ex.title;
    $('rh-desc').textContent = `${rh.ex.desc} Toque a nota Si (ou qualquer nota), articulando cada uma com "tu". Andamento: ${met.bpm} bpm.`;
    const fake = { notes: rh.ex.notes.map((d) => [B4, d]), beats: 4 };
    rh.strip = createScoreStrip($('rh-score'), fake, { labels: false });
    rh.strip.focus(0);
    $('rh-result').innerHTML = '';
    $('rh-fb').textContent = 'Toque ▶ Começar. Primeiro vem uma contagem de 4 tempos.';
    window.scrollTo(0, 0);
  }

  function closeRhythm() {
    stopRhythm();
    $('rhythm-view').hidden = true;
    $('metro-main').hidden = false;
  }

  function stopRhythm() {
    rh.active = false;
    metro.stop();
    cancelAnimationFrame(rh.raf);
    clearTimeout(rh.timer);
    stopMic();
    listener.onLevel = null;
    $('rh-start').textContent = '▶ Começar';
    $('rh-start').classList.remove('on');
    $('rh-count').hidden = true;
  }

  async function startRhythm() {
    if (rh.active) { stopRhythm(); return; }
    const ok = await startMic(() => {});
    if (!ok) return;
    const ac = audioContext();
    rh.active = true;
    rh.onsets = [];
    rh.quiet = true;
    rh.lastOnset = 0;
    rh.strip.reset();
    $('rh-result').innerHTML = '';
    const spb = 60 / met.bpm;
    rh.spb = spb;
    const firstClick = ac.currentTime + 0.3;
    rh.t0 = firstClick + 4 * spb; // depois da contagem
    // diferença entre o relógio do áudio e o performance.now()
    rh.clockOffset = performance.now() / 1000 - ac.currentTime;
    let b = 0;
    rh.expected = rh.ex.notes.map((d) => { const t = b; b += d; return t; });
    const total = b;
    $('rh-start').textContent = '⏹ Parar';
    $('rh-start').classList.add('on');
    $('rh-count').hidden = false;
    metro.start({ bpm: met.bpm, beats: 4, startAt: firstClick, onBeat: (beat) => {
      const left = 4 - beat;
      $('rh-count').textContent = left > 0 ? left : '';
      if (left <= 0) $('rh-count').hidden = true;
    } });
    listener.onLevel = (rms, tMs) => {
      // detecção de ataque: o volume sobe depois de uma queda
      const thrHigh = 0.025, thrLow = Math.max(0.012, rh.lastLevel * 0.4);
      if (rh.quiet && rms > thrHigh && tMs - rh.lastOnset > 120) {
        rh.onsets.push(tMs / 1000 - rh.clockOffset); // em tempo do áudio
        rh.lastOnset = tMs;
        rh.quiet = false;
        rh.lastLevel = rms;
      } else if (!rh.quiet) {
        if (rms > rh.lastLevel) rh.lastLevel = rms;
        if (rms < thrLow) { rh.quiet = true; rh.lastLevel = 0; }
      }
    };
    $('rh-fb').textContent = 'Ouça a contagem e entre no 1.';
    const frame = () => {
      if (!rh.active) return;
      const beat = (ac.currentTime - rh.t0) / spb;
      const i = rh.strip.scrollToBeat(Math.max(0, beat));
      if (beat >= 0) for (let k = 0; k < rh.ex.notes.length; k++) rh.strip.mark(k, k === i ? 'cur' : null);
      if (beat >= total + 0.6) return finishRhythm();
      rh.raf = requestAnimationFrame(frame);
    };
    rh.raf = requestAnimationFrame(frame);
  }

  function finishRhythm() {
    const onsets = rh.onsets.map((t) => (t - rh.t0) / rh.spb).filter((b) => b > -0.5);
    stopRhythm();
    // casa cada nota esperada com o ataque mais próximo
    const used = new Set();
    const offs = [];
    const matches = rh.expected.map((eb) => {
      let bestJ = -1, bestD = Infinity;
      onsets.forEach((ob, j) => { if (!used.has(j) && Math.abs(ob - eb) < bestD) { bestD = Math.abs(ob - eb); bestJ = j; } });
      if (bestJ >= 0 && bestD <= 0.45) { used.add(bestJ); const off = (onsets[bestJ] - eb) * rh.spb * 1000; offs.push(off); return off; }
      return null;
    });
    // compensa a latência do microfone pela mediana dos desvios
    const sorted = [...offs].sort((a, b) => a - b);
    const lat = sorted.length ? Math.max(0, Math.min(200, sorted[Math.floor(sorted.length / 2)])) : 0;
    const tolMs = Math.max(90, Math.min(160, rh.spb * 1000 * 0.22));
    let hits = 0, sumOff = 0, nOff = 0;
    matches.forEach((off, i) => {
      if (off == null) { rh.strip.mark(i, 'miss'); return; }
      const adj = off - lat;
      sumOff += adj; nOff++;
      const ok = Math.abs(adj) <= tolMs;
      if (ok) hits++;
      rh.strip.mark(i, ok ? 'ok' : 'miss');
    });
    const total = rh.expected.length;
    const pct = Math.round((hits / total) * 100);
    const avg = nOff ? Math.round(sumOff / nOff) : 0;
    const tend = Math.abs(avg) < 25 ? 'No tempo! 👏' : avg > 0 ? `Tendência: um pouco atrasado (${avg} ms).` : `Tendência: um pouco adiantado (${-avg} ms).`;
    const extra = onsets.length > total + 1 ? ' Algumas notas a mais foram ouvidas: articule só as notas escritas.' : '';
    $('rh-result').innerHTML = `<div class="rh-score-big">${pct}%</div><p>${hits} de ${total} notas no tempo. ${nOff ? tend : 'Não ouvi as notas: toque mais perto do celular.'}${extra}</p>`;
    $('rh-fb').textContent = pct >= 80 ? 'Muito bem! Tente um andamento mais rápido.' : 'Tente de novo. Se precisar, diminua o andamento no metrônomo.';
    if (pct >= 80) celebrate();
  }

  $('rh-start').addEventListener('click', startRhythm);
  $('rh-back').addEventListener('click', closeRhythm);

  // ================= LEITURA DE PARTITURA =================
  const RANGES = {
    grave: { label: 'Grave (Dó4 a Si4)', notes: [60, 62, 64, 65, 67, 69, 71] },
    media: { label: 'Aguda (Dó5 a Dó6)', notes: [72, 74, 76, 77, 79, 81, 83, 84] },
    gravemedia: { label: 'Grave e aguda', notes: [60, 62, 64, 65, 67, 69, 71, 72, 74, 76, 77, 79, 81, 83, 84] },
    sustenidos: { label: 'Com sustenidos (Si♭3 a Dó♯6)', notes: Array.from({ length: 28 }, (_, i) => 58 + i) },
    todas: { label: 'Todas (Si♭3 a Fá6)', notes: Array.from({ length: 32 }, (_, i) => 58 + i) },
  };


  const ROUND = 10;
  const rd = { active: false, target: 0, n: 0, points: 0, hold: 0, lastT: 0, revealed: false, start: 0, times: [], flute: null, results: [] };
  $('read-range').innerHTML = Object.entries(RANGES).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join('');
  $('read-range').value = store.get('readRange', 'gravemedia');
  $('read-range').addEventListener('change', (e) => { store.set('readRange', e.target.value); if (rd.active) stopRead(); resetRead(); });

  function resetRead() {
    rd.n = 0; rd.points = 0; rd.results = []; rd.times = [];
    $('read-points').textContent = '0';
    renderReadDots();
    pickReadNote(true);
    $('read-q').textContent = 'Toque 🎤 Começar e toque no sax a nota que aparecer.';
    $('read-q').className = 'read-q';
  }

  function renderReadDots() {
    $('read-dots').innerHTML = Array.from({ length: ROUND }, (_, i) => `<i class="${rd.results[i] === true ? 'ok' : rd.results[i] === false ? 'miss' : i === rd.n ? 'cur' : ''}"></i>`).join('');
  }

  function pickReadNote(first) {
    const pool = RANGES[$('read-range').value].notes;
    let m;
    do { m = pool[Math.floor(Math.random() * pool.length)]; } while (!first && pool.length > 1 && m === rd.target);
    rd.target = m;
    rd.revealed = false;
    rd.hold = 0;
    rd.start = performance.now();
    renderSingleNote($('read-staff'), m);
    $('read-answer').hidden = true;
    idleNeedle($('read-needle'));
  }

  function reveal() {
    const n = noteInfo(rd.target);
    $('read-name').textContent = `${n.name}${n.octave}`;
    if (!rd.flute) rd.flute = createFlute($('read-flute'));
    rd.flute.show(n.fingering);
    $('read-answer').hidden = false;
  }

  async function startRead() {
    if (rd.active) { stopRead(); return; }
    if (rd.n >= ROUND) resetRead();
    const ok = await startMic(onReadPitch);
    if (!ok) return;
    rd.active = true;
    rd.start = performance.now();
    $('read-start').textContent = '⏹ Parar';
    $('read-start').classList.add('on');
    $('read-q').textContent = 'Que nota é esta? Toque no sax.';
  }

  function stopRead() {
    rd.active = false;
    stopMic();
    $('read-start').textContent = '🎤 Começar';
    $('read-start').classList.remove('on');
  }

  function onReadPitch(r) {
    if (!rd.active) return;
    const now = performance.now();
    const dt = rd.lastT ? Math.min(100, now - rd.lastT) : 16;
    rd.lastT = now;
    if (!r) { rd.hold = 0; idleNeedle($('read-needle')); return; }
    if (!r.stable) return;
    const mf = freqToMidiFloat(r.freq, state.a4);
    const cents = (mf - rd.target) * 100;
    setNeedle($('read-needle'), cents, Math.abs(cents) <= state.tolerance);
    if (Math.abs(cents) <= state.tolerance) {
      rd.hold += dt;
      if (rd.hold >= 300) nextRead(!rd.revealed);
    } else {
      rd.hold = 0;
      const pn = noteInfo(Math.round(mf));
      const tn = noteInfo(rd.target);
      $('read-q').textContent = pn.pc === tn.pc ? 'Nota certa, oitava errada. Ajuste o sopro.' : `Você tocou ${pn.name}${pn.octave}. Tente de novo.`;
      $('read-q').className = 'read-q warn';
    }
  }

  function nextRead(ok) {
    rd.results[rd.n] = ok;
    if (ok) { rd.points++; rd.times.push(performance.now() - rd.start); }
    $('read-points').textContent = rd.points;
    $('read-q').textContent = ok ? 'Certo! ✓' : 'Agora sim. Esta não conta ponto.';
    $('read-q').className = 'read-q ' + (ok ? 'good' : '');
    try { navigator.vibrate && navigator.vibrate(40); } catch { /* sem vibração */ }
    rd.n++;
    renderReadDots();
    if (rd.n >= ROUND) return finishRead();
    rd.active = false; // pausa curta entre notas
    setTimeout(() => {
      if (!listener.running) return;
      pickReadNote(false);
      $('read-q').textContent = 'Que nota é esta? Toque no sax.';
      $('read-q').className = 'read-q';
      rd.active = true;
    }, 650);
  }

  function finishRead() {
    stopRead();
    const avg = rd.times.length ? (rd.times.reduce((a, b) => a + b, 0) / rd.times.length / 1000).toFixed(1) : '–';
    const bestPts = store.get('readBest', 0);
    if (rd.points > bestPts) store.set('readBest', rd.points);
    $('read-q').innerHTML = `<b>${rd.points} de ${ROUND}</b> · tempo médio ${avg} s${rd.points > bestPts ? ' · novo recorde!' : ''}<br>Toque 🎤 Começar para outra rodada.`;
    $('read-q').className = 'read-q good';
    if (rd.points >= 8) celebrate();
  }

  $('read-start').addEventListener('click', startRead);
  $('read-reveal').addEventListener('click', () => { rd.revealed = true; reveal(); });
  resetRead();

  // ================= Integração com a navegação =================
  return {
    leave(name) {
      if (name === 'musicas') stopSong();
      if (name === 'metro') { stopMetro(); stopRhythm(); }
      if (name === 'leitura') stopRead();
    },
    enter(name) {
      if (name === 'musicas' && $('song-view').hidden) renderSongList();
      if (name === 'leitura' && !rd.active && rd.n >= ROUND) resetRead();
    },
    toast,
    fingersHTML,
  };
}
