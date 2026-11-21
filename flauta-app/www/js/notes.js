// Dados das notas e digitações da flauta transversal (sistema Boehm, pé em Dó).
// Extensão: Dó4 (MIDI 60) até Dó7 (MIDI 96).
//
// Chaves usadas nas digitações:
//   T   polegar esquerdo na tecla de Si (○ na tabela)
//   Tb  polegar esquerdo na alavanca de Si♭ (⊙ na tabela)
//   L1  indicador esquerdo   L2 médio esquerdo   L3 anelar esquerdo
//   Gs  mindinho esquerdo na tecla de Sol♯ (número 7 na tabela)
//   R1  indicador direito    R2 médio direito    R3 anelar direito
//   Tr1 tecla de trinado de Ré    Tr2 tecla de trinado de Ré♯
//   Eb  mindinho direito na tecla de Mi♭/Ré♯ (número 3 na tabela)
//   Cs  mindinho direito na tecla de Dó♯ grave (número 2)
//   C   mindinho direito na tecla de Dó grave (número 1)

export const KEY_INFO = {
  T:   { hand: 'L', name: 'Polegar (tecla de Si)' },
  Tb:  { hand: 'L', name: 'Polegar (alavanca de Si♭)' },
  L1:  { hand: 'L', name: 'Indicador' },
  L2:  { hand: 'L', name: 'Médio' },
  L3:  { hand: 'L', name: 'Anelar' },
  Gs:  { hand: 'L', name: 'Mindinho (tecla de Sol♯)' },
  R1:  { hand: 'R', name: 'Indicador' },
  R2:  { hand: 'R', name: 'Médio' },
  R3:  { hand: 'R', name: 'Anelar' },
  Tr1: { hand: 'R', name: 'Trinado de Ré' },
  Tr2: { hand: 'R', name: 'Anelar (tecla de trinado de Ré♯)' },
  Eb:  { hand: 'R', name: 'Mindinho (tecla de Mi♭)' },
  Cs:  { hand: 'R', name: 'Mindinho (tecla de Dó♯)' },
  C:   { hand: 'R', name: 'Mindinho (tecla de Dó)' },
};

// Ordem em que as chaves aparecem na descrição em texto.
export const KEY_ORDER = ['T', 'Tb', 'L1', 'L2', 'L3', 'Gs', 'R1', 'R2', 'R3', 'Tr1', 'Tr2', 'Eb', 'Cs', 'C'];

const NAMES = ['Dó', 'Dó♯', 'Ré', 'Ré♯', 'Mi', 'Fá', 'Fá♯', 'Sol', 'Sol♯', 'Lá', 'Lá♯', 'Si'];
const ALT_NAMES = [null, 'Ré♭', null, 'Mi♭', null, null, 'Sol♭', null, 'Lá♭', null, 'Si♭', null];
const LETTERS = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
// Notação numérica (jianpu): 1=Dó ... 7=Si
const JIANPU = ['1', '♯1', '2', '♯2', '3', '4', '♯4', '5', '♯5', '6', '♯6', '7'];
// Posição na pauta (degrau diatônico dentro da oitava) e se leva sustenido.
const STEP = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6];

// Digitações padrão por número MIDI.
const F = {
  60: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'Cs', 'C'],
  61: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'Cs'],
  62: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3'],
  63: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'Eb'],
  64: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'Eb'],
  65: ['T', 'L1', 'L2', 'L3', 'R1', 'Eb'],
  66: ['T', 'L1', 'L2', 'L3', 'R3', 'Eb'],
  67: ['T', 'L1', 'L2', 'L3', 'Eb'],
  68: ['T', 'L1', 'L2', 'L3', 'Gs', 'Eb'],
  69: ['T', 'L1', 'L2', 'Eb'],
  70: ['Tb', 'L1', 'Eb'],
  71: ['T', 'L1', 'Eb'],
  72: ['L1', 'Eb'],
  73: ['Eb'],
  74: ['T', 'L2', 'L3', 'R1', 'R2', 'R3'],
  75: ['T', 'L2', 'L3', 'R1', 'R2', 'R3', 'Eb'],
  86: ['T', 'L2', 'L3', 'Eb'],
  87: ['T', 'L1', 'L2', 'L3', 'Gs', 'R1', 'R2', 'R3', 'Eb'],
  88: ['T', 'L1', 'L2', 'R1', 'R2', 'Eb'],
  89: ['T', 'L1', 'L3', 'R1', 'Eb'],
  90: ['T', 'L1', 'L3', 'R3', 'Eb'],
  91: ['L1', 'L2', 'L3', 'Eb'],
  92: ['L2', 'L3', 'Gs', 'Eb'],
  93: ['T', 'L2', 'R1', 'Eb'],
  94: ['T', 'L1', 'R1', 'Eb'],
  95: ['T', 'L1', 'L3', 'Tr2', 'C'],
  96: ['L1', 'L2', 'L3', 'Gs', 'R1'],
};
// Segunda oitava, de Mi5 a Dó♯6: mesma digitação da primeira oitava,
// muda apenas o sopro.
for (let m = 76; m <= 85; m++) F[m] = F[m - 12];

