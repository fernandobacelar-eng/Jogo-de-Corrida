// Lições em sequência. Cada lição é uma lista de notas (MIDI) a tocar em ordem.

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const naturals = (a, b) => range(a, b).filter((m) => ![1, 3, 6, 8, 10].includes(m % 12));

export const LESSONS = [
  {
    id: 'si-la-sol',
    title: 'Primeiras notas: Si, Lá e Sol',
    level: 'Iniciante',
    intro: 'Só a mão esquerda. O mindinho direito fica na tecla de Mi♭ o tempo todo. Comece com sopro suave.',
    notes: [71, 71, 69, 69, 67, 67, 71, 69, 67, 69, 71],
  },
  {
    id: 'do-re-medios',
    title: 'Dó e Ré médios',
    level: 'Iniciante',
    intro: 'No Dó, o polegar sai da flauta. No Ré médio, todos os dedos descem, menos o indicador esquerdo.',
    notes: [71, 72, 71, 72, 74, 72, 74, 71, 69, 67],
  },
  {
    id: 'fa-mi',
    title: 'Entra a mão direita: Fá e Mi',
    level: 'Iniciante',
    intro: 'Para o Fá, desça o indicador direito. Para o Mi, indicador e médio direitos.',
    notes: [67, 65, 67, 65, 64, 65, 64, 67, 69, 71],
  },
  {
    id: 're-do-graves',
    title: 'Ré e Dó graves',
    level: 'Iniciante',
    intro: 'As notas mais graves pedem sopro lento e lábios relaxados. Verifique se todos os dedos vedam bem as teclas.',
    notes: [64, 62, 64, 62, 60, 62, 60, 64, 67],
  },
  {
    id: 'escala-do-grave',
    title: 'Escala de Dó (oitava grave)',
    level: 'Iniciante',
    intro: 'Suba e desça a escala de Dó maior devagar.',
    notes: [...naturals(60, 72), ...naturals(60, 71).reverse()],
  },
  {
    id: 'oitava-media',
    title: 'Oitava média: mesma digitação, sopro diferente',
    level: 'Intermediário',
    intro: 'Mi, Fá, Sol, Lá e Si médios usam a mesma digitação dos graves. Para subir a oitava, aumente a velocidade do ar e diminua a abertura dos lábios.',
    notes: [64, 76, 65, 77, 67, 79, 69, 81, 71, 83],
  },
  {
    id: 'escala-do-media',
    title: 'Escala de Dó (oitava média)',
    level: 'Intermediário',
    intro: 'Escala de Dó maior da oitava média, subindo e descendo.',
    notes: [...naturals(72, 84), ...naturals(72, 83).reverse()],
  },
  {
    id: 'acidentes-graves',
    title: 'Sustenidos e bemóis graves',
    level: 'Intermediário',
    intro: 'Fá♯ usa o anelar direito. Si♭ usa a alavanca do polegar. Sol♯ usa o mindinho esquerdo.',
    notes: [65, 66, 67, 68, 69, 70, 71, 70, 69, 68, 67, 66, 65, 63, 62, 61, 60],
  },
  {
    id: 'acidentes-medios',
    title: 'Sustenidos e bemóis médios',
    level: 'Intermediário',
    intro: 'As mesmas digitações da oitava grave, com sopro mais rápido. O Dó♯ médio tem quase tudo aberto.',
    notes: [72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85],
  },
  {
    id: 'cromatica-grave',
    title: 'Escala cromática grave',
    level: 'Intermediário',
    intro: 'Todas as notas, de semitom em semitom, do Dó4 ao Dó♯5.',
    notes: range(60, 73),
  },
  {
    id: 'cromatica-media',
    title: 'Escala cromática média',
    level: 'Intermediário',
    intro: 'Do Ré5 ao Dó♯6. Mantenha o som estável de uma nota para a outra.',
    notes: range(74, 85),
  },
  {
    id: 'terceira-oitava',
    title: 'Terceira oitava (avançado)',
    level: 'Avançado',
    intro: 'Digitações próprias, diferentes das oitavas de baixo. Sopro rápido, abertura pequena, sem apertar os lábios.',
    notes: range(86, 96),
  },
  {
    id: 'todas',
    title: 'Todas as notas da flauta',
    level: 'Avançado',
    intro: 'Do Dó4 ao Dó7, nota por nota. O desafio final.',
    notes: range(60, 96),
  },
];
