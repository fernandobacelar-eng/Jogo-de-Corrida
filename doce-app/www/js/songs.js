// Músicas de domínio público para tocar com a partitura.
// Cada nota: [midi, duração em tempos]. midi 0 = pausa.
// Nomes: G4=67 A4=69 B4=71 C5=72 D5=74 E5=76 F5=77 F#5=78 G5=79 A5=81.

const G4 = 67, A4 = 69, B4 = 71, C5 = 72, D5 = 74, E5 = 76, F5 = 77, Fs5 = 78, G5 = 79;
const D4 = 62, E4 = 64, Fs4 = 66, Gs4 = 68;

export const SONGS = [
  {
    id: 'brilha',
    title: 'Brilha, brilha, estrelinha',
    level: 'Iniciante',
    bpm: 84,
    beats: 4,
    notes: [
      [G4, 1], [G4, 1], [D5, 1], [D5, 1], [E5, 1], [E5, 1], [D5, 2],
      [C5, 1], [C5, 1], [B4, 1], [B4, 1], [A4, 1], [A4, 1], [G4, 2],
      [D5, 1], [D5, 1], [C5, 1], [C5, 1], [B4, 1], [B4, 1], [A4, 2],
      [D5, 1], [D5, 1], [C5, 1], [C5, 1], [B4, 1], [B4, 1], [A4, 2],
      [G4, 1], [G4, 1], [D5, 1], [D5, 1], [E5, 1], [E5, 1], [D5, 2],
      [C5, 1], [C5, 1], [B4, 1], [B4, 1], [A4, 1], [A4, 1], [G4, 2],
    ],
  },
  {
    id: 'carneirinho',
    title: 'Maria tinha um carneirinho',
    level: 'Iniciante',
    bpm: 96,
    beats: 4,
    notes: [
      [B4, 1], [A4, 1], [G4, 1], [A4, 1], [B4, 1], [B4, 1], [B4, 2],
      [A4, 1], [A4, 1], [A4, 2], [B4, 1], [D5, 1], [D5, 2],
      [B4, 1], [A4, 1], [G4, 1], [A4, 1], [B4, 1], [B4, 1], [B4, 1], [B4, 1],
      [A4, 1], [A4, 1], [B4, 1], [A4, 1], [G4, 4],
    ],
  },
  {
    id: 'frei',
    title: 'Frei Martinho (Frère Jacques)',
    level: 'Iniciante',
    bpm: 100,
    beats: 4,
    notes: [
      [G4, 1], [A4, 1], [B4, 1], [G4, 1], [G4, 1], [A4, 1], [B4, 1], [G4, 1],
      [B4, 1], [C5, 1], [D5, 2], [B4, 1], [C5, 1], [D5, 2],
      [D5, 0.5], [E5, 0.5], [D5, 0.5], [C5, 0.5], [B4, 1], [G4, 1],
      [D5, 0.5], [E5, 0.5], [D5, 0.5], [C5, 0.5], [B4, 1], [G4, 1],
      [G4, 1], [D4, 1], [G4, 2], [G4, 1], [D4, 1], [G4, 2],
    ],
  },
  {
    id: 'ode',
    title: 'Ode à Alegria (Beethoven)',
    level: 'Iniciante',
    bpm: 100,
    beats: 4,
    notes: [
      [B4, 1], [B4, 1], [C5, 1], [D5, 1], [D5, 1], [C5, 1], [B4, 1], [A4, 1],
      [G4, 1], [G4, 1], [A4, 1], [B4, 1], [B4, 1.5], [A4, 0.5], [A4, 2],
      [B4, 1], [B4, 1], [C5, 1], [D5, 1], [D5, 1], [C5, 1], [B4, 1], [A4, 1],
      [G4, 1], [G4, 1], [A4, 1], [B4, 1], [A4, 1.5], [G4, 0.5], [G4, 2],
    ],
  },
  {
    id: 'parabens',
    title: 'Parabéns pra você',
    level: 'Intermediário',
    bpm: 96,
    beats: 3,
    pickup: 1, // anacruse: começa no 3º tempo
    notes: [
      [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [C5, 1], [B4, 2],
      [G4, 0.75], [G4, 0.25], [A4, 1], [G4, 1], [D5, 1], [C5, 2],
      [G4, 0.75], [G4, 0.25], [G5, 1], [E5, 1], [C5, 1], [B4, 1], [A4, 2],
      [F5, 0.75], [F5, 0.25], [E5, 1], [C5, 1], [D5, 1], [C5, 2],
    ],
  },
  {
    id: 'jingle',
    title: 'Jingle Bells (refrão)',
    level: 'Intermediário',
    bpm: 112,
    beats: 4,
    notes: [
      [B4, 1], [B4, 1], [B4, 2], [B4, 1], [B4, 1], [B4, 2],
      [B4, 1], [D5, 1], [G4, 1.5], [A4, 0.5], [B4, 4],
      [C5, 1], [C5, 1], [C5, 1.5], [C5, 0.5], [C5, 1], [B4, 1], [B4, 1], [B4, 0.5], [B4, 0.5],
      [B4, 1], [A4, 1], [A4, 1], [B4, 1], [A4, 2], [D5, 2],
      [B4, 1], [B4, 1], [B4, 2], [B4, 1], [B4, 1], [B4, 2],
      [B4, 1], [D5, 1], [G4, 1.5], [A4, 0.5], [B4, 4],
      [C5, 1], [C5, 1], [C5, 1.5], [C5, 0.5], [C5, 1], [B4, 1], [B4, 1], [B4, 0.5], [B4, 0.5],
      [D5, 1], [D5, 1], [C5, 1], [A4, 1], [G4, 4],
    ],
  },
  {
    id: 'greensleeves',
    title: 'Greensleeves',
    level: 'Avançado',
    bpm: 132,
    beats: 3,
    pickup: 1,
    notes: [
      [A4, 1], [C5, 2], [D5, 1], [E5, 1.5], [Fs5, 0.5], [E5, 1], [D5, 2], [B4, 1],
      [G4, 1.5], [A4, 0.5], [B4, 1], [C5, 2], [A4, 1], [A4, 1.5], [Gs4, 0.5], [A4, 1], [B4, 2], [Gs4, 1],
      [E4, 2], [A4, 1], [C5, 2], [D5, 1], [E5, 1.5], [Fs5, 0.5], [E5, 1], [D5, 2], [B4, 1],
      [G4, 1.5], [A4, 0.5], [B4, 1], [C5, 1.5], [B4, 0.5], [A4, 1], [Gs4, 1.5], [Fs4, 0.5], [Gs4, 1], [A4, 3],
    ],
  },
];

export function songLength(song) {
  return song.notes.reduce((s, n) => s + n[1], 0);
}
