import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Avatar, CheckIcon, TimerRing, WarningIcon, orderMembers } from '../components/common'
import type { Member, Routine } from '../data/types'
import { t } from '../i18n/pt-BR'
import { activeRoutine, formatClock, planAll, routineStart, statusFor, type PlannedStep, type StepStatus } from '../lib/schedule'
import { chime } from '../lib/sound'
import { moveFocus } from '../lib/spatialNav'
import { useStore } from '../state/store'

const ALERTS = [15, 5]

export function TvView() {
  const { state } = useStore()
  const routine = activeRoutine(state.routines, state.now, state.weekday)
  const rootRef = useRef<HTMLDivElement>(null)
  const [soundOn, setSoundOn] = useState(false)
  const alert = useCountdownAlert(routine, state.now, soundOn)

  const onKeyDown = (e: KeyboardEvent) => {
    if (rootRef.current && moveFocus(rootRef.current, e.key)) e.preventDefault()
  }

  return (
    <div className="tv" ref={rootRef} onKeyDown={onKeyDown}>
      {routine ? (
        <>
          <TvHeader routine={routine} now={state.now} soundOn={soundOn} onToggleSound={() => setSoundOn((v) => !v)} />
          {alert !== undefined && (
            <div className="tv-alert" role="status">
              <WarningIcon size={28} />
              <span className="headline-6">{t.tvAlert(alert, routine.deadlineLabel)}</span>
            </div>
          )}
          <div className="tv-columns">
            {orderMembers(state.members).map((m) => {
              const steps = planAll(routine).get(m.id)
              if (!steps?.length) return null
              return <PersonColumn key={m.id} member={m} routine={routine} steps={steps} />
            })}
          </div>
          <p className="tv-hint p5">{t.tvRemoteHint}</p>
        </>
      ) : (
        <TvIdle />
      )}
    </div>
  )
}

/** Shows a banner (and plays a chime) when 15 and 5 minutes remain. */
function useCountdownAlert(routine: Routine | undefined, now: number, soundOn: boolean) {
  const prev = useRef(now)
  useEffect(() => {
    if (routine && soundOn) {
      for (const min of ALERTS) {
        const at = routine.deadline - min
        if (prev.current < at && now >= at) chime()
      }
    }
    prev.current = now
  }, [now, routine, soundOn])
  if (!routine) return undefined
  const remaining = routine.deadline - now
  return ALERTS.find((min) => remaining <= min && remaining > min - 2)
}

function TvHeader({
  routine,
  now,
  soundOn,
  onToggleSound,
}: {
  routine: Routine
  now: number
  soundOn: boolean
  onToggleSound: () => void
}) {
  const start = routineStart(routine)
  const remaining = Math.ceil(routine.deadline - now)
  const progress = Math.min(1, Math.max(0, (now - start) / (routine.deadline - start)))
  return (
    <header className="tv-header">
      <div className="tv-header-side">
        <span className="p1 tv-muted">{routine.name}</span>
        <span className="headline-3 tabular">{formatClock(now)}</span>
      </div>
      <div className="tv-countdown">
        <span className="headline-5">{t.tvDeadline(routine.deadlineLabel, formatClock(routine.deadline))}</span>
        <span className="headline-1 tv-countdown-value">
          {now < start
            ? t.tvStartsAt(formatClock(start))
            : remaining <= 0
              ? t.tvTimeUp(routine.deadlineLabel)
              : t.tvRemaining(remaining)}
        </span>
        <div className="tv-progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div style={{ width: `${progress * 100}%` }} />
        </div>
      </div>
      <div className="tv-header-side tv-header-end">
        <button className={`btn btn-md ${soundOn ? 'btn-primary-light' : 'btn-secondary-gray'}`} onClick={onToggleSound} aria-pressed={soundOn}>
          {soundOn ? '🔔' : '🔕'} {soundOn ? t.soundOn : t.soundOff}
        </button>
      </div>
    </header>
  )
}

