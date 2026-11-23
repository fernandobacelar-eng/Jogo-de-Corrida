// Desenho da FLAUTA DOCE (SVG) com os furos tampados destacados, e da nota na pauta.
// Vista de frente, com o bico à esquerda. O furo do polegar (atrás) aparece abaixo do corpo.
// Estados de um furo: aberto, fechado (cor da mão) ou meio fechado (metade colorida).

const SVGNS = 'http://www.w3.org/2000/svg';
let uid = 0;

const CY = 76; // linha central do corpo

// Grupos de furos. Os furos duplos (R3, R4) têm dois furinhos.
const HOLES = [
  { id: 'T', hand: 'left', holes: [{ x: 168, y: 128, r: 11 }], label: 'Polegar', sub: '(atrás)', back: true },
  { id: 'L1', hand: 'left', holes: [{ x: 196, y: CY, r: 10.5 }], label: 'Ind.', finger: '1' },
  { id: 'L2', hand: 'left', holes: [{ x: 240, y: CY, r: 10.5 }], label: 'Méd.', finger: '2' },
  { id: 'L3', hand: 'left', holes: [{ x: 284, y: CY, r: 10.5 }], label: 'Anel.', finger: '3' },
  { id: 'R1', hand: 'right', holes: [{ x: 350, y: CY, r: 10.5 }], label: 'Ind.', finger: '1' },
  { id: 'R2', hand: 'right', holes: [{ x: 394, y: CY, r: 10.5 }], label: 'Méd.', finger: '2' },
  { id: 'R3', hand: 'right', holes: [{ x: 431, y: CY, r: 6.5 }, { x: 448, y: CY, r: 5 }], label: 'Anel.' },
  { id: 'R4', hand: 'right', holes: [{ x: 478, y: CY + 1, r: 5.5 }, { x: 493, y: CY + 1, r: 4.5 }], label: 'Mín.' },
];

