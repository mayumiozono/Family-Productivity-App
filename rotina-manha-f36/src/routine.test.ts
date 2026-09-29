import { describe, expect, it } from 'vitest';
import { PEOPLE } from './data';
import {
  clockLabel,
  deadlines,
  incompleteLabel,
  isLate,
  isWarning,
  remainingLabel,
  stepsLeftLabel,
  taskStatus,
} from './routine';

describe('routine', () => {
  it('soma as estimativas para o prazo de cada tarefa', () => {
    expect(deadlines(PEOPLE[0].tasks)).toEqual([3, 8, 15, 23, 30]);
    expect(deadlines(PEOPLE[1].tasks)).toEqual([10, 13, 15, 20, 25]);
    expect(deadlines(PEOPLE[2].tasks)).toEqual([3, 10, 22, 30]);
  });

  it('nenhuma pessoa passa do horário de saída', () => {
    for (const p of PEOPLE) expect(deadlines(p.tasks).at(-1)).toBeLessThanOrEqual(30);
  });

  it('formata o relógio e o tempo restante como no Figma', () => {
    expect(clockLabel(0)).toBe('09:00');
    expect(remainingLabel(0)).toBe('00:30');
    expect(clockLabel(10.5)).toBe('09:10');
    expect(remainingLabel(10.5)).toBe('00:20');
    expect(clockLabel(31)).toBe('09:30');
    expect(remainingLabel(31)).toBe('00:00');
  });

  it('marca como atual a primeira tarefa pendente', () => {
    expect(taskStatus(0, 1)).toBe('done');
    expect(taskStatus(1, 1)).toBe('current');
    expect(taskStatus(2, 1)).toBe('pending');
  });

  it('só marca atraso em tarefa não concluída depois do prazo', () => {
    expect(isLate(0, 0, 10, 10)).toBe(false);
    expect(isLate(0, 0, 10, 10.1)).toBe(true);
    expect(isLate(0, 1, 10, 20)).toBe(false);
    expect(isLate(2, 1, 15, 16)).toBe(true);
  });

  it('deixa a barra laranja só nos últimos 5 minutos', () => {
    expect(isWarning(24.9)).toBe(false);
    expect(isWarning(25)).toBe(true);
    expect(isWarning(30)).toBe(false);
  });

  it('usa singular e plural', () => {
    expect(stepsLeftLabel(0)).toBe('Todos os passos feitos');
    expect(stepsLeftLabel(1)).toBe('Falta 1 passo');
    expect(stepsLeftLabel(3)).toBe('Faltam 3 passos');
    expect(incompleteLabel(1)).toBe('1 tarefa incompleta');
    expect(incompleteLabel(2)).toBe('2 tarefas incompletas');
  });
});