function PersonColumn({ member, routine, steps }: { member: Member; routine: Routine; steps: PlannedStep[] }) {
  const { state } = useStore()
  const done = state.done[routine.id] ?? {}
  const status = statusFor(steps, done, state.now)
  const left = steps.filter((s) => status.get(s.id) !== 'done').length

  return (
    <section className={`tv-col tv-col-${member.view}`} aria-label={member.name}>
      <header className="tv-col-header">
        <Avatar member={member} size={56} />
        <div>
          <h2 className="headline-6">{member.name}</h2>
          <p className="p5 tv-muted">{left ? t.stepsLeft(left) : t.allDoneShort}</p>
        </div>
      </header>
      {left === 0 ? (
        <AllDone />
      ) : member.view === 'picture' ? (
        <PictureView routine={routine} steps={steps} status={status} />
      ) : (
        <ListView routine={routine} steps={steps} status={status} withTimes={member.view === 'teen'} editable={member.view === 'teen'} />
      )}
    </section>
  )
}

function AllDone() {
  return (
    <div className="tv-all-done">
      <span className="tv-all-done-icon" aria-hidden="true">
        <CheckIcon size={48} />
      </span>
      <span className="headline-5">{t.allDone}</span>
      <span className="p3">{t.allDoneKind}</span>
    </div>
  )
}

