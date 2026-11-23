// Partitura em faixa (clave de Sol) para as músicas e para o treino de leitura.

import { noteInfo } from './notes.js';

const NS = 'http://www.w3.org/2000/svg';
const GAP = 12; // distância entre linhas da pauta
const TOP = 46; // y da linha de cima (Fá5)
const BOTTOM = TOP + 4 * GAP; // y da linha de baixo (Mi4, degrau 30)
const H = 150;

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

export const yOfStep = (step) => BOTTOM - (step - 30) * (GAP / 2);

function drawLedgers(g, x, step) {
  for (let s = 28; s >= step; s -= 2) el('line', { x1: x - 13, x2: x + 13, y1: yOfStep(s), y2: yOfStep(s), class: 'sc-ledger' }, g);
  for (let s = 40; s <= step; s += 2) el('line', { x1: x - 13, x2: x + 13, y1: yOfStep(s), y2: yOfStep(s), class: 'sc-ledger' }, g);
}

// Desenha uma figura musical (cabeça, haste, bandeirola, ponto, sustenido).
function drawNote(g, x, midi, dur, { label = true } = {}) {
  if (!midi) {
    // pausa de semínima simplificada
    el('rect', { x: x - 4, y: TOP + GAP, width: 8, height: GAP * 1.6, rx: 2, class: 'sc-rest' }, g);
    return;
  }
  const n = noteInfo(midi);
  const y = yOfStep(n.step);
  drawLedgers(g, x, n.step);
  const dotted = [0.75, 1.5, 3].includes(dur);
  const fig = dotted ? dur / 1.5 : dur; // figura sem o ponto de aumento
  const hollow = fig >= 2;
  el('ellipse', { cx: x, cy: y, rx: 7.2, ry: 5.2, transform: `rotate(-20 ${x} ${y})`, class: hollow ? 'sc-head hollow' : 'sc-head' }, g);
  if (fig < 4) {
    const up = n.step < 34;
    const sx = up ? x + 6.4 : x - 6.4;
    const y2 = up ? y - 36 : y + 36;
    el('line', { x1: sx, x2: sx, y1: y + (up ? -2 : 2), y2, class: 'sc-stem' }, g);
    const flags = fig <= 0.25 ? 2 : fig <= 0.5 ? 1 : 0;
    for (let f = 0; f < flags; f++) {
      const fy = y2 + (up ? f * 8 : -f * 8);
      const d = up
        ? `M${sx} ${fy} c 2 8 12 10 9 22 c 2 -10 -5 -14 -9 -15`
        : `M${sx} ${fy} c 2 -8 12 -10 9 -22 c 2 10 -5 14 -9 15`;
      el('path', { d, class: 'sc-flag' }, g);
    }
  }
  if (dotted) el('circle', { cx: x + 12, cy: y - (n.step % 2 === 0 ? 3 : 0), r: 2.2, class: 'sc-dot' }, g);
  if (n.sharp) el('text', { x: x - 21, y: y + 5, class: 'sc-acc' }, g).textContent = '♯';
  if (label) el('text', { x, y: H - 8, 'text-anchor': 'middle', class: 'sc-label' }, g).textContent = n.name;
}

function drawStaff(svg, width, withClef = true) {
  for (let i = 0; i < 5; i++) el('line', { x1: 0, x2: width, y1: TOP + i * GAP, y2: TOP + i * GAP, class: 'sc-line' }, svg);
  if (withClef) el('text', { x: 6, y: BOTTOM - 6, class: 'sc-clef' }, svg).textContent = '𝄞';
}

// Faixa com a música inteira. Retorna funções para destacar e posicionar.
export function createScoreStrip(container, song, { labels = true } = {}) {
  const LEAD = 64; // espaço da clave
  const xs = [];
  const beatsAt = [];
  let x = LEAD + 20;
  let beat = 0;
  for (const [, dur] of song.notes) {
    xs.push(x);
    beatsAt.push(beat);
    x += 26 + dur * 30;
    beat += dur;
  }
  const width = x + 40;
  const svg = el('svg', { viewBox: `0 0 ${width} ${H}`, width, height: H, class: 'score-svg' });
  drawStaff(svg, width);
  // barras de compasso
  const pickup = song.pickup || 0;
  for (let i = 1; i < song.notes.length; i++) {
    const b = beatsAt[i] - pickup;
    if (b > 0 && Math.abs(b / song.beats - Math.round(b / song.beats)) < 1e-6) {
      const bx = (xs[i - 1] + xs[i]) / 2 + 6;
      el('line', { x1: bx, x2: bx, y1: TOP, y2: BOTTOM, class: 'sc-bar' }, svg);
    }
  }
  el('line', { x1: width - 14, x2: width - 14, y1: TOP, y2: BOTTOM, class: 'sc-bar' }, svg);
  el('line', { x1: width - 8, x2: width - 8, y1: TOP, y2: BOTTOM, class: 'sc-bar end' }, svg);

  const groups = song.notes.map(([midi, dur], i) => {
    const g = el('g', { class: 'sc-note' }, svg);
    drawNote(g, xs[i], midi, dur, { label: labels });
    return g;
  });

  const viewport = document.createElement('div');
  viewport.className = 'score-viewport';
  const track = document.createElement('div');
  track.className = 'score-track';
  track.appendChild(svg);
  viewport.appendChild(track);
  const cursor = document.createElement('div');
  cursor.className = 'score-cursor';
  viewport.appendChild(cursor);
  container.innerHTML = '';
  container.appendChild(viewport);

  const offset = () => Math.min(140, viewport.clientWidth * 0.35);
  const setX = (px, smooth) => {
    track.style.transition = smooth ? 'transform .35s cubic-bezier(.3,.8,.3,1)' : 'none';
    track.style.transform = `translateX(${Math.round(offset() - px)}px)`;
  };
  const totalBeats = beat;

  return {
    count: song.notes.length,
    beatsAt,
    totalBeats,
    // Rola até a nota i (modo "esperar por mim")
    focus(i) { setX(xs[Math.min(i, xs.length - 1)], true); },
    // Rola de forma contínua de acordo com o tempo (em tempos musicais)
    scrollToBeat(b) {
      let i = 0;
      while (i + 1 < beatsAt.length && beatsAt[i + 1] <= b) i++;
      const b0 = beatsAt[i], b1 = i + 1 < beatsAt.length ? beatsAt[i + 1] : totalBeats;
      const x0 = xs[i], x1 = i + 1 < xs.length ? xs[i + 1] : width - 30;
      const t = b1 > b0 ? Math.min(1, Math.max(0, (b - b0) / (b1 - b0))) : 0;
      setX(x0 + (x1 - x0) * t, false);
      return i;
    },
    mark(i, cls) {
      const g = groups[i];
      if (!g) return;
      g.classList.remove('cur', 'ok', 'miss');
      if (cls) g.classList.add(cls);
    },
    reset() { groups.forEach((g) => g.classList.remove('cur', 'ok', 'miss')); setX(xs[0], false); },
  };
}

// Uma única nota grande (treino de leitura).
export function renderSingleNote(container, midi) {
  const W = 220;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'score-svg single' });
  drawStaff(svg, W);
  const g = el('g', { class: 'sc-note cur' }, svg);
  drawNote(g, 140, midi, 4, { label: false });
  container.innerHTML = '';
  container.appendChild(svg);
}
