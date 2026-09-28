import { createContext, useContext, useEffect, useReducer, type Dispatch, type ReactNode } from 'react'
import { sampleMembers, sampleRoutines } from '../data/sample'
import type { LateEntry, Member, Routine, Step } from '../data/types'
import { LATE_GRACE, planAll, routineStart } from '../lib/schedule'

export interface State {
  members: Member[]
  routines: Routine[]
  /** Simulated time in minutes since midnight. */
  now: number
  /** Simulated weekday (1 = Monday). */
  weekday: number
  running: boolean
  /** Simulated seconds per real second. */
  speed: 1 | 30
  autopilot: boolean
  /** routineId → stepId → minute it was checked off. */
  done: Record<string, Record<string, number>>
  log: LateEntry[]
  /** Routines whose deadline already passed and whose skipped steps were logged. */
  closed: string[]
}

export type Action =
  | { type: 'tick'; minutes: number }
  | { type: 'setRunning'; running: boolean }
  | { type: 'setSpeed'; speed: 1 | 30 }
  | { type: 'setAutopilot'; on: boolean }
  | { type: 'jumpTo'; routineId: string }
  | { type: 'complete'; routineId: string; stepId: string }
  | { type: 'undo'; routineId: string; stepId: string }
  | { type: 'saveRoutine'; routine: Routine }
  | { type: 'updateStep'; routineId: string; step: Step }
  | { type: 'moveStep'; routineId: string; stepId: string; dir: -1 | 1 }
  | { type: 'reset' }

/**
 * Steps the sample family finishes late on autopilot, so the demo shows how
 * the app reacts to lateness. Keyed by routine, owner and title.
 */
const SCRIPTED_DELAYS: Record<string, number> = {
  'manha:teo:Tomar banho': 4,
  'noite:lia:Tomar banho': 3,
}

const STORAGE_KEY = 'rotina-em-familia:v1'

function initialState(): State {
  const saved = load()
  const routines = saved?.routines ?? sampleRoutines
  const morning = routines.find((r) => r.id === 'manha') ?? routines[0]
  return {
    members: saved?.members ?? sampleMembers,
    routines,
    now: morning ? routineStart(morning) - 5 : 6 * 60 + 40,
    weekday: 1,
    running: false,
    speed: 30,
    autopilot: true,
    done: {},
    log: [],
    closed: [],
  }
}

function load(): Pick<State, 'members' | 'routines'> | undefined {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

function save(state: State) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ members: state.members, routines: state.routines }))
  } catch {
    // Storage can be unavailable (private window); the demo still works in memory.
  }
}

function complete(state: State, routineId: string, stepId: string, at: number): State {
  const routine = state.routines.find((r) => r.id === routineId)
  if (!routine || state.done[routineId]?.[stepId] !== undefined) return state
  const step = [...planAll(routine).values()].flat().find((s) => s.id === stepId)
  if (!step) return state
  const lateBy = at - step.end
  return {
    ...state,
    done: { ...state.done, [routineId]: { ...state.done[routineId], [stepId]: at } },
    log:
      lateBy > LATE_GRACE
        ? [...state.log, { routineId, stepId, ownerId: step.ownerId, lateBy, skipped: false }]
        : state.log,
  }
}

function tick(state: State, minutes: number): State {
  let next: State = { ...state, now: state.now + minutes }
  for (const routine of next.routines) {
    if (!routine.days.includes(next.weekday)) continue
    const plans = planAll(routine)

    if (next.autopilot) {
      for (const [ownerId, steps] of plans) {
        // Complete each person's current step once its planned end (plus any scripted delay) passes.
        for (const step of steps) {
          if (next.done[routine.id]?.[step.id] !== undefined) continue
          const delay = SCRIPTED_DELAYS[`${routine.id}:${ownerId}:${step.title}`] ?? 0
          if (next.now >= step.end + delay && next.now >= routineStart(routine)) {
            next = complete(next, routine.id, step.id, next.now)
          }
          break
        }
      }
    }

    // At the deadline, log anything still unfinished as skipped.
    if (next.now >= routine.deadline && state.now < routine.deadline && !next.closed.includes(routine.id)) {
      const skipped: LateEntry[] = []
      for (const steps of plans.values()) {
        for (const step of steps) {
          if (next.done[routine.id]?.[step.id] === undefined) {
            skipped.push({ routineId: routine.id, stepId: step.id, ownerId: step.ownerId, lateBy: 0, skipped: true })
          }
        }
      }
      next = { ...next, log: [...next.log, ...skipped], closed: [...next.closed, routine.id] }
    }
  }
  return next
}

function mapRoutine(state: State, routineId: string, fn: (r: Routine) => Routine): State {
  return { ...state, routines: state.routines.map((r) => (r.id === routineId ? fn(r) : r)) }
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'tick':
      return state.running ? tick(state, action.minutes) : state
    case 'setRunning':
      return { ...state, running: action.running }
    case 'setSpeed':
      return { ...state, speed: action.speed }
    case 'setAutopilot':
      return { ...state, autopilot: action.on }
    case 'jumpTo': {
      const routine = state.routines.find((r) => r.id === action.routineId)
      if (!routine) return state
      const { [routine.id]: _cleared, ...done } = state.done
      return {
        ...state,
        now: routineStart(routine) - 5,
        weekday: routine.days.includes(state.weekday) ? state.weekday : routine.days[0] ?? 1,
        done,
        log: state.log.filter((l) => l.routineId !== routine.id),
        closed: state.closed.filter((id) => id !== routine.id),
        running: true,
      }
    }
    case 'complete':
      return complete(state, action.routineId, action.stepId, state.now)
    case 'undo': {
      const { [action.stepId]: _removed, ...rest } = state.done[action.routineId] ?? {}
      return {
        ...state,
        done: { ...state.done, [action.routineId]: rest },
        log: state.log.filter((l) => !(l.routineId === action.routineId && l.stepId === action.stepId)),
      }
    }
    case 'saveRoutine':
      return mapRoutine(state, action.routine.id, () => action.routine)
    case 'updateStep':
      return mapRoutine(state, action.routineId, (r) => ({
        ...r,
        steps: r.steps.map((s) => (s.id === action.step.id ? action.step : s)),
      }))
    case 'moveStep':
      return mapRoutine(state, action.routineId, (r) => ({ ...r, steps: moveWithinOwner(r.steps, action.stepId, action.dir) }))
    case 'reset': {
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch {
        // ignore
      }
      return { ...initialState(), members: sampleMembers, routines: sampleRoutines }
    }
  }
}

/** Swaps a step with the previous or next step of the same person. */
export function moveWithinOwner(steps: Step[], stepId: string, dir: -1 | 1): Step[] {
  const index = steps.findIndex((s) => s.id === stepId)
  if (index < 0) return steps
  const owner = steps[index].ownerId
  let other = index + dir
  while (other >= 0 && other < steps.length && steps[other].ownerId !== owner) other += dir
  if (other < 0 || other >= steps.length) return steps
  const copy = [...steps]
  ;[copy[index], copy[other]] = [copy[other], copy[index]]
  return copy
}

const StoreContext = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState)

  useEffect(() => save(state), [state.members, state.routines])

  // Drive the simulated clock.
  useEffect(() => {
    if (!state.running) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const nowMs = performance.now()
      const realSeconds = (nowMs - last) / 1000
      last = nowMs
      dispatch({ type: 'tick', minutes: (realSeconds * state.speed) / 60 })
    }, 200)
    return () => window.clearInterval(id)
  }, [state.running, state.speed])

  return <StoreContext.Provider value={{ state, dispatch }}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

let idCounter = 0
export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`
}
