// Desenho da flauta (SVG) com as teclas apertadas destacadas, e da nota na pauta.

const SVGNS = 'http://www.w3.org/2000/svg';

// Geometria das teclas no desenho (viewBox 0 0 420 170).
// Tubo: y de 62 a 98. Teclas principais sobre o tubo; polegar, Sol♯ e pé abaixo.
const KEYS = [
  { id: 'Tb', shape: 'ellipse', x: 70, y: 124, rx: 9, ry: 6, label: 'Si♭', labelPos: 'below' },
  { id: 'T', shape: 'ellipse', x: 96, y: 124, rx: 13, ry: 8, label: 'Pol.', labelPos: 'below' },
  { id: 'L1', shape: 'circle', x: 78, y: 80, r: 14, label: 'Ind.', labelPos: 'above' },
  { id: 'L2', shape: 'circle', x: 124, y: 80, r: 14, label: 'Méd.', labelPos: 'above' },
  { id: 'L3', shape: 'circle', x: 170, y: 80, r: 14, label: 'Anel.', labelPos: 'above' },
  { id: 'Gs', shape: 'ellipse', x: 196, y: 116, rx: 10, ry: 6, label: 'Sol♯', labelPos: 'below' },
  { id: 'Tr1', shape: 'ellipse', x: 212, y: 50, rx: 7, ry: 5, label: 'Tr1', labelPos: 'above' },
  { id: 'Tr2', shape: 'ellipse', x: 232, y: 50, rx: 7, ry: 5, label: 'Tr2', labelPos: 'above' },
  { id: 'R1', shape: 'circle', x: 262, y: 80, r: 14, label: 'Ind.', labelPos: 'above' },
  { id: 'R2', shape: 'circle', x: 308, y: 80, r: 14, label: 'Méd.', labelPos: 'above' },
  { id: 'R3', shape: 'circle', x: 354, y: 80, r: 14, label: 'Anel.', labelPos: 'above' },
  { id: 'Eb', shape: 'ellipse', x: 368, y: 118, rx: 11, ry: 6, label: 'Mi♭', labelPos: 'below' },
  { id: 'Cs', shape: 'ellipse', x: 396, y: 112, rx: 9, ry: 5, label: 'Dó♯', labelPos: 'right' },
  { id: 'C', shape: 'ellipse', x: 396, y: 128, rx: 9, ry: 5, label: 'Dó', labelPos: 'right' },
];

const LEFT = new Set(['T', 'Tb', 'L1', 'L2', 'L3', 'Gs']);

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

export function createFlute(container) {
  const svg = el('svg', {
    viewBox: '0 0 420 170',
    class: 'flute-svg',
    role: 'img',
    'aria-label': 'Desenho da flauta com as teclas',
  });

  const defs = el('defs', {}, svg);
  const grad = el('linearGradient', { id: 'tube', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  el('stop', { offset: '0%', 'stop-color': 'var(--tube-hi)' }, grad);
  el('stop', { offset: '55%', 'stop-color': 'var(--tube-mid)' }, grad);
  el('stop', { offset: '100%', 'stop-color': 'var(--tube-lo)' }, grad);

  // Linha entre as mãos e rótulos das mãos
  el('text', { x: 124, y: 22, class: 'hand-label hl-left', 'text-anchor': 'middle' }, svg).textContent = 'MÃO ESQUERDA';
  el('text', { x: 308, y: 22, class: 'hand-label hl-right', 'text-anchor': 'middle' }, svg).textContent = 'MÃO DIREITA';

  // Bocal (lado esquerdo) e tubo
  el('rect', { x: 0, y: 66, width: 40, height: 28, rx: 6, fill: 'url(#tube)', class: 'tube-stroke' }, svg);
  el('ellipse', { cx: 22, cy: 66, rx: 10, ry: 5, class: 'lip-plate' }, svg);
  el('rect', { x: 38, y: 62, width: 380, height: 36, rx: 8, fill: 'url(#tube)', class: 'tube-stroke' }, svg);
  el('text', { x: 20, y: 150, class: 'tiny-label', 'text-anchor': 'middle' }, svg).textContent = 'bocal';
  el('text', { x: 96, y: 160, class: 'tiny-label', 'text-anchor': 'middle' }, svg).textContent = '(atrás)';

  const nodes = {};
  for (const k of KEYS) {
    const g = el('g', { class: `key ${LEFT.has(k.id) ? 'left' : 'right'}`, 'data-key': k.id }, svg);
    if (k.shape === 'circle') el('circle', { cx: k.x, cy: k.y, r: k.r }, g);
    else el('ellipse', { cx: k.x, cy: k.y, rx: k.rx, ry: k.ry }, g);
    const size = k.r || k.ry;
    let lx = k.x, ly, anchor = 'middle';
    if (k.labelPos === 'above') ly = k.y - size - 6;
    else if (k.labelPos === 'below') ly = k.y + size + 13;
    else { lx = k.x + 12; ly = k.y + 4; anchor = 'start'; }
    if (k.labelPos === 'right') lx = k.x - 4, ly = k.y + (k.id === 'C' ? 18 : -9);
    el('text', { x: lx, y: ly, class: 'key-label', 'text-anchor': anchor }, g).textContent = k.label;
    nodes[k.id] = g;
  }
  container.innerHTML = '';
  container.appendChild(svg);

  return {
    show(keys) {
      const set = new Set(keys || []);
      for (const [id, g] of Object.entries(nodes)) g.classList.toggle('pressed', set.has(id));
    },
  };
}

// ---------- Pauta ----------

// Desenha a nota na clave de Sol. step = degrau diatônico absoluto (Dó4 = 28).
export function renderStaff(container, info) {
  const W = 120, H = 150;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'staff-svg', role: 'img', 'aria-label': 'Nota na pauta' });
  const gap = 10; // distância entre linhas
  const bottomLineY = 100; // linha do Mi4 (step 30)
  const yOf = (step) => bottomLineY - (step - 30) * (gap / 2);
  for (let i = 0; i < 5; i++) {
    el('line', { x1: 8, x2: W - 8, y1: bottomLineY - i * gap, y2: bottomLineY - i * gap, class: 'staff-line' }, svg);
  }
  el('text', { x: 12, y: bottomLineY - 4, class: 'clef' }, svg).textContent = '𝄞';

  const step = info.step;
  const y = yOf(step);
  const x = 78;
  // Linhas suplementares
  for (let s = 28; s >= step; s -= 2) if (s < 30) el('line', { x1: x - 12, x2: x + 12, y1: yOf(s), y2: yOf(s), class: 'staff-line' }, svg);
  for (let s = 40; s <= step; s += 2) el('line', { x1: x - 12, x2: x + 12, y1: yOf(s), y2: yOf(s), class: 'staff-line' }, svg);
  el('ellipse', { cx: x, cy: y, rx: 7, ry: 5, transform: `rotate(-20 ${x} ${y})`, class: 'note-head' }, svg);
  if (info.sharp) el('text', { x: x - 22, y: y + 6, class: 'accidental' }, svg).textContent = '♯';

  // Ajusta a altura visível para caber notas muito agudas/graves
  const top = Math.min(0, y - 12);
  const bottom = Math.max(H, y + 14);
  svg.setAttribute('viewBox', `0 ${top} ${W} ${bottom - top}`);
  container.innerHTML = '';
  container.appendChild(svg);
}
