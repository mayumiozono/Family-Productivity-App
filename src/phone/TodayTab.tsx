import { useState } from 'react'
import { Avatar, CheckIcon, PauseIcon, PlayIcon, WarningIcon, orderMembers } from '../components/common'
import { t } from '../i18n/pt-BR'
import { activeRoutine, formatClock, planAll, routineStart, statusFor } from '../lib/schedule'
import { useStore } from '../state/store'

export function TodayTab() {
  const { state, dispatch } = useStore()
  const routine = activeRoutine(state.routines, state.now, state.weekday)
  const [openId, setOpenId] = useState<string | null>(null)

  return (
    <div className="phone-page">
      <h1 className="headline-6">{t.tabToday}</h1>
      <DemoControls />

      {!routine ? (
        <p className="p5 muted">{t.noRoutineNow}</p>
      ) : (
        <section className="phone-section">
          <div className="phone-section-head">
            <h2 className="p1-semibold">{routine.name}</h2>
            <span className="p5 muted tabular">
              {state.now < routineStart(routine)
                ? t.tvStartsAt(formatClock(routineStart(routine)))
                : `${t.tvDeadline(routine.deadlineLabel, formatClock(routine.deadline))} · ${
                    routine.deadline - state.now > 0 ? t.tvRemaining(Math.ceil(routine.deadline - state.now)) : t.tvTimeUp(routine.deadlineLabel)
                  }`}
            </span>
          </div>
          <ul className="person-list">
            {orderMembers(state.members).map((m) => {
              const steps = planAll(routine).get(m.id)
              if (!steps?.length) return null
              const done = state.done[routine.id] ?? {}
              const status = statusFor(steps, done, state.now)
              const current = steps.find((s) => status.get(s.id) !== 'done' && status.get(s.id) !== 'upcoming')
              const late = current && status.get(current.id) === 'late'
              const open = openId === m.id
              return (
                <li key={m.id} className="person-card">
                  <div className="person-row">
                    <button className="person-toggle" aria-expanded={open} onClick={() => setOpenId(open ? null : m.id)}>
                      <Avatar member={m} size={40} />
                      <span className="person-text">
                        <span className="p5-medium">{m.name}</span>
                        <span className="p6 muted">
                          {current ? `${current.emoji} ${current.title} · ${formatClock(current.end)}` : t.allDoneShort}
                        </span>
                      </span>
                    </button>
                    {!current ? (
                      <span className="badge badge-success">
                        <CheckIcon size={12} /> {t.allDone}
                      </span>
                    ) : (
                      <>
                        {late && (
                          <span className="badge badge-warning">
                            <WarningIcon size={12} /> {t.late}
                          </span>
                        )}
                        <button
                          className="btn btn-icon btn-sm btn-secondary"
                          aria-label={t.markDoneFor(m.name)}
                          title={t.markDone}
                          onClick={() => dispatch({ type: 'complete', routineId: routine.id, stepId: current.id })}
                        >
                          <CheckIcon size={18} />
                        </button>
                      </>
                    )}
                  </div>
                  {open && (
                    <ol className="person-steps">
                      {steps.map((s) => {
                        const st = status.get(s.id)
                        return (
                          <li key={s.id} className={`person-step is-${st}`}>
                            <span className="p6 muted tabular">{formatClock(s.start)}</span>
                            <span className="p5">
                              {s.emoji} {s.title}
                            </span>
                            {st === 'done' ? (
                              <button className="btn btn-link p6-medium" onClick={() => dispatch({ type: 'undo', routineId: routine.id, stepId: s.id })}>
                                {t.undo}
                              </button>
                            ) : (
                              <span />
                            )}
                          </li>
                        )
                      })}
                    </ol>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

function DemoControls() {
  const { state, dispatch } = useStore()
  return (
    <section className="demo-controls" aria-label={t.demoControls}>
      <div className="demo-controls-head">
        <span className="p5-medium">{t.demoControls}</span>
        <span className="badge badge-info">{t.demoBadge}</span>
      </div>
      <div className="demo-clock-row">
        <span className="headline-5 tabular">{formatClock(state.now)}</span>
        <button className="btn btn-sm btn-primary" onClick={() => dispatch({ type: 'setRunning', running: !state.running })}>
          {state.running ? <PauseIcon /> : <PlayIcon />} {state.running ? t.pause : t.play}
        </button>
      </div>
      <div className="segmented" role="group" aria-label="Velocidade">
        <button aria-pressed={state.speed === 1} onClick={() => dispatch({ type: 'setSpeed', speed: 1 })}>
          {t.speedNormal}
        </button>
        <button aria-pressed={state.speed === 30} onClick={() => dispatch({ type: 'setSpeed', speed: 30 })}>
          {t.speedFast}
        </button>
      </div>
      <label className="checkbox p5">
        <input id="autopilot" type="checkbox" checked={state.autopilot} onChange={(e) => dispatch({ type: 'setAutopilot', on: e.target.checked })} />
        {t.autopilot}
      </label>
      <div className="demo-jumps">
        <button className="btn btn-xsm btn-secondary" onClick={() => dispatch({ type: 'jumpTo', routineId: 'manha' })}>
          {t.jumpMorning}
        </button>
        <button className="btn btn-xsm btn-secondary" onClick={() => dispatch({ type: 'jumpTo', routineId: 'noite' })}>
          {t.jumpNight}
        </button>
      </div>
      <p className="p6 muted">{t.demoControlsHint}</p>
    </section>
  )
}
