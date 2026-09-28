import { describe, expect, it } from 'vitest'
import type { Routine } from '../data/types'
import { activeRoutine, formatClock, parseClock, planFor, routineStart, statusFor } from './schedule'

const routine: Routine = {
  id: 'r',
  name: 'Manhã',
  deadlineLabel: 'Sair',
  deadline: 7 * 60 + 40,
  days: [1],
  steps: [
    { id: 'a', ownerId: 'kid', title: 'Acordar', emoji: '⏰', minutes: 10 },
    { id: 'b', ownerId: 'dad', title: 'Café', emoji: '🍳', minutes: 20 },
    { id: 'c', ownerId: 'kid', title: 'Dentes', emoji: '🪥', minutes: 5 },
  ],
}

describe('planFor', () => {
  it('plans backwards so the last step ends at the deadline', () => {
    const plan = planFor(routine, 'kid')
    expect(plan.map((s) => [formatClock(s.start), formatClock(s.end)])).toEqual([
      ['07:25', '07:35'],
      ['07:35', '07:40'],
    ])
  })

  it('finds the earliest start across everyone', () => {
    expect(formatClock(routineStart(routine))).toBe('07:20')
  })
})

describe('statusFor', () => {
  const plan = planFor(routine, 'kid')

  it('marks the first unfinished step as current', () => {
    const status = statusFor(plan, {}, 7 * 60 + 30)
    expect(status.get('a')).toBe('current')
    expect(status.get('c')).toBe('upcoming')
  })

  it('marks the current step late once its planned end has passed', () => {
    expect(statusFor(plan, {}, 7 * 60 + 36).get('a')).toBe('late')
  })

  it('moves on after a step is done', () => {
    const status = statusFor(plan, { a: 7 * 60 + 34 }, 7 * 60 + 36)
    expect(status.get('a')).toBe('done')
    expect(status.get('c')).toBe('current')
  })
})

describe('activeRoutine', () => {
  it('is active only on its days and around its time', () => {
    expect(activeRoutine([routine], 7 * 60 + 15, 1)?.id).toBe('r')
    expect(activeRoutine([routine], 7 * 60 + 15, 0)).toBeUndefined()
    expect(activeRoutine([routine], 9 * 60, 1)).toBeUndefined()
  })
})

describe('clock helpers', () => {
  it('round-trips HH:MM', () => {
    expect(parseClock('07:40')).toBe(460)
    expect(formatClock(460)).toBe('07:40')
    expect(parseClock('25:00')).toBeUndefined()
  })
})