/** One step at a time, big picture, visual timer. For the youngest. */
function PictureView({ routine, steps, status }: { routine: Routine; steps: PlannedStep[]; status: Map<string, StepStatus> }) {
  const { state, dispatch } = useStore()
  const current = steps.find((s) => status.get(s.id) === 'current' || status.get(s.id) === 'late')!
  const late = status.get(current.id) === 'late'
  const upcoming = steps.filter((s) => status.get(s.id) === 'upcoming').slice(0, 3)
  const finished = steps.filter((s) => status.get(s.id) === 'done')
  const minutesLeft = Math.max(0, Math.ceil(current.end - state.now))
  const notStarted = state.now < current.start

  return (
    <div className="picture-view">
      <div className={`picture-card ${late ? 'is-late' : ''}`}>
        {late && (
          <span className="badge badge-warning">
            <WarningIcon size={12} /> {t.late}
          </span>
        )}
        <TimerRing size={250} late={late} fraction={notStarted ? 1 : (current.end - state.now) / current.minutes}>
          <span className="picture-emoji" aria-hidden="true">
            {current.emoji}
          </span>
        </TimerRing>
        <h3 className="headline-5 picture-title">{current.title}</h3>
        <p className="p3 tv-muted">{late ? t.lateKind : t.minutes(notStarted ? current.minutes : minutesLeft)}</p>
      </div>
      <button className="btn btn-lg btn-primary picture-done" onClick={() => dispatch({ type: 'complete', routineId: routine.id, stepId: current.id })}>
        <CheckIcon size={20} /> {t.doneButton}
      </button>
      <div className="picture-strip" aria-label={t.next}>
        <span className="p5-medium tv-muted">{t.next}</span>
        <div className="picture-strip-items">
          {upcoming.map((s) => (
            <span key={s.id} className="picture-strip-item" title={s.title}>
              {s.emoji}
            </span>
          ))}
        </div>
      </div>
      {finished.length > 0 && (
        <div className="picture-done-row" aria-label={t.allDoneShort}>
          {finished.map((s) => (
            <span key={s.id} className="picture-done-item" title={s.title}>
              <span aria-hidden="true">{s.emoji}</span>
              <CheckIcon size={12} />
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

/** Checklist for school-age kids and parents; teens also see times and can edit their own steps. */
function ListView({
  routine,
  steps,
  status,
  withTimes,
  editable,
}: {
  routine: Routine
  steps: PlannedStep[]
  status: Map<string, StepStatus>
  withTimes: boolean
  editable: boolean
}) {
  const { state, dispatch } = useStore()
  const [editing, setEditing] = useState(false)

  return (
    <div className="list-view">
      <ol className="step-list">
        {steps.map((s) => {
          const st = status.get(s.id)!
          const lateBy = Math.ceil(state.now - s.end)
          return (
            <li key={s.id} className={`step-row is-${st}`}>
              <span className="step-check" aria-hidden="true">
                {st === 'done' && <CheckIcon size={14} />}
              </span>
              <span className="step-emoji" aria-hidden="true">
                {s.emoji}
              </span>
              <span className="step-body">
                <span className="p1-semibold step-title">{s.title}</span>
                {st === 'late' ? (
                  <>
                    <span className="badge badge-warning">
                      <WarningIcon size={14} /> {t.lateBy(lateBy)}
                    </span>
                    <span className="p5 list-kind">{t.lateKind}</span>
                  </>
                ) : withTimes || editing ? (
                  <span className="p5 tv-muted tabular">
                    {formatClock(s.start)}–{formatClock(s.end)} · {t.minutes(s.minutes)}
                  </span>
                ) : (
                  <span className="p5 tv-muted tabular">{formatClock(s.end)}</span>
                )}
                {editing ? (
                  <span className="step-edit">
                    <button className="btn btn-icon btn-xsm btn-secondary-gray" aria-label={t.moveUp} onClick={() => dispatch({ type: 'moveStep', routineId: routine.id, stepId: s.id, dir: -1 })}>
                      ↑
                    </button>
                    <button className="btn btn-icon btn-xsm btn-secondary-gray" aria-label={t.moveDown} onClick={() => dispatch({ type: 'moveStep', routineId: routine.id, stepId: s.id, dir: 1 })}>
                      ↓
                    </button>
                    <button
                      className="btn btn-icon btn-xsm btn-secondary-gray"
                      aria-label={t.lessTime}
                      disabled={s.minutes <= 5}
                      onClick={() => dispatch({ type: 'updateStep', routineId: routine.id, step: { ...stripPlan(s), minutes: s.minutes - 5 } })}
                    >
                      −
                    </button>
                    <button
                      className="btn btn-icon btn-xsm btn-secondary-gray"
                      aria-label={t.moreTime}
                      onClick={() => dispatch({ type: 'updateStep', routineId: routine.id, step: { ...stripPlan(s), minutes: s.minutes + 5 } })}
                    >
                      +
                    </button>
                  </span>
                ) : (
                  (st === 'current' || st === 'late') && (
                    <button className="btn btn-sm btn-primary" onClick={() => dispatch({ type: 'complete', routineId: routine.id, stepId: s.id })}>
                      {t.doneButton}
                    </button>
                  )
                )}
              </span>
            </li>
          )
        })}
      </ol>
      {editable && (
        <button className={`btn btn-sm ${editing ? 'btn-primary' : 'btn-secondary-gray'} list-edit-toggle`} onClick={() => setEditing((v) => !v)}>
          {editing ? t.finishEditing : t.editMySteps}
        </button>
      )}
    </div>
  )
}

function stripPlan({ start: _s, end: _e, ...step }: PlannedStep) {
  return step
}

function TvIdle() {
  const { state } = useStore()
  const upcoming = [...state.routines]
    .filter((r) => r.days.includes(state.weekday))
    .map((r) => ({ r, start: routineStart(r) }))
    .sort((a, b) => ((a.start - state.now + 1440) % 1440) - ((b.start - state.now + 1440) % 1440))[0]
  return (
    <div className="tv-idle">
      <span className="headline-3 tabular">{formatClock(state.now)}</span>
      <h2 className="headline-5">{t.tvIdleTitle}</h2>
      {upcoming && <p className="p1 tv-muted">{t.tvIdleNext(upcoming.r.name, formatClock(upcoming.start))}</p>}
      <p className="p3 tv-muted">{t.tvIdleHint}</p>
    </div>
  )
}
