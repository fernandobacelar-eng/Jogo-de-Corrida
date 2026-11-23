// Desenho do SAXOFONE ALTO (SVG), em pé, com as chaves apertadas destacadas, e a nota na pauta.
// Corpo vertical; boquilha e tudel em cima; curva e campana embaixo, à direita.
// Chaves de polegar (oitava) e de mínimo aparecem ao lado, com rótulos.

const SVGNS = 'http://www.w3.org/2000/svg';
let uid = 0;
const CX = 112; // eixo do corpo

// type: 'pearl' = chave principal (círculo grande); 'small' = chave pequena (oval)
const KEYS = [
  { id: 'Oc', hand: 'left', type: 'small', x: 74, y: 150, rx: 9, ry: 6, label: 'Oitava', sub: '(polegar, atrás)', lp: 'left' },
  { id: 'Pf', hand: 'left', type: 'small', x: 146, y: 96, rx: 7, ry: 5, label: 'Fá', lp: 'right' },
  { id: 'Pd', hand: 'left', type: 'small', x: 152, y: 112, rx: 7, ry: 5, label: 'Ré', lp: 'right' },
  { id: 'Pe', hand: 'left', type: 'small', x: 154, y: 128, rx: 7, ry: 5, label: 'Mi♭', lp: 'right' },
  { id: 'L1', hand: 'left', type: 'pearl', x: CX, y: 166, r: 11, label: 'Ind.', finger: '1' },
  { id: 'Bis', hand: 'left', type: 'small', x: CX, y: 186, rx: 5, ry: 4, label: 'bis', lp: 'right' },
  { id: 'L2', hand: 'left', type: 'pearl', x: CX, y: 206, r: 11, label: 'Méd.', finger: '2' },
  { id: 'L3', hand: 'left', type: 'pearl', x: CX, y: 246, r: 11, label: 'Anel.', finger: '3' },
  { id: 'Gs', hand: 'left', type: 'small', x: 78, y: 272, rx: 8, ry: 5.5, label: 'Sol♯', lp: 'left' },
  { id: 'Cs', hand: 'left', type: 'small', x: 70, y: 288, rx: 8, ry: 5.5, label: 'Dó♯', lp: 'left' },
  { id: 'Bl', hand: 'left', type: 'small', x: 80, y: 304, rx: 8, ry: 5.5, label: 'Si', lp: 'left' },
  { id: 'Bb', hand: 'left', type: 'small', x: 72, y: 320, rx: 8, ry: 5.5, label: 'Si♭', lp: 'left' },
  { id: 'Se', hand: 'right', type: 'small', x: 150, y: 296, rx: 6, ry: 9, label: 'Mi', lp: 'right' },
  { id: 'Sc', hand: 'right', type: 'small', x: 150, y: 318, rx: 6, ry: 8, label: 'Dó', lp: 'right' },
  { id: 'Sb', hand: 'right', type: 'small', x: 150, y: 338, rx: 6, ry: 8, label: 'Si♭', lp: 'right' },
  { id: 'R1', hand: 'right', type: 'pearl', x: CX, y: 316, r: 11, label: 'Ind.', finger: '1' },
  { id: 'R2', hand: 'right', type: 'pearl', x: CX, y: 356, r: 11, label: 'Méd.', finger: '2' },
  { id: 'R3', hand: 'right', type: 'pearl', x: CX, y: 396, r: 11, label: 'Anel.', finger: '3' },
  { id: 'Re', hand: 'right', type: 'small', x: 148, y: 424, rx: 9, ry: 5.5, label: 'Mi♭', lp: 'right' },
  { id: 'Rc', hand: 'right', type: 'small', x: 148, y: 442, rx: 9, ry: 5.5, label: 'Dó', lp: 'right' },
];

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

