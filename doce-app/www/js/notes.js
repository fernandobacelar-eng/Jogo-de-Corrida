// Dados das notas e digitações da FLAUTA DOCE SOPRANO (digitação barroca).
// As notas são escritas como na partitura de flauta doce soprano: o som real é
// uma oitava acima do escrito. Extensão escrita: Dó4 (MIDI 60) a Dó6 (MIDI 84).
//
// Furos usados nas digitações:
//   T    polegar esquerdo fechando o furo de trás
//   Th   polegar meio aberto ("meia-tampa"): deixa uma fresta no furo de trás
//   L1   indicador esquerdo   L2 médio esquerdo   L3 anelar esquerdo
//   R1   indicador direito    R2 médio direito
//   R3   anelar direito fechando o furo duplo inteiro
//   R3h  anelar direito fechando só um dos dois furinhos (metade)
//   R4   mínimo direito fechando o furo duplo inteiro
//   R4h  mínimo direito fechando só um dos dois furinhos (metade)

export const INSTRUMENT = 'doce';
// A flauta doce soprano soa uma oitava acima da escrita.
export const SOUNDING_OFFSET = 12;

export const KEY_INFO = {
  T:   { hand: 'L', name: 'Polegar (furo de trás)' },
  Th:  { hand: 'L', name: 'Polegar meio aberto (meia-tampa)' },
  L1:  { hand: 'L', name: 'Indicador' },
  L2:  { hand: 'L', name: 'Médio' },
  L3:  { hand: 'L', name: 'Anelar' },
  R1:  { hand: 'R', name: 'Indicador' },
  R2:  { hand: 'R', name: 'Médio' },
  R3:  { hand: 'R', name: 'Anelar (furo duplo inteiro)' },
  R3h: { hand: 'R', name: 'Anelar (metade do furo duplo)' },
  R4:  { hand: 'R', name: 'Mínimo (furo duplo inteiro)' },
  R4h: { hand: 'R', name: 'Mínimo (metade do furo duplo)' },
};

export const KEY_ORDER = ['T', 'Th', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'R3h', 'R4', 'R4h'];

const NAMES = ['Dó', 'Dó♯', 'Ré', 'Ré♯', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Sol♯', 'Lá', 'Lá♯', 'Si'];
const ALT_NAMES = [null, 'Ré♭', null, 'Mi♭', null, null, 'Sol♭', null, 'Lá♭', null, 'Si♭', null];
const LETTERS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const JIANPU = ['1', '♯1', '2', '♯2', '3', '4', '♯4', '5', '♯5', '6', '♯6', '7'];
const STEP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

// Digitações barrocas (soprano), por MIDI escrito.
const F = {
  60: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'R4'],
  61: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'R4h'],
  62: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3'],
  63: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3h'],
  64: ['T', 'L1', 'L2', 'L3', 'R1', 'R2'],
  65: ['T', 'L1', 'L2', 'L3', 'R1', 'R3', 'R4'],
  66: ['T', 'L1', 'L2', 'L3', 'R2', 'R3'],
  67: ['T', 'L1', 'L2', 'L3'],
  68: ['T', 'L1', 'L2', 'R1', 'R2', 'R3'],
  69: ['T', 'L1', 'L2'],
  70: ['T', 'L1', 'L3', 'R1'],
  71: ['T', 'L1'],
  72: ['T', 'L2'],
  73: ['L1', 'L2'],
  74: ['L2'],
  75: ['L2', 'L3', 'R1', 'R2', 'R3'],
  76: ['Th', 'L1', 'L2', 'L3', 'R1', 'R2'],
  77: ['Th', 'L1', 'L2', 'L3', 'R1', 'R3'],
  78: ['Th', 'L1', 'L2', 'L3', 'R2'],
  79: ['Th', 'L1', 'L2', 'L3'],
  80: ['Th', 'L1', 'L2', 'R1'],
  81: ['Th', 'L1', 'L2'],
  82: ['Th', 'L1', 'L2', 'R1', 'R2', 'R3'],
  83: ['Th', 'L1', 'L2', 'R1', 'R2'],
  84: ['Th', 'L1', 'L3', 'R1', 'R2'],
};

