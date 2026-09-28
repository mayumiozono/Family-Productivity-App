/** How a person's steps are shown on the TV. */
export type ViewKind = 'picture' | 'checklist' | 'teen'

export interface Member {
  id: string
  name: string
  /** Picture shown next to the name so non-readers find their column. */
  emoji: string
  age?: number
  view: ViewKind
  isParent: boolean
}

export interface Step {
  id: string
  ownerId: string
  title: string
  emoji: string
  minutes: number
}

export interface Routine {
  id: string
  name: string
  /** Verb shown with the deadline, e.g. "Sair" or "Dormir". */
  deadlineLabel: string
  /** Minutes since midnight when everyone must be done. */
  deadline: number
  /** 0 = Sunday … 6 = Saturday. */
  days: number[]
  /** Order matters: each person's steps run in this order. */
  steps: Step[]
}

export interface LateEntry {
  routineId: string
  stepId: string
  ownerId: string
  /** Minutes past the planned end. Skipped steps are logged with `skipped`. */
  lateBy: number
  skipped: boolean
}