function el(name, attrs = {}, parent) {
  const e = document.createElementNS(SVGNS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (parent) parent.appendChild(e);
  return e;
}

export function createFlute(container, { onKeyTap } = {}) {
  const id = 'rc' + (++uid);
  const W = 560, H = 160;
  const svg = el('svg', { viewBox: `0 0 ${W} ${H}`, class: 'flute-svg recorder' + (onKeyTap ? ' interactive' : ''), role: 'img', 'aria-label': 'Desenho da flauta doce com os furos' });
  const defs = el('defs', {}, svg);
  const body = el('linearGradient', { id: id + 'body', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [['0%', '#b89a66'], ['22%', '#f7ecd2'], ['45%', '#efe0bd'], ['100%', '#a8875a']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, body));
  const joint = el('linearGradient', { id: id + 'joint', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  [['0%', '#5a3a1e'], ['35%', '#a0703f'], ['100%', '#3e2612']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, joint));
  for (const hand of ['left', 'right']) {
    const g = el('radialGradient', { id: `${id}${hand}`, cx: '38%', cy: '30%', r: '80%' }, defs);
    el('stop', { offset: '0%', style: `stop-color: var(--${hand}-hi)` }, g);
    el('stop', { offset: '100%', style: `stop-color: var(--${hand})` }, g);
  }
  const glow = el('filter', { id: id + 'glow', x: '-60%', y: '-60%', width: '220%', height: '220%' }, defs);
  el('feGaussianBlur', { in: 'SourceGraphic', stdDeviation: 3 }, glow);
  const shadow = el('filter', { id: id + 'sh', x: '-10%', y: '-30%', width: '120%', height: '180%' }, defs);
  el('feDropShadow', { dx: 0, dy: 3, stdDeviation: 3, 'flood-opacity': 0.3 }, shadow);

  // Rótulos das mãos
  const lh = el('g', { class: 'hand-bracket left' }, svg);
  el('path', { d: 'M176 24 h128', class: 'bracket-line' }, lh);
  el('text', { x: 240, y: 18, 'text-anchor': 'middle', class: 'hand-label' }, lh).textContent = 'MÃO ESQUERDA';
  const rh = el('g', { class: 'hand-bracket right' }, svg);
  el('path', { d: 'M332 24 h170', class: 'bracket-line' }, rh);
  el('text', { x: 417, y: 18, 'text-anchor': 'middle', class: 'hand-label' }, rh).textContent = 'MÃO DIREITA';

  // Corpo: bico, cabeça, corpo levemente cônico e pé
  const g = el('g', { filter: `url(#${id}sh)` }, svg);
  el('path', { d: `M8 ${CY - 10} q0 -6 8 -7 l62 -5 v38 l-62 -5 q-8 -1 -8 -7 z`, fill: `url(#${id}body)`, class: 'rc-edge' }, g); // bico
  el('rect', { x: 76, y: CY - 18, width: 70, height: 36, rx: 8, fill: `url(#${id}body)`, class: 'rc-edge' }, g); // cabeça
  el('rect', { x: 140, y: CY - 20, width: 12, height: 40, rx: 4, fill: `url(#${id}joint)` }, g); // anel
  el('path', { d: `M150 ${CY - 16} L512 ${CY - 13} L512 ${CY + 13} L150 ${CY + 16} z`, fill: `url(#${id}body)`, class: 'rc-edge' }, g); // corpo
  el('rect', { x: 508, y: CY - 17, width: 12, height: 34, rx: 4, fill: `url(#${id}joint)` }, g); // anel do pé
  el('path', { d: `M518 ${CY - 14} q22 -4 34 -10 v48 q-12 -6 -34 -10 z`, fill: `url(#${id}body)`, class: 'rc-edge' }, g); // pé (campana)
  // janela (embocadura) e lábio
  el('rect', { x: 92, y: CY - 7, width: 16, height: 12, rx: 2, fill: '#2a1a0b' }, svg);
  el('path', { d: `M92 ${CY + 5} h16 l-3 -4 h-10 z`, fill: '#d9c49b' }, svg);
  el('ellipse', { cx: 22, cy: CY, rx: 3, ry: 9, fill: '#2a1a0b', opacity: 0.55 }, svg); // canal de ar

  const nodes = {};
  for (const h of HOLES) {
    const grp = el('g', { class: `key ${h.hand}${h.back ? ' back' : ''}`, 'data-key': h.id }, svg);
    const fills = [];
    h.holes.forEach((p, idx) => {
      el('circle', { cx: p.x, cy: p.y, r: p.r + 5, class: 'halo', filter: `url(#${id}glow)` }, grp);
      el('circle', { cx: p.x, cy: p.y, r: p.r + 1.6, class: 'rc-rim' }, grp);
      el('circle', { cx: p.x, cy: p.y, r: p.r, class: 'rc-hole' + (h.back ? ' back' : '') }, grp);
      // preenchimento inteiro e metade (para meia-tampa / metade do furo duplo)
      const full = el('circle', { cx: p.x, cy: p.y, r: p.r, fill: `url(#${id}${h.hand})`, class: 'rc-fill' }, grp);
      const clipId = `${id}${h.id}c${idx}`;
      const cp = el('clipPath', { id: clipId }, defs);
      el('rect', { x: p.x - p.r - 1, y: p.y - p.r - 1, width: p.r + 1, height: 2 * p.r + 2 }, cp);
      const half = el('circle', { cx: p.x, cy: p.y, r: p.r, fill: `url(#${id}${h.hand})`, class: 'rc-fill', 'clip-path': `url(#${clipId})` }, grp);
      fills.push({ full, half });
    });
    const p0 = h.holes[0];
    if (h.finger) el('text', { x: p0.x, y: p0.y + 4.5, 'text-anchor': 'middle', class: 'finger-num' }, grp).textContent = h.finger;
    const lx = h.holes.length > 1 ? (h.holes[0].x + h.holes[1].x) / 2 : p0.x;
    if (h.back) {
      el('text', { x: p0.x + 18, y: p0.y + 4, class: 'key-label' }, grp).textContent = h.label;
      el('text', { x: p0.x + 18, y: p0.y + 17, class: 'tiny-label' }, grp).textContent = h.sub;
    } else {
      el('text', { x: lx, y: CY - 22, 'text-anchor': 'middle', class: 'key-label' }, grp).textContent = h.label;
    }
    if (onKeyTap) {
      const minX = Math.min(...h.holes.map((p) => p.x - p.r)), maxX = Math.max(...h.holes.map((p) => p.x + p.r));
      el('rect', { x: minX - 8, y: p0.y - 18, width: maxX - minX + 16, height: 36, rx: 10, class: 'hit' }, grp);
      grp.addEventListener('click', () => onKeyTap(h.id));
    }
    nodes[h.id] = { grp, fills, double: h.holes.length > 1 };
  }

  container.innerHTML = '';
  container.appendChild(svg);

  return {
    show(keys) {
      const set = new Set(keys || []);
      const state = {
        T: set.has('T') ? 'full' : set.has('Th') ? 'half' : 'off',
        R3: set.has('R3') ? 'full' : set.has('R3h') ? 'half' : 'off',
        R4: set.has('R4') ? 'full' : set.has('R4h') ? 'half' : 'off',
      };
      for (const [kid, n] of Object.entries(nodes)) {
        const st = state[kid] || (set.has(kid) ? 'full' : 'off');
        n.grp.classList.toggle('pressed', st !== 'off');
        n.grp.classList.toggle('halfway', st === 'half');
        n.fills.forEach((f, i) => {
          let showFull = st === 'full';
          let showHalf = false;
          if (st === 'half') {
            if (n.double) showFull = i === 0; // metade do furo duplo: só o furinho maior
            else showHalf = true; // meia-tampa do polegar
          }
          f.full.style.opacity = showFull ? 1 : 0;
          f.half.style.opacity = showHalf ? 1 : 0;
        });
      }
      const left = ['T', 'Th', 'L1', 'L2', 'L3'];
      svg.querySelector('.hand-bracket.left').classList.toggle('dim', ![...set].some((k) => left.includes(k)));
      svg.querySelector('.hand-bracket.right').classList.toggle('dim', ![...set].some((k) => !left.includes(k)));
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
