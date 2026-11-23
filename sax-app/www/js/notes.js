// Dados das notas e digitações do SAXOFONE ALTO (Mi♭).
// As notas são escritas como na partitura de sax alto: o som real é uma sexta maior
// abaixo do escrito. Extensão escrita: Si♭3 (MIDI 58) a Fá6 (MIDI 89).
//
// Chaves usadas nas digitações:
//   Oc   chave de oitava (polegar esquerdo)
//   L1   indicador esquerdo (Si)   L2 médio esquerdo (Lá)   L3 anelar esquerdo (Sol)
//   Bis  chave do Si♭ "bis", entre o indicador e o médio esquerdos (apertada junto com o indicador)
//   Pd   chave de palma de Ré      Pe chave de palma de Mi♭      Pf chave de palma de Fá
//   Gs   mínimo esquerdo: Sol♯     Cs mínimo esquerdo: Dó♯ grave
//   Bl   mínimo esquerdo: Si grave Bb mínimo esquerdo: Si♭ grave
//   R1   indicador direito (Fá)    R2 médio direito (Mi)    R3 anelar direito (Ré)
//   Se   chave lateral de Mi agudo (mão direita)
//   Sc   chave lateral de Dó       Sb chave lateral de Si♭
//   Re   mínimo direito: Mi♭ grave Rc mínimo direito: Dó grave

export const INSTRUMENT = 'sax';
// Sax alto em Mi♭: o som real é 9 semitons abaixo da nota escrita.
export const SOUNDING_OFFSET = -9;
// Nota escrita usada para afinar: Fá♯5 escrito soa como o Lá de 440 Hz.
export const TUNING_NOTE = 78;

export const KEY_INFO = {
  Oc:  { hand: 'L', name: 'Polegar (chave de oitava)' },
  L1:  { hand: 'L', name: 'Indicador' },
  Bis: { hand: 'L', name: 'Indicador (chave bis, junto)' },
  L2:  { hand: 'L', name: 'Médio' },
  L3:  { hand: 'L', name: 'Anelar' },
  Pd:  { hand: 'L', name: 'Palma (chave de Ré agudo)' },
  Pe:  { hand: 'L', name: 'Palma (chave de Mi♭ agudo)' },
  Pf:  { hand: 'L', name: 'Palma (chave de Fá agudo)' },
  Gs:  { hand: 'L', name: 'Mínimo (Sol♯)' },
  Cs:  { hand: 'L', name: 'Mínimo (Dó♯ grave)' },
  Bl:  { hand: 'L', name: 'Mínimo (Si grave)' },
  Bb:  { hand: 'L', name: 'Mínimo (Si♭ grave)' },
  R1:  { hand: 'R', name: 'Indicador' },
  R2:  { hand: 'R', name: 'Médio' },
  R3:  { hand: 'R', name: 'Anelar' },
  Se:  { hand: 'R', name: 'Lateral (Mi agudo)' },
  Sc:  { hand: 'R', name: 'Lateral (Dó)' },
  Sb:  { hand: 'R', name: 'Lateral (Si♭)' },
  Re:  { hand: 'R', name: 'Mínimo (Mi♭ grave)' },
  Rc:  { hand: 'R', name: 'Mínimo (Dó grave)' },
};

export const KEY_ORDER = ['Oc', 'L1', 'Bis', 'L2', 'L3', 'Pd', 'Pe', 'Pf', 'Gs', 'Cs', 'Bl', 'Bb', 'R1', 'R2', 'R3', 'Se', 'Sc', 'Sb', 'Re', 'Rc'];

