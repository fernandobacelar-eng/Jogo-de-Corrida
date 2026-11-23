// Lições em sequência para FLAUTA DOCE soprano (notas escritas).

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const naturals = (a, b) => range(a, b).filter((m) => ![1, 3, 6, 8, 10].includes(m % 12));

export const LESSONS = [
  {
    id: 'si-la-sol',
    title: 'Primeiras notas: Si, Lá e Sol',
    level: 'Iniciante',
    intro: 'Só a mão esquerda, com o polegar fechando o furo de trás. Sopre bem suave, como se dissesse "du".',
    notes: [71, 71, 69, 69, 67, 67, 71, 69, 67, 69, 71],
  },
  {
    id: 'do-re',
    title: 'Dó e Ré agudos',
    level: 'Iniciante',
    intro: 'No Dó, polegar e médio esquerdos. No Ré, só o médio: o polegar sai do furo.',
    notes: [71, 72, 71, 72, 74, 72, 74, 71, 69, 67],
  },
  {
    id: 'mi-re-graves',
    title: 'Entra a mão direita: Mi e Ré',
    level: 'Iniciante',
    intro: 'Feche os furos com a polpa dos dedos, sem apertar. Para o Ré grave, fechar bem todos os furos de cima.',
    notes: [67, 64, 67, 64, 62, 64, 62, 67, 69, 71],
  },
  {
    id: 'do-grave',
    title: 'Dó grave: todos os furos',
    level: 'Iniciante',
    intro: 'Todos os furos fechados, inclusive os duplos. Sopro bem lento: se chiar, verifique os dedos.',
    notes: [64, 62, 60, 62, 60, 62, 64, 67],
  },
  {
    id: 'fa',
    title: 'Fá♯ e Fá (forquilha)',
    level: 'Iniciante',
    intro: 'No Fá♯, levante o indicador direito. No Fá barroco, levante o médio direito e mantenha anelar e mínimo.',
    notes: [67, 66, 67, 66, 64, 66, 64, 65, 64, 65, 67],
  },
  {
    id: 'escala-sol',
    title: 'Escala de Sol maior (grave)',
    level: 'Iniciante',
    intro: 'Do Ré grave ao Ré agudo, com Fá♯.',
    notes: [62, 64, 66, 67, 69, 71, 72, 74, 72, 71, 69, 67, 66, 64, 62],
  },
  {
    id: 'escala-do-grave',
    title: 'Escala de Dó maior (grave)',
    level: 'Intermediário',
    intro: 'Suba e desça a escala de Dó maior devagar.',
    notes: [...naturals(60, 72), ...naturals(60, 71).reverse()],
  },
  {
    id: 'meia-tampa',
    title: 'Meia-tampa: as notas agudas',
    level: 'Intermediário',
    intro: 'Mi, Sol e Lá agudos usam a mesma digitação dos graves, com o polegar em meia-tampa: uma pequena fresta no furo de trás.',
    notes: [64, 76, 67, 79, 69, 81, 76, 79, 81, 79, 76],
  },
  {
    id: 'escala-do-aguda',
    title: 'Escala de Dó maior (aguda)',
    level: 'Intermediário',
    intro: 'Do Dó5 ao Dó6. A partir do Mi, polegar em meia-tampa.',
    notes: [...naturals(72, 84), ...naturals(72, 83).reverse()],
  },
  {
    id: 'acidentes',
    title: 'Sustenidos e bemóis',
    level: 'Intermediário',
    intro: 'Si♭ e Sol♯ usam forquilhas. Dó♯ e Ré♯ graves usam metade dos furos duplos.',
    notes: [65, 66, 67, 68, 69, 70, 71, 70, 69, 68, 67, 66, 65, 63, 62, 61, 60],
  },
  {
    id: 'cromatica-grave',
    title: 'Escala cromática grave',
    level: 'Avançado',
    intro: 'Do Dó4 ao Ré♯5, de semitom em semitom.',
    notes: range(60, 75),
  },
  {
    id: 'cromatica-aguda',
    title: 'Escala cromática aguda',
    level: 'Avançado',
    intro: 'Do Mi5 ao Dó6, sempre com meia-tampa.',
    notes: range(76, 84),
  },
  {
    id: 'todas',
    title: 'Todas as notas da flauta doce',
    level: 'Avançado',
    intro: 'Do Dó4 ao Dó6, nota por nota. O desafio final.',
    notes: range(60, 84),
  },
];
