import { DURATION_MINUTES, START_MINUTES, WARNING_MINUTES, type Task } from './data';

export type TaskStatus = 'pending' | 'current' | 'done';

/** Formata minutos desde 00:00 como HH:MM. */
export function formatClock(totalMinutes: number): string {
  const m = Math.floor(totalMinutes);
  const hh = String(Math.floor(m / 60)).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

/** Prazo de cada tarefa, em minutos desde o início: soma das estimativas até ela. */
export function deadlines(tasks: Task[]): number[] {
  let sum = 0;
  return tasks.map((t) => (sum += t.minutes));
}

/** Tarefas são sequenciais: as `doneCount` primeiras estão concluídas, a seguinte é a atual. */
export function taskStatus(index: number, doneCount: number): TaskStatus {
  if (index < doneCount) return 'done';
  return index === doneCount ? 'current' : 'pending';
}

/** Uma tarefa não concluída está em atraso quando o tempo passou do seu prazo. */
export function isLate(index: number, doneCount: number, deadline: number, elapsed: number): boolean {
  return index >= doneCount && elapsed > deadline;
}

export function isEnded(elapsed: number): boolean {
  return elapsed >= DURATION_MINUTES;
}

/** A barra fica laranja nos últimos minutos, mas não no momento da saída. */
export function isWarning(elapsed: number): boolean {
  return elapsed >= DURATION_MINUTES - WARNING_MINUTES && !isEnded(elapsed);
}

export function clockLabel(elapsed: number): string {
  return formatClock(START_MINUTES + Math.min(elapsed, DURATION_MINUTES));
}

export function remainingLabel(elapsed: number): string {
  return formatClock(DURATION_MINUTES - Math.floor(Math.min(elapsed, DURATION_MINUTES)));
}

export function stepsLeftLabel(n: number): string {
  if (n === 0) return 'Todos os passos feitos';
  return n === 1 ? 'Falta 1 passo' : `Faltam ${n} passos`;
}

export function incompleteLabel(n: number): string {
  return n === 1 ? '1 tarefa incompleta' : `${n} tarefas incompletas`;
}