const NAMES = ['Dó', 'Dó♯', 'Ré', 'Ré♯', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Sol♯', 'Lá', 'Lá♯', 'Si'];
const ALT_NAMES = [null, 'Ré♭', null, 'Mi♭', null, null, 'Sol♭', null, 'Lá♭', null, 'Si♭', null];
const LETTERS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const JIANPU = ['1', '♯1', '2', '♯2', '3', '4', '♯4', '5', '♯5', '6', '♯6', '7'];
const STEP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

const LOW = ['L1', 'L2', 'L3'];
const F = {
  58: [...LOW, 'Bb', 'R1', 'R2', 'R3', 'Rc'],
  59: [...LOW, 'Bl', 'R1', 'R2', 'R3', 'Rc'],
  60: [...LOW, 'R1', 'R2', 'R3', 'Rc'],
  61: [...LOW, 'Cs', 'R1', 'R2', 'R3', 'Rc'],
  62: [...LOW, 'R1', 'R2', 'R3'],
  63: [...LOW, 'R1', 'R2', 'R3', 'Re'],
  64: [...LOW, 'R1', 'R2'],
  65: [...LOW, 'R1'],
  66: [...LOW, 'R2'],
  67: [...LOW],
  68: [...LOW, 'Gs'],
  69: ['L1', 'L2'],
  70: ['L1', 'Bis'],
  71: ['L1'],
  72: ['L2'],
  73: [],
  86: ['Oc', 'Pd'],
  87: ['Oc', 'Pd', 'Pe'],
  88: ['Oc', 'Pd', 'Pe', 'Se'],
  89: ['Oc', 'Pd', 'Pe', 'Se', 'Pf'],
};
// Oitava de cima (Ré5 a Dó♯6): mesma digitação + chave de oitava.
for (let m = 74; m <= 85; m++) F[m] = ['Oc', ...F[m - 12]];

const TIPS = {
  58: 'A nota mais grave: todos os dedos e o mínimo esquerdo no Si♭. Sopro relaxado, bastante ar, garganta aberta.',
  59: 'Mínimo esquerdo na chave de Si grave e mínimo direito no Dó.',
  60: 'Todos os dedos e o mínimo direito na chave de Dó grave.',
  61: 'Igual ao Dó grave, com o mínimo esquerdo na chave de Dó♯.',
  63: 'Mínimo direito na chave de Mi♭ (a de cima).',
  66: 'Fá♯: só o médio direito na mão direita.',
  68: 'O mínimo esquerdo aperta a chave de Sol♯.',
  70: 'Si♭ com a chave "bis": o indicador esquerdo aperta o Si e a chavinha logo abaixo ao mesmo tempo.',
  72: 'Dó médio: só o médio esquerdo.',
  73: 'Dó♯ médio: nenhuma chave apertada. Segure o sax com firmeza no polegar direito e na correia.',
  74: 'Ré agudo: igual ao Ré grave, com a chave de oitava (polegar esquerdo).',
  86: 'Ré agudo de palma: chave de oitava e a primeira chave de palma, com a base do indicador esquerdo.',
  88: 'Mi agudo: oitava, palmas de Ré e Mi♭ e a chave lateral de Mi (mão direita).',
  89: 'Fá agudo: tudo do Mi agudo mais a terceira chave de palma.',
};

export const MIN_MIDI = 58;
export const MAX_MIDI = 89;

export function register(midi) {
  if (midi <= 73) return { id: 1, name: 'grave', hint: 'Sopro relaxado e constante. Lábio inferior apoiando a palheta, sem morder.' };
  if (midi <= 85) return { id: 2, name: 'aguda', hint: 'Chave de oitava apertada. Mantenha o ar firme sem apertar a boquilha.' };
  return { id: 3, name: 'aguda (palma)', hint: 'Notas de palma: ar rápido e embocadura firme, mas sem morder.' };
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

// Frequência do SOM real da nota escrita (sax alto soa uma sexta maior abaixo).
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
  { midi: 70, keys: ['L1', 'R1'], label: 'Si♭ "1 e 1"' },
  { midi: 70, keys: ['L1', 'Sb'], label: 'Si♭ com a chave lateral' },
  { midi: 82, keys: ['Oc', 'L1', 'R1'], label: 'Si♭ "1 e 1"' },
  { midi: 82, keys: ['Oc', 'L1', 'Sb'], label: 'Si♭ com a chave lateral' },
  { midi: 72, keys: ['L1', 'Sc'], label: 'Dó com a chave lateral' },
  { midi: 84, keys: ['Oc', 'L1', 'Sc'], label: 'Dó com a chave lateral' },
];

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