export function createFlute(container, { onKeyTap } = {}) {
  const id = 'sx' + (++uid);
  const W = 220, H = 540;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'flute-svg sax vertical' + (onKeyTap ? ' interactive' : ''), role: 'img', 'aria-label': 'Desenho do saxofone com as chaves' });
  const defs = el('defs', {}, svg);
  const brass = el('linearGradient', { id: id + 'brass', x1: 0, y1: 0, x2: 1, y2: 0 }, defs);
  [['0%', '#8a5a12'], ['25%', '#f7d68a'], ['45%', '#e8b54a'], ['100%', '#7a4c0c']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, brass));
  const pearl = el('radialGradient', { id: id + 'pearl', cx: '38%', cy: '32%', r: '75%' }, defs);
  [['0%', '#ffffff'], ['55%', '#f1ece2'], ['100%', '#c9bfae']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, pearl));
  const keyc = el('radialGradient', { id: id + 'keyc', cx: '38%', cy: '32%', r: '75%' }, defs);
  [['0%', '#fff1c8'], ['50%', '#e9bc5c'], ['100%', '#a8741a']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, keyc));
  for (const hand of ['left', 'right']) {
    const g = el('radialGradient', { id: `${id}${hand}`, cx: '38%', cy: '30%', r: '80%' }, defs);
    el('stop', { offset: '0%', style: `stop-color: var(--${hand}-hi)` }, g);
    el('stop', { offset: '100%', style: `stop-color: var(--${hand})` }, g);
  }
  const glow = el('filter', { id: id + 'glow', x: '-60%', y: '-60%', width: '220%', height: '220%' }, defs);
  el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 3 }, glow);
  const shadow = el('filter', { id: id + 'sh', x: '-30%', y: '-5%', width: '160%', height: '110%' }, defs);
  el('feDropShadow', { dx: 3, dy: 3, stdDeviation: 3, 'flood-opacity': 0.35 }, shadow);

  // Rótulos das mãos (à esquerda, na vertical)
  const lh = el('g', { class: 'hand-bracket left' }, svg);
  el('path', { d: 'M16 150 v176', class: 'bracket-line' }, lh);
  el('text', { x: 9, y: 238, 'text-anchor': 'middle', class: 'hand-label', transform: 'rotate(-90 9 238)' }, lh).textContent = 'MÃO ESQUERDA';
  const rh = el('g', { class: 'hand-bracket right' }, svg);
  el('path', { d: 'M16 340 v110', class: 'bracket-line' }, rh);
  el('text', { x: 9, y: 395, 'text-anchor': 'middle', class: 'hand-label', transform: 'rotate(-90 9 395)' }, rh).textContent = 'MÃO DIREITA';

  // Corpo: boquilha, tudel, corpo, curva e campana
  const g = el('g', { filter: `url(#${id}sh)` }, svg);
  el('path', { d: 'M62 18 l10 -8 l14 10 l-6 10 z', fill: '#1d1d22' }, g); // boquilha
  el('path', { d: `M80 26 C 92 34, 100 50, ${CX - 8} 70 L ${CX + 8} 70 C 106 46, 96 28, 84 18 z`, fill: `url(#${id}brass)`, class: 'sx-edge' }, g); // tudel
  el('rect', { x: CX - 13, y: 66, width: 26, height: 12, rx: 3, fill: `url(#${id}brass)`, class: 'sx-edge' }, g); // encaixe
  el('path', { d: `M${CX - 14} 76 L${CX - 19} 460 Q${CX - 19} 512 ${CX + 22} 512 Q${CX + 66} 512 ${CX + 66} 468 L${CX + 70} 360 L${CX + 46} 360 L${CX + 42} 462 Q${CX + 42} 486 ${CX + 22} 486 Q${CX + 5} 486 ${CX + 5} 460 L${CX + 14} 76 z`, fill: `url(#${id}brass)`, class: 'sx-edge' }, g); // corpo + curva + subida
  el('path', { d: `M${CX + 40} 362 Q${CX + 34} 330 ${CX + 22} 312 L${CX + 96} 312 Q${CX + 84} 330 ${CX + 76} 362 z`, fill: `url(#${id}brass)`, class: 'sx-edge' }, g); // campana
  el('ellipse', { cx: CX + 59, cy: 312, rx: 37, ry: 7, fill: '#5a3a08', stroke: '#f7d68a', 'stroke-width': 2 }, g); // boca da campana
  // haste das chaves (vareta)
  el('line', { x1: CX + 18, x2: CX + 18, y1: 150, y2: 410, class: 'sx-rod' }, svg);

  const nodes = {};
  for (const k of KEYS) {
    const grp = el('g', { class: `key ${k.hand} ${k.type}`, 'data-key': k.id }, svg);
    let shape;
    if (k.type === 'pearl') {
      el('circle', { cx: k.x, cy: k.y, r: k.r + 5, class: 'halo', filter: `url(#${id}glow)` }, grp);
      el('circle', { cx: k.x, cy: k.y, r: k.r + 3, fill: `url(#${id}keyc)`, class: 'sx-edge' }, grp); // tampa metálica
      shape = el('circle', { cx: k.x, cy: k.y, r: k.r - 1, class: 'cap' }, grp); // madrepérola
      shape.dataset.open = `url(#${id}pearl)`;
      if (k.finger) el('text', { x: k.x, y: k.y + 4.5, 'text-anchor': 'middle', class: 'finger-num' }, grp).textContent = k.finger;
      el('text', { x: k.x - k.r - 10, y: k.y + 4, 'text-anchor': 'end', class: 'key-label' }, grp).textContent = k.label;
    } else {
      el('ellipse', { cx: k.x, cy: k.y, rx: k.rx + 4, ry: k.ry + 4, class: 'halo', filter: `url(#${id}glow)` }, grp);
      shape = el('ellipse', { cx: k.x, cy: k.y, rx: k.rx, ry: k.ry, class: 'cap' }, grp);
      shape.dataset.open = `url(#${id}keyc)`;
      const right = k.lp === 'right';
      el('text', { x: right ? k.x + k.rx + 5 : k.x - k.rx - 5, y: k.y + 3.5, 'text-anchor': right ? 'start' : 'end', class: 'key-label small' }, grp).textContent = k.label;
      if (k.sub) el('text', { x: k.x, y: k.y + 18, 'text-anchor': 'middle', class: 'tiny-label' }, grp).textContent = k.sub;
    }
    shape.dataset.on = `url(#${id}${k.hand})`;
    shape.setAttribute('fill', shape.dataset.open);
    if (onKeyTap) {
      const w = k.type === 'pearl' ? k.r + 10 : Math.max(k.rx, k.ry) + 8;
      el('rect', { x: k.x - w, y: k.y - (k.type === 'pearl' ? 17 : 10), width: 2 * w, height: k.type === 'pearl' ? 34 : 20, rx: 8, class: 'hit' }, grp);
      grp.addEventListener('click', () => onKeyTap(k.id));
    }
    nodes[k.id] = { grp, shape };
  }

  container.innerHTML = '';
  container.appendChild(svg);

  return {
    show(keys) {
      const set = new Set(keys || []);
      for (const [kid, n] of Object.entries(nodes)) {
        const on = set.has(kid);
        n.grp.classList.toggle('pressed', on);
        n.shape.setAttribute('fill', on ? n.shape.dataset.on : n.shape.dataset.open);
      }
      const leftKeys = KEYS.filter((k) => k.hand === 'left').map((k) => k.id);
      svg.querySelector('.hand-bracket.left').classList.toggle('dim', ![...set].some((k) => leftKeys.includes(k)));
      svg.querySelector('.hand-bracket.right').classList.toggle('dim', ![...set].some((k) => !leftKeys.includes(k)));
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