// Observações específicas por nota.
const TIPS = {
  60: 'A nota mais grave. Sopro lento e relaxado, lábios mais abertos. Todas as teclas fechadas precisam vedar bem.',
  62: 'O mindinho direito fica livre só nesta nota (e no Ré médio).',
  70: 'Alternativa: polegar na tecla de Si normal + indicador esquerdo + indicador direito ("1 e 1").',
  72: 'O polegar sai da flauta. Segure-a com o queixo, a base do indicador esquerdo e o polegar direito.',
  73: 'Quase todas as teclas abertas: o som tende a ficar fraco. Firme o apoio.',
  74: 'Igual ao Ré grave, mas com o indicador esquerdo LEVANTADO. Esse "furo de registro" ajuda a nota a sair na oitava de cima.',
  75: 'Igual ao Ré♯ grave, com o indicador esquerdo levantado.',
  84: 'Mesma digitação do Dó médio, com sopro mais rápido.',
  85: 'Mesma digitação do Dó♯ médio, com sopro mais rápido.',
  95: 'O anelar direito aperta a tecla de trinado de Ré♯ (a segunda tecla pequena, acima do corpo).',
  96: 'O polegar sai da flauta. Sopro bem rápido e concentrado.',
};

export const MIN_MIDI = 60;
export const MAX_MIDI = 96;

export function register(midi) {
  if (midi <= 73) return { id: 1, name: 'grave', hint: 'Sopro suave e lento, lábios relaxados.' };
  if (midi <= 85) return { id: 2, name: 'média', hint: 'Sopro mais rápido, abertura dos lábios menor.' };
  return { id: 3, name: 'aguda', hint: 'Sopro rápido e concentrado, abertura bem pequena. Não force: direcione o ar.' };
}

export function noteInfo(midi) {
  const pc = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const jOct = octave - 4; // 0 = sem ponto, 1 = um ponto, 2 = dois pontos...
  return {
    midi,
    pc,
    octave,
    name: NAMES[pc],
    altName: ALT_NAMES[pc],
    letter: LETTERS[pc] + octave,
    jianpu: JIANPU[pc],
    jianpuDots: jOct,
    step: STEP[pc] + octave * 7, // degrau diatônico absoluto
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

export function midiToFreq(midi, a4 = 440) {
  return a4 * Math.pow(2, (midi - 69) / 12);
}

export function freqToMidiFloat(freq, a4 = 440) {
  return 69 + 12 * Math.log2(freq / a4);
}

// Descrição em texto da digitação, agrupada por mão.
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
  { midi: 70, keys: ['T', 'L1', 'R1', 'Eb'], label: 'digitação "1 e 1"' },
  { midi: 82, keys: ['T', 'L1', 'R1', 'Eb'], label: 'digitação "1 e 1"' },
  { midi: 70, keys: ['Tb', 'L1', 'R1', 'Eb'], label: 'alavanca de Si♭ + "1 e 1"' },
  { midi: 62, keys: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'Eb'], label: 'com a tecla de Mi♭' },
  { midi: 60, keys: ['T', 'L1', 'L2', 'L3', 'R1', 'R2', 'R3', 'C'], label: 'só a tecla de Dó' },
];

// Normaliza: a tecla de Dó grave fecha também a de Dó♯ pelo mecanismo.
function normalize(keys) {
  const s = new Set(keys);
  if (s.has('C')) s.add('Cs');
  return s;
}

// Procura notas pela digitação. Retorna { exact: [...], near: [...] }.
// Cada item: { midi, keys, label, missing: [chaves a apertar], extra: [chaves a soltar] }.
export function findByFingering(keys) {
  const sel = normalize(keys);
  const candidates = [];
  for (let m = MIN_MIDI; m <= MAX_MIDI; m++) candidates.push({ midi: m, keys: noteInfo(m).fingering, label: '' });
  candidates.push(...ALT_FINGERINGS);
  const seen = new Set();
  const results = [];
  for (const c of candidates) {
    const ref = normalize(c.keys);
    const missing = [...ref].filter((k) => !sel.has(k));
    const extra = [...sel].filter((k) => !ref.has(k));
    const key = c.midi + ':' + c.label;
    if (seen.has(key)) continue;
    seen.add(key);
    results.push({ ...c, missing, extra, diff: missing.length + extra.length });
  }
  const exact = [];
  for (const r of results) if (r.diff === 0 && !exact.some((e) => e.midi === r.midi)) exact.push(r);
  // evita repetir a mesma nota (digitação principal e alternativa)
  const exactMidis = new Set(exact.map((r) => r.midi));
  const near = results
    .filter((r) => r.diff > 0 && r.diff <= 2 && !exactMidis.has(r.midi))
    .sort((a, b) => a.diff - b.diff || a.midi - b.midi);
  const nearUnique = [];
  const nearSeen = new Set();
  for (const r of near) if (!nearSeen.has(r.midi)) { nearSeen.add(r.midi); nearUnique.push(r); }
  return { exact: exact.sort((a, b) => a.midi - b.midi), near: nearUnique.slice(0, 4) };
}
