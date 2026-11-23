// Lições em sequência para SAXOFONE ALTO (notas escritas).

const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const naturals = (a, b) => range(a, b).filter((m) => ![1, 3, 6, 8, 10].includes(m % 12));

export const LESSONS = [
  {
    id: 'si-la-sol',
    title: 'Primeiras notas: Si, Lá e Sol',
    level: 'Iniciante',
    intro: 'Só a mão esquerda: indicador (Si), médio (Lá) e anelar (Sol). Sopre com o ar constante, sem morder a boquilha.',
    notes: [71, 71, 69, 69, 67, 67, 71, 69, 67, 69, 71],
  },
  {
    id: 'do-dos',
    title: 'Dó e Dó♯ médios',
    level: 'Iniciante',
    intro: 'Dó: só o médio esquerdo. Dó♯: nenhuma chave. Segure bem o sax com o polegar direito e a correia.',
    notes: [71, 72, 71, 72, 73, 72, 71, 69, 67],
  },
  {
    id: 'fa-mi-re',
    title: 'Entra a mão direita: Fá, Mi e Ré',
    level: 'Iniciante',
    intro: 'Mantenha a mão esquerda no Sol e desça os dedos da direita: Fá (indicador), Mi (indicador e médio), Ré (os três).',
    notes: [67, 65, 64, 62, 64, 65, 67, 65, 62],
  },
  {
    id: 'graves',
    title: 'Notas graves: Dó, Si e Si♭',
    level: 'Iniciante',
    intro: 'Mínimo direito no Dó grave; mínimo esquerdo no Si e no Si♭. Abra a garganta e use bastante ar, sem forçar.',
    notes: [62, 60, 62, 60, 59, 60, 58, 60, 62],
  },
  {
    id: 'fas-sols',
    title: 'Fá♯ e Sol♯',
    level: 'Iniciante',
    intro: 'Fá♯: só o médio direito. Sol♯: mínimo esquerdo na chave de Sol♯, com os três dedos da esquerda.',
    notes: [67, 66, 67, 68, 69, 68, 67, 66, 64],
  },
  {
    id: 'sib',
    title: 'Si♭ com a chave bis',
    level: 'Iniciante',
    intro: 'O indicador esquerdo aperta o Si e a chavinha bis logo abaixo, ao mesmo tempo.',
    notes: [69, 70, 71, 70, 69, 70, 72, 70, 69],
  },
  {
    id: 'escala-do-grave',
    title: 'Escala de Dó maior (grave)',
    level: 'Intermediário',
    intro: 'Suba e desça a escala de Dó maior devagar.',
    notes: [...naturals(60, 72), ...naturals(60, 71).reverse()],
  },
  {
    id: 'oitava',
    title: 'A chave de oitava',
    level: 'Intermediário',
    intro: 'Mesma digitação, com o polegar esquerdo na chave de oitava. Não aperte a boquilha: mantenha o ar firme.',
    notes: [62, 74, 64, 76, 67, 79, 69, 81, 71, 83],
  },
  {
    id: 'escala-do-aguda',
    title: 'Escala de Dó maior (aguda)',
    level: 'Intermediário',
    intro: 'Do Dó5 ao Dó6, com a chave de oitava a partir do Ré.',
    notes: [...naturals(72, 84), ...naturals(72, 83).reverse()],
  },
  {
    id: 'palma',
    title: 'Chaves de palma',
    level: 'Avançado',
    intro: 'Ré, Mi♭, Mi e Fá agudos usam as chaves de palma da mão esquerda e a chave lateral de Mi.',
    notes: [84, 85, 86, 87, 88, 89, 88, 87, 86, 84],
  },
  {
    id: 'cromatica-grave',
    title: 'Escala cromática grave',
    level: 'Avançado',
    intro: 'Do Si♭3 ao Dó♯5, de semitom em semitom.',
    notes: range(58, 73),
  },
  {
    id: 'cromatica-aguda',
    title: 'Escala cromática aguda',
    level: 'Avançado',
    intro: 'Do Ré5 ao Fá6, com chave de oitava e chaves de palma.',
    notes: range(74, 89),
  },
  {
    id: 'todas',
    title: 'Todas as notas do sax',
    level: 'Avançado',
    intro: 'Do Si♭ grave ao Fá agudo, nota por nota. O desafio final.',
    notes: range(58, 89),
  },
];
