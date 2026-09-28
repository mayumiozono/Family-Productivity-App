import type { Member, Routine, Step } from './types'

export const sampleMembers: Member[] = [
  { id: 'ana', name: 'Ana', emoji: '👩', view: 'checklist', isParent: true },
  { id: 'carlos', name: 'Carlos', emoji: '👨', view: 'checklist', isParent: true },
  { id: 'bia', name: 'Bia', emoji: '👩‍🎓', age: 16, view: 'teen', isParent: false },
  { id: 'teo', name: 'Téo', emoji: '👦', age: 10, view: 'checklist', isParent: false },
  { id: 'lia', name: 'Lia', emoji: '👧', age: 5, view: 'picture', isParent: false },
]

let n = 0
const s = (ownerId: string, emoji: string, title: string, minutes: number): Step => ({
  id: `s${++n}`,
  ownerId,
  emoji,
  title,
  minutes,
})

const WEEKDAYS = [1, 2, 3, 4, 5]

export const sampleRoutines: Routine[] = [
  {
    id: 'manha',
    name: 'Manhã',
    deadlineLabel: 'Sair',
    deadline: 7 * 60 + 40,
    days: WEEKDAYS,
    steps: [
      s('lia', '🌞', 'Acordar', 5),
      s('lia', '🚽', 'Ir ao banheiro', 5),
      s('lia', '🥣', 'Tomar café', 15),
      s('lia', '🪥', 'Escovar os dentes', 5),
      s('lia', '👕', 'Vestir o uniforme', 10),
      s('lia', '👟', 'Calçar os sapatos', 5),
      s('lia', '🎒', 'Pegar a mochila', 5),

      s('teo', '⏰', 'Acordar', 5),
      s('teo', '🚿', 'Tomar banho', 10),
      s('teo', '👕', 'Vestir o uniforme', 5),
      s('teo', '🥣', 'Tomar café', 15),
      s('teo', '🪥', 'Escovar os dentes', 5),
      s('teo', '🎒', 'Arrumar a mochila', 5),
      s('teo', '👟', 'Calçar o tênis', 5),

      s('bia', '⏰', 'Acordar', 5),
      s('bia', '🚿', 'Tomar banho', 15),
      s('bia', '👕', 'Se vestir', 10),
      s('bia', '🥣', 'Tomar café', 10),
      s('bia', '🪥', 'Escovar os dentes', 5),
      s('bia', '📅', 'Conferir a agenda do dia', 5),

      s('carlos', '🍳', 'Preparar o café da manhã', 20),
      s('carlos', '🎒', 'Conferir as mochilas', 5),
      s('carlos', '🗑️', 'Levar o lixo para fora', 5),
      s('carlos', '🔑', 'Pegar a chave do carro', 5),

      s('ana', '🛏️', 'Acordar as crianças', 10),
      s('ana', '🥪', 'Montar as lancheiras', 15),
      s('ana', '👔', 'Se arrumar', 10),
    ],
  },
  {
    id: 'noite',
    name: 'Noite',
    deadlineLabel: 'Dormir',
    deadline: 21 * 60,
    days: [0, 1, 2, 3, 4, 5, 6],
    steps: [
      s('lia', '🧸', 'Guardar os brinquedos', 10),
      s('lia', '🛁', 'Tomar banho', 15),
      s('lia', '🩳', 'Vestir o pijama', 5),
      s('lia', '🪥', 'Escovar os dentes', 5),
      s('lia', '📖', 'Ouvir uma história', 15),

      s('teo', '🎒', 'Arrumar a mochila de amanhã', 5),
      s('teo', '👕', 'Separar a roupa de amanhã', 5),
      s('teo', '🚿', 'Tomar banho', 10),
      s('teo', '🪥', 'Escovar os dentes', 5),
      s('teo', '📵', 'Desligar as telas', 5),

      s('bia', '📚', 'Revisar a lição', 20),
      s('bia', '🎒', 'Arrumar a mochila de amanhã', 5),
      s('bia', '🪥', 'Escovar os dentes', 5),
      s('bia', '📵', 'Carregar o celular fora do quarto', 5),

      s('carlos', '🍽️', 'Lavar a louça', 20),
      s('carlos', '📖', 'Ler a história para a Lia', 15),

      s('ana', '📅', 'Conferir a agenda de amanhã', 10),
      s('ana', '🧺', 'Separar os uniformes', 10),
    ],
  },
]

/**
 * Example numbers for the weekly summary. The demo has no real week of use,
 * so the parent screen labels these clearly as an example.
 */
export const sampleWeek = {
  lastWeek: [2, 1, 1, 2, 1, 0, 0], // Mon…Sun late steps
  thisWeek: [1, 1, 0, 1, 0, 0, 0],
  byMember: { ana: 0, carlos: 1, bia: 0, teo: 2, lia: 0 } as Record<string, number>,
}

/** Picture choices offered when adding a step. */
export const stepEmojis = [
  '🌞', '⏰', '🚽', '🚿', '🛁', '🪥', '🥣', '🍳', '🥪', '👕', '🩳', '👟',
  '🎒', '📅', '📚', '📖', '🧸', '🧺', '🍽️', '🗑️', '🔑', '💊', '🐶', '📵',
]
