// Dados de exemplo da rotina. Estimativas em minutos, na ordem do fluxo do Figma.

export type Task = { name: string; minutes: number };
export type Person = { id: string; name: string; tasks: Task[] };

/** Início da rotina em minutos desde 00:00 (09:00). */
export const START_MINUTES = 9 * 60;
/** Duração da janela até o horário de saída (09:30). */
export const DURATION_MINUTES = 30;
/** Minutos finais em que a barra de tempo fica laranja. */
export const WARNING_MINUTES = 5;
/** Tempo real, em segundos, para percorrer a rotina inteira. */
export const REAL_SECONDS_FOR_ROUTINE = 120;

export const PEOPLE: Person[] = [
  {
    id: 'fernando',
    name: 'Fernando',
    tasks: [
      { name: 'Escovar os dentes', minutes: 3 },
      { name: 'Trocar de roupa', minutes: 5 },
      { name: 'Preparar o café', minutes: 7 },
      { name: 'Preparar a lancheira', minutes: 8 },
      { name: 'Tomar café', minutes: 7 },
    ],
  },
  {
    id: 'adam',
    name: 'Adam',
    tasks: [
      { name: 'Tomar café', minutes: 10 },
      { name: 'Escovar os dentes', minutes: 3 },
      { name: 'Lavar o nariz', minutes: 2 },
      { name: 'Colocar uniforme', minutes: 5 },
      { name: 'Arrumar a mochila', minutes: 5 },
    ],
  },
  {
    id: 'leticia',
    name: 'Leticia',
    tasks: [
      { name: 'Escovar os dentes', minutes: 3 },
      { name: 'Trocar de roupa', minutes: 7 },
      { name: 'Passear com o Miles', minutes: 12 },
      { name: 'Tomar café', minutes: 8 },
    ],
  },
];
