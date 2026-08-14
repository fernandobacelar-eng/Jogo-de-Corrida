import * as THREE from 'three';

// Traçado inspirado no Circuito de Monte Carlo (Mônaco), com os nomes das
// curvas reais como referência. Coordenadas em metros (x, altura, z),
// formando um laço fechado. Não é uma cópia GPS exata, mas preserva a
// personalidade do circuito: reta dos boxes, Sainte Dévote, subida de Beau
// Rivage, Casino Square, a lentíssima curva do Fairmont Hairpin, o túnel,
// a chicane, a Piscina e a Rascasse.

const RAW_POINTS = [
  { p: [0, 0, 0], name: 'Reta dos Boxes' },
  { p: [100, 0, 0], name: 'Reta dos Boxes' },
  { p: [190, 1, 0], name: 'Aproximação Sainte Dévote' },
  { p: [225, 3, -12], name: 'Sainte Dévote' },
  { p: [245, 8, -35], name: 'Saída Sainte Dévote' },
  { p: [255, 16, -65], name: 'Subida Beau Rivage' },
  { p: [258, 24, -95], name: 'Beau Rivage' },
  { p: [250, 30, -122], name: 'Aproximação Massenet' },
  { p: [225, 34, -142], name: 'Massenet' },
  { p: [195, 36, -152], name: 'Aproximação Casino' },
  { p: [165, 35, -150], name: 'Casino Square' },
  { p: [150, 30, -132], name: 'Mirabeau' },
  { p: [160, 22, -108], name: 'Entrada Fairmont' },
  { p: [150, 16, -92], name: 'Fairmont Hairpin' },
  { p: [128, 14, -100], name: 'Saída Fairmont' },
  { p: [118, 10, -122], name: 'Portier' },
  { p: [135, 4, -148], name: 'Entrada do Túnel' },
  { p: [110, 0, -166], name: 'Túnel' },
  { p: [70, -1, -172], name: 'Saída do Túnel' },
  { p: [35, -1, -160], name: 'Nouvelle Chicane' },
  { p: [25, -1, -140], name: 'Chicane' },
  { p: [10, 0, -115], name: 'Tabac' },
  { p: [5, 1, -85], name: 'Piscina' },
  { p: [25, 1, -60], name: 'Piscina (esse)' },
  { p: [10, 1, -40], name: 'Aproximação Rascasse' },
  { p: [40, 0, -22], name: 'La Rascasse' },
  { p: [15, 0, -8], name: 'Anthony Noghes' },
];

// Largura da pista (m) em cada ponto de controle — mais estreita em trechos
// técnicos (hairpins, chicane) e mais larga nas retas.
const RAW_WIDTHS = [
  13, 13, 12, 9, 10, 11, 12, 11, 10, 10, 10, 9, 8, 7.5, 8, 9, 10, 12, 12, 9,
  8.5, 9, 10, 9, 9, 7.5, 10,
];

export const CORNER_NAMES = RAW_POINTS.map((r) => r.name);

export function buildTrack() {
  const points = RAW_POINTS.map((r) => new THREE.Vector3(r.p[0], r.p[1], r.p[2]));
  const curve = new THREE.CatmullRomCurve3(points, true, 'centripetal');
  curve.arcLengthDivisions = 4000;

  const totalLength = curve.getLength();
  const n = RAW_WIDTHS.length;

  function widthAt(t) {
    const tt = ((t % 1) + 1) % 1;
    const scaled = tt * n;
    const i0 = Math.floor(scaled) % n;
    const i1 = (i0 + 1) % n;
    const frac = scaled - Math.floor(scaled);
    return RAW_WIDTHS[i0] * (1 - frac) + RAW_WIDTHS[i1] * frac;
  }

  function frameAt(t) {
    const tt = ((t % 1) + 1) % 1;
    const position = curve.getPointAt(tt);
    const tangent = curve.getTangentAt(tt).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tangent, up).normalize();
    return { position, tangent, right, up };
  }

  return { curve, points, totalLength, widthAt, frameAt };
}
