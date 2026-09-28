import type { Routine, Step } from '../data/types'

export interface PlannedStep extends Step {
  start: number
  end: number
}

/** Minutes of grace before a step counts as late. */
export const LATE_GRACE = 0.5

/**
 * Plans one person's steps backwards from the routine deadline: the last step
 * ends exactly at the deadline and each earlier step ends where the next begins.
 */
export function planFor(routine: Routine, ownerId: string): PlannedStep[] {
  const steps = routine.steps.filter((s) => s.ownerId === ownerId)
  let end = routine.deadline
  const planned: PlannedStep[] = []
  for (let i = steps.length - 1; i >= 0; i--) {
    const start = end - steps[i].minutes
    planned.unshift({ ...steps[i], start, end })
    end = start
  }
  return planned
}

export function planAll(routine: Routine): Map<string, PlannedStep[]> {
  const owners = [...new Set(routine.steps.map((s) => s.ownerId))]
  return new Map(owners.map((id) => [id, planFor(routine, id)]))
}

/** When the first person has to start. */
export function routineStart(routine: Routine): number {
  let earliest = routine.deadline
  for (const steps of planAll(routine).values()) {
    if (steps.length) earliest = Math.min(earliest, steps[0].start)
  }
  return earliest
}

export type StepStatus = 'done' | 'current' | 'late' | 'upcoming'

/** Status of every step of one person at time `now`. */
export function statusFor(
  steps: PlannedStep[],
  done: Record<string, number>,
  now: number,
): Map<string, StepStatus> {
  const result = new Map<string, StepStatus>()
  let currentFound = false
  for (const step of steps) {
    if (done[step.id] !== undefined) {
      result.set(step.id, 'done')
    } else if (!currentFound) {
      currentFound = true
      result.set(step.id, now > step.end + LATE_GRACE ? 'late' : 'current')
    } else {
      result.set(step.id, 'upcoming')
    }
  }
  return result
}

/** The routine shown on the TV at `now`: from 10 min before its start to 10 min after its deadline. */
export function activeRoutine(routines: Routine[], now: number, weekday: number): Routine | undefined {
  return routines.find(
    (r) => r.days.includes(weekday) && now >= routineStart(r) - 10 && now <= r.deadline + 10,
  )
}

export function formatClock(minutes: number): string {
  const m = Math.floor(((minutes % 1440) + 1440) % 1440)
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

/** Parses "HH:MM" into minutes since midnight. */
export function parseClock(value: string): number | undefined {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value)
  if (!match) return undefined
  const h = Number(match[1])
  const m = Number(match[2])
  if (h > 23 || m > 59) return undefined
  return h * 60 + m
}