const TIPS = {
  60: 'A nota mais grave: todos os furos fechados. Sopro bem suave e lento. Se chiar, algum furo não está vedando.',
  61: 'O mínimo direito fecha só um dos dois furinhos do furo duplo.',
  63: 'O anelar direito fecha só um dos dois furinhos do furo duplo.',
  65: 'Fá barroco "de forquilha": o médio direito fica levantado, com anelar e mínimo fechados.',
  66: 'O indicador direito fica levantado; médio e anelar fecham.',
  68: 'O anelar esquerdo levanta, e a mão direita fecha indicador, médio e anelar.',
  70: 'Repare: o médio esquerdo fica levantado (forquilha).',
  72: 'Polegar e médio esquerdo. O indicador fica levantado.',
  73: 'O polegar sai do furo de trás: só indicador e médio esquerdos.',
  74: 'Só o médio esquerdo, sem o polegar. A flauta fica apoiada nos lábios e no polegar direito.',
  75: 'Sem o polegar: médio e anelar esquerdos, mais indicador, médio e anelar direitos.',
  76: 'Primeira nota com meia-tampa: dobre a ponta do polegar para deixar uma pequena fresta no furo de trás.',
  84: 'Nota aguda: meia-tampa bem pequena e sopro firme. Confirme esta digitação na tabela da sua flauta.',
};

export const MIN_MIDI = 60;
export const MAX_MIDI = 84;

export function register(midi) {
  if (midi <= 75) return { id: 1, name: 'grave', hint: 'Sopro suave, como se dissesse "du" baixinho.' };
  return { id: 2, name: 'aguda', hint: 'Polegar em meia-tampa e sopro um pouco mais firme. Não force.' };
}

export function noteInfo(midi) {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const jOct = octave - 4;
  return {
    midi,
    pc,
    octave,
    name: NAMES[pc],
    altName: ALT_NAMES[pc],
    letter: LETTERS[pc] + octave,
    jianpu: JIANPU[pc],
    jianpuDots: jOct,
    step: STEP[pc] + octave * 7,
    sharp: NAMES[pc].includes('♯'),
    fingering: F[midi] || null,
    tip: TIPS[midi] || '',
    register: register(midi),
  };
}

export function fullName(midi) {
  const n = noteInfo(midi);
  return `${n.name}${n.octave}`;
}

export function allNotes() {
  const list = [];
  for (let m = MIN_MIDI; m <= MAX_MIDI; m++) list.push(noteInfo(m));
  return list;
}

// Frequência do SOM real da nota escrita (soprano soa uma oitava acima).
export function midiToFreq(midi, a4 = 440) {
  return a4 * Math.pow(2, (midi + SOUNDING_OFFSET - 69) / 12);
}

// Nota escrita (fracionária) a partir da frequência ouvida.
export function freqToMidiFloat(freq, a4 = 440) {
  return 69 + 12 * Math.log2(freq / a4) - SOUNDING_OFFSET;
}

export function describeFingering(keys) {
  const left = [];
  const right = [];
  for (const k of KEY_ORDER) {
    if (!keys.includes(k)) continue;
    (KEY_INFO[k].hand === 'L' ? left : right).push(KEY_INFO[k].name);
  }
  return { left, right };
}

// Digitações alternativas aceitas na busca por digitação.
export const ALT_FINGERINGS = [
  { midi: 68, keys: ['T', 'L1', 'L2', 'R1', 'R2', 'R3', 'R4h'], label: 'com metade do furo do mínimo' },
  { midi: 65, keys: ['T', 'L1', 'L2', 'L3', 'R1'], label: 'Fá "germânico" (só funciona em flauta germânica)' },
];

// Procura notas pela digitação. Retorna { exact: [...], near: [...] }.
export function findByFingering(keys) {
  const sel = new Set(keys);
  const candidates = [];
  for (let m = MIN_MIDI; m <= MAX_MIDI; m++) candidates.push({ midi: m, keys: noteInfo(m).fingering, label: '' });
  candidates.push(...ALT_FINGERINGS);
  const results = candidates.map((c) => {
    const ref = new Set(c.keys);
    const missing = [...ref].filter((k) => !sel.has(k));
    const extra = [...sel].filter((k) => !ref.has(k));
    return { ...c, missing, extra, diff: missing.length + extra.length };
  });
  const exact = [];
  for (const r of results) if (r.diff === 0 && !exact.some((e) => e.midi === r.midi)) exact.push(r);
  const exactMidis = new Set(exact.map((r) => r.midi));
  const near = results
    .filter((r) => r.diff > 0 && r.diff <= 2 && !exactMidis.has(r.midi))
    .sort((a, b) => a.diff - b.diff || a.midi - b.midi);
  const nearUnique = [];
  const seen = new Set();
  for (const r of near) if (!seen.has(r.midi)) { seen.add(r.midi); nearUnique.push(r); }
  return { exact: exact.sort((a, b) => a.midi - b.midi), near: nearUnique.slice(0, 4) };
}
