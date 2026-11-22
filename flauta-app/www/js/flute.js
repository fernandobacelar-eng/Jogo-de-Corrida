// Desenho realista da flauta (SVG) com as teclas apertadas destacadas, e da nota na pauta.
// Vista de cima da flauta, com bocal à esquerda. Teclas operadas por trás (polegar)
// e alavancas dos mindinhos aparecem abaixo do tubo.

const SVGNS = 'http://www.w3.org/2000/svg';
let uid = 0;

const TUBE_Y = 64; // topo do tubo
const TUBE_H = 30;
const CY = TUBE_Y + TUBE_H / 2; // linha central

// Teclas: cup = tampa redonda sobre o tubo; paddle = alavanca/espátula.
const KEYS = [
  // Mão esquerda
  { id: 'L1', type: 'cup', x: 150, r: 15, finger: '1', label: 'Indicador', short: 'Ind.' },
  { id: 'L2', type: 'cup', x: 196, r: 15, finger: '2', label: 'Médio', short: 'Méd.' },
  { id: 'L3', type: 'cup', x: 242, r: 15, finger: '3', label: 'Anelar', short: 'Anel.' },
  { id: 'Tb', type: 'paddle', x: 140, y: 118, w: 20, h: 11, rot: 0, label: 'Si♭', back: true },
  { id: 'T', type: 'paddle', x: 170, y: 120, w: 30, h: 15, rot: 0, label: 'Polegar', back: true },
  { id: 'Gs', type: 'paddle', x: 270, y: 112, w: 28, h: 11, rot: -12, label: 'Sol♯' },
  // Trinados
  // Mão direita
  { id: 'R1', type: 'cup', x: 344, r: 15, finger: '1', label: 'Indicador', short: 'Ind.' },
  // Teclas de trinado: Tr1 entre o indicador e o médio direitos (apertada pelo médio),
  // Tr2 entre o médio e o anelar direitos (apertada pelo anelar).
  { id: 'Tr1', type: 'cup', x: 367, r: 6.5, cyOff: -3, label: 'Tr1', small: true },
  { id: 'R2', type: 'cup', x: 390, r: 15, finger: '2', label: 'Médio', short: 'Méd.' },
  { id: 'Tr2', type: 'cup', x: 413, r: 6.5, cyOff: -3, label: 'Tr2', small: true },
  { id: 'R3', type: 'cup', x: 436, r: 15, finger: '3', label: 'Anelar', short: 'Anel.' },
  { id: 'Eb', type: 'paddle', x: 470, y: 114, w: 26, h: 12, rot: -10, label: 'Mi♭' },
  // Pé (mindinho direito)
  { id: 'Cs', type: 'paddle', x: 516, y: 112, w: 22, h: 11, rot: 0, label: 'Dó♯' },
  { id: 'C', type: 'paddle', x: 516, y: 128, w: 22, h: 11, rot: 0, label: 'Dó' },
];

const LEFT = new Set(['T', 'Tb', 'L1', 'L2', 'L3', 'Gs']);

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

function stop(grad, offset, cssVar, extra = '') {
  el('stop', { offset, style: `stop-color: var(${cssVar})${extra}` }, grad);
}

export function createFlute(container, { onKeyTap } = {}) {
  const interactive = !!onKeyTap;
  const id = 'fl' + (++uid);
  const W = 560, H = 160;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'flute-svg' + (interactive ? ' interactive' : ''), role: 'img', 'aria-label': 'Desenho da flauta com as teclas' });

  // ---------- gradientes ----------
  const defs = el('defs', {}, svg);
  const tube = el('linearGradient', { id: id + 'tube', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  stop(tube, '0%', '--metal-lo');
  stop(tube, '18%', '--metal-hi');
  stop(tube, '34%', '--metal-shine');
  stop(tube, '60%', '--metal-mid');
  stop(tube, '100%', '--metal-lo');

  const ring = el('linearGradient', { id: id + 'ring', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  stop(ring, '0%', '--metal-mid');
  stop(ring, '30%', '--metal-shine');
  stop(ring, '100%', '--metal-lo');

  const cup = el('radialGradient', { id: id + 'cup', cx: '38%', cy: '32%', r: '75%' }, defs);
  stop(cup, '0%', '--metal-shine');
  stop(cup, '45%', '--metal-hi');
  stop(cup, '100%', '--metal-mid');

  for (const hand of ['left', 'right']) {
    const g = el('radialGradient', { id: `${id}${hand}`, cx: '38%', cy: '30%', r: '80%' }, defs);
    stop(g, '0%', `--${hand}-hi`);
    stop(g, '100%', `--${hand}`);
  }
  const glow = el('filter', { id: id + 'glow', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs);
  el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 3 }, glow);

  const shadow = el('filter', { id: id + 'sh', x: '-10%', y: '-30%', width: '120%', height: '180%' }, defs);
  el('feDropShadow', { dx: 0, dy: 3, stdDeviation: 3, 'flood-opacity': 0.25 }, shadow);

  // ---------- rótulos das mãos ----------
  const lh = el('g', { class: 'hand-bracket left' }, svg);
  el('path', { d: 'M128 22 h136', class: 'bracket-line' }, lh);
  el('text', { x: 196, y: 16, 'text-anchor': 'middle', class: 'hand-label' }, lh).textContent = 'MÃO ESQUERDA';
  const rh = el('g', { class: 'hand-bracket right' }, svg);
  el('path', { d: 'M322 22 h136', class: 'bracket-line' }, rh);
  el('text', { x: 390, y: 16, 'text-anchor': 'middle', class: 'hand-label' }, rh).textContent = 'MÃO DIREITA';

  // ---------- corpo da flauta ----------
  const body = el('g', { filter: `url(#${id}sh)` }, svg);
  // Cabeça (truncada) com coroa e porta-lábio
  el('rect', { x: 2, y: TUBE_Y + 2, width: 14, height: TUBE_H - 4, rx: 5, fill: `url(#${id}ring)` }, body);
  el('rect', { x: 14, y: TUBE_Y, width: 92, height: TUBE_H, fill: `url(#${id}tube)` }, body);
  // Encaixe cabeça/corpo
  el('rect', { x: 100, y: TUBE_Y - 3, width: 12, height: TUBE_H + 6, rx: 3, fill: `url(#${id}ring)` }, body);
  // Corpo
  el('rect', { x: 112, y: TUBE_Y, width: 368, height: TUBE_H, fill: `url(#${id}tube)` }, body);
  // Encaixe corpo/pé
  el('rect', { x: 478, y: TUBE_Y - 3, width: 10, height: TUBE_H + 6, rx: 3, fill: `url(#${id}ring)` }, body);
  // Pé
  el('rect', { x: 488, y: TUBE_Y + 1, width: 66, height: TUBE_H - 2, fill: `url(#${id}tube)` }, body);
  el('rect', { x: 550, y: TUBE_Y - 1, width: 8, height: TUBE_H + 2, rx: 3, fill: `url(#${id}ring)` }, body);

  // Porta-lábio e furo do bocal
  el('path', {
    d: `M34 ${TUBE_Y - 6} q22 -6 44 0 q6 ${TUBE_H / 2 + 6} 0 ${TUBE_H + 12} q-22 6 -44 0 q-6 -${TUBE_H / 2 + 6} 0 -${TUBE_H + 12}z`,
    fill: `url(#${id}cup)`, class: 'metal-edge',
  }, svg);
  el('ellipse', { cx: 56, cy: CY, rx: 10, ry: 6.5, class: 'emb-hole' }, svg);

  // Eixos (varetas do mecanismo) e pilares
  el('line', { x1: 124, x2: 470, y1: TUBE_Y + 3, y2: TUBE_Y + 3, class: 'rod' }, svg);
  el('line', { x1: 494, x2: 546, y1: TUBE_Y + TUBE_H - 3, y2: TUBE_Y + TUBE_H - 3, class: 'rod' }, svg);
  for (const px of [124, 266, 322, 466, 494, 546]) {
    el('circle', { cx: px, cy: px > 480 ? TUBE_Y + TUBE_H - 3 : TUBE_Y + 3, r: 3.2, class: 'post' }, svg);
  }
  // Tampas do pé (Dó♯ e Dó) — não apertadas diretamente, só decorativas
  for (const fx of [506, 532]) el('circle', { cx: fx, cy: CY, r: 10, fill: `url(#${id}cup)`, class: 'metal-edge' }, svg);
  // Tampa do Mi♭ no corpo
  el('circle', { cx: 464, cy: CY + 1, r: 9, fill: `url(#${id}cup)`, class: 'metal-edge' }, svg);
  // Pequenas tampas fixas entre as mãos (sol♯ e si♭) para realismo
  el('circle', { cx: 266, cy: CY + 3, r: 7, fill: `url(#${id}cup)`, class: 'metal-edge' }, svg);
  el('circle', { cx: 120, cy: CY + 3, r: 6, fill: `url(#${id}cup)`, class: 'metal-edge' }, svg);

  // ---------- teclas interativas ----------
  const nodes = {};
  for (const k of KEYS) {
    const hand = LEFT.has(k.id) ? 'left' : 'right';
    const g = el('g', { class: `key ${hand} ${k.type}${k.back ? ' back' : ''}${k.small ? ' small' : ''}`, 'data-key': k.id }, svg);
    const fillOpen = `url(#${id}cup)`;
    const fillOn = `url(#${id}${hand})`;
    let shape, halo, cx, cy;
    if (k.type === 'cup') {
      cx = k.x; cy = CY + (k.cyOff || 0);
      halo = el('circle', { cx, cy, r: k.r + 5, class: 'halo', filter: `url(#${id}glow)` }, g);
      shape = el('circle', { cx, cy, r: k.r, class: 'cap' }, g);
      if (!k.small) {
        el('circle', { cx, cy, r: k.r - 4.5, class: 'cap-inner' }, g);
        el('text', { x: cx, y: cy + 5, 'text-anchor': 'middle', class: 'finger-num' }, g).textContent = k.finger;
      }
      el('text', { x: cx, y: k.small ? TUBE_Y + TUBE_H + 12 : TUBE_Y - 11, 'text-anchor': 'middle', class: 'key-label' + (k.small ? ' tiny' : '') }, g).textContent = k.small ? k.label : k.short;
    } else {
      cx = k.x; cy = k.y;
      const t = `rotate(${k.rot} ${cx} ${cy})`;
      halo = el('rect', { x: cx - k.w / 2 - 4, y: cy - k.h / 2 - 4, width: k.w + 8, height: k.h + 8, rx: (k.h + 8) / 2, transform: t, class: 'halo', filter: `url(#${id}glow)` }, g);
      shape = el('rect', { x: cx - k.w / 2, y: cy - k.h / 2, width: k.w, height: k.h, rx: k.h / 2, transform: t, class: 'cap' }, g);
      const labelBelow = k.id !== 'Cs';
      const ly = k.id === 'C' ? cy + k.h / 2 + 12 : k.id === 'Cs' ? cy - k.h / 2 - 5 : cy + k.h / 2 + 13;
      el('text', { x: k.id === 'Cs' || k.id === 'C' ? cx + 16 : cx, y: k.id === 'Cs' ? cy + 4 : k.id === 'C' ? cy + 4 : ly, 'text-anchor': k.id === 'Cs' || k.id === 'C' ? 'start' : 'middle', class: 'key-label' }, g).textContent = k.label;
      void labelBelow;
    }
    if (onKeyTap) {
      // área de toque maior que o desenho, para facilitar no celular
      if (k.type === 'cup') el('circle', { cx, cy, r: k.r + (k.small ? 6 : 8), class: 'hit' }, g);
      else el('rect', { x: cx - k.w / 2 - 8, y: cy - k.h / 2 - 7, width: k.w + 16, height: k.h + 14, rx: 8, class: 'hit', transform: `rotate(${k.rot} ${cx} ${cy})` }, g);
    }
    shape.dataset.open = fillOpen;
    shape.dataset.on = fillOn;
    shape.setAttribute('fill', fillOpen);
    nodes[k.id] = { g, shape, halo };
    if (onKeyTap) g.addEventListener('click', () => onKeyTap(k.id));
  }
  el('text', { x: 155, y: 152, 'text-anchor': 'middle', class: 'tiny-label' }, svg).textContent = '(polegar, atrás da flauta)';
  el('text', { x: 520, y: 152, 'text-anchor': 'middle', class: 'tiny-label' }, svg).textContent = 'mindinho';

  container.innerHTML = '';
  container.appendChild(svg);

  return {
    show(keys) {
      const set = new Set(keys || []);
      for (const [kid, n] of Object.entries(nodes)) {
        const on = set.has(kid);
        n.g.classList.toggle('pressed', on);
        n.shape.setAttribute('fill', on ? n.shape.dataset.on : n.shape.dataset.open);
      }
      // destaca o rótulo da mão que não tem nenhum dedo
      svg.querySelector('.hand-bracket.left').classList.toggle('dim', ![...set].some((k) => LEFT.has(k)));
      svg.querySelector('.hand-bracket.right').classList.toggle('dim', ![...set].some((k) => !LEFT.has(k)));
    },
  };
}

// ---------- Pauta ----------

// Desenha a nota na clave de Sol. step = degrau diatônico absoluto (Dó4 = 28).
export function renderStaff(container, info) {
  const W = 120, H = 150;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'staff-svg', role: 'img', 'aria-label': 'Nota na pauta' });
  const gap = 10;
  const bottomLineY = 100; // linha do Mi4 (step 30)
  const yOf = (step) => bottomLineY - (step - 30) * (gap / 2);
  for (let i = 0; i < 5; i++) {
    el('line', { x1: 8, x2: W - 8, y1: bottomLineY - i * gap, y2: bottomLineY - i * gap, class: 'staff-line' }, svg);
  }
  el('text', { x: 12, y: bottomLineY - 4, class: 'clef' }, svg).textContent = '𝄞';

  const step = info.step;
  const y = yOf(step);
  const x = 78;
  for (let s = 28; s >= step; s -= 2) if (s < 30) el('line', { x1: x - 12, x2: x + 12, y1: yOf(s), y2: yOf(s), class: 'staff-line' }, svg);
  for (let s = 40; s <= step; s += 2) el('line', { x1: x - 12, x2: x + 12, y1: yOf(s), y2: yOf(s), class: 'staff-line' }, svg);
  el('ellipse', { cx: x, cy: y, rx: 7, ry: 5, transform: `rotate(-20 ${x} ${y})`, class: 'note-head' }, svg);
  if (info.sharp) el('text', { x: x - 22, y: y + 6, class: 'accidental' }, svg).textContent = '♯';

  const top = Math.min(0, y - 12);
  const bottom = Math.max(H, y + 14);
  svg.setAttribute('viewBox', `0 ${top} ${W} ${bottom - top}`);
  container.innerHTML = '';
  container.appendChild(svg);
}
