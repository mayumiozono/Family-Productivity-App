import { useState } from 'react'
import { Avatar, orderMembers } from '../components/common'
import { stepEmojis } from '../data/sample'
import type { Routine } from '../data/types'
import { t } from '../i18n/pt-BR'
import { formatClock, parseClock, planFor } from '../lib/schedule'
import { moveWithinOwner, newId, useStore } from '../state/store'

export function RoutinesTab() {
  const { state, dispatch } = useStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const editing = state.routines.find((r) => r.id === editingId)

  if (editing) return <RoutineEditor key={editing.id} routine={editing} onClose={() => setEditingId(null)} />

  return (
    <div className="phone-page">
      <h1 className="headline-6">{t.routinesTitle}</h1>
      <ul className="routine-list">
        {state.routines.map((r) => (
          <li key={r.id} className="routine-card">
            <div>
              <h2 className="p1-semibold">{r.name}</h2>
              <p className="p5 muted tabular">{t.tvDeadline(r.deadlineLabel, formatClock(r.deadline))}</p>
              <p className="p6 muted">{r.days.map((d) => t.weekdays[d]).join(' · ')}</p>
            </div>
            <button className="btn btn-sm btn-secondary" onClick={() => setEditingId(r.id)}>
              {t.editRoutine}
            </button>
          </li>
        ))}
      </ul>
      <button className="btn btn-link p5-medium reset-link" onClick={() => dispatch({ type: 'reset' })}>
        {t.resetDemo}
      </button>
    </div>
  )
}

function RoutineEditor({ routine, onClose }: { routine: Routine; onClose: () => void }) {
  const { state, dispatch } = useStore()
  const [draft, setDraft] = useState<Routine>(routine)
  const members = orderMembers(state.members)

  const [owner, setOwner] = useState(members[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [minutes, setMinutes] = useState(5)
  const [emoji, setEmoji] = useState(stepEmojis[0])

  const update = (patch: Partial<Routine>) => setDraft((d) => ({ ...d, ...patch }))

  const addStep = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    update({ steps: [...draft.steps, { id: newId('step'), ownerId: owner, title: title.trim(), emoji, minutes }] })
    setTitle('')
  }

  return (
    <div className="phone-page">
      <div className="editor-top">
        <button className="btn btn-link p5-medium" onClick={onClose}>
          ← {t.back}
        </button>
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            dispatch({ type: 'saveRoutine', routine: draft })
            onClose()
          }}
        >
          {t.save}
        </button>
      </div>

      <div className="field">
        <label htmlFor="routine-name">{t.routineName}</label>
        <input id="routine-name" className="input" value={draft.name} onChange={(e) => update({ name: e.target.value })} />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="routine-label">{t.deadlineLabel}</label>
          <input id="routine-label" className="input" value={draft.deadlineLabel} onChange={(e) => update({ deadlineLabel: e.target.value })} />
        </div>
        <div className="field">
          <label htmlFor="routine-deadline">{t.deadlineTime}</label>
          <input
            id="routine-deadline"
            className="input tabular"
            type="time"
            value={formatClock(draft.deadline)}
            onChange={(e) => {
              const v = parseClock(e.target.value)
              if (v !== undefined) update({ deadline: v })
            }}
          />
        </div>
      </div>
      <div className="field">
        <span className="label">{t.days}</span>
        <div className="day-chips">
          {t.weekdays.map((label, d) => {
            const on = draft.days.includes(d)
            return (
              <button
                key={d}
                className={`chip ${on ? 'is-on' : ''}`}
                aria-pressed={on}
                onClick={() => update({ days: on ? draft.days.filter((x) => x !== d) : [...draft.days, d].sort() })}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      <p className="p6 muted">{t.plannedBackwards(draft.deadlineLabel, formatClock(draft.deadline))}</p>

      <form className="add-step" onSubmit={addStep}>
        <h2 className="p5-medium">{t.addStep}</h2>
        <div className="field">
          <label htmlFor="step-owner">{t.owner}</label>
          <select id="step-owner" className="input" value={owner} onChange={(e) => setOwner(e.target.value)}>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.emoji} {m.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <div className="field grow">
            <label htmlFor="step-title">{t.stepTitle}</label>
            <input id="step-title" className="input" placeholder={t.stepTitlePlaceholder} value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field narrow">
            <label htmlFor="step-minutes">{t.stepMinutes}</label>
            <input
              id="step-minutes"
              className="input tabular"
              type="number"
              min={1}
              max={120}
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, Math.min(120, Number(e.target.value) || 1)))}
            />
          </div>
        </div>
        <div className="field">
          <span className="label">{t.stepPicture}</span>
          <div className="emoji-grid" role="radiogroup" aria-label={t.stepPicture}>
            {stepEmojis.map((e) => (
              <button type="button" key={e} role="radio" aria-checked={emoji === e} className={`emoji-option ${emoji === e ? 'is-on' : ''}`} onClick={() => setEmoji(e)}>
                {e}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" className="btn btn-sm btn-dash" disabled={!title.trim()}>
          + {t.addStep}
        </button>
      </form>

      {members.map((m) => {
        const steps = planFor(draft, m.id)
        return (
          <section key={m.id} className="owner-section">
            <h2 className="owner-head">
              <Avatar member={m} size={32} />
              <span className="p5-medium">{t.stepsOf(m.name)}</span>
              {steps[0] && <span className="p6 muted tabular">{t.startsAt(formatClock(steps[0].start))}</span>}
            </h2>
            {steps.length === 0 ? (
              <p className="p6 muted">{t.noSteps}</p>
            ) : (
              <ol className="edit-steps">
                {steps.map((s) => (
                  <li key={s.id} className="edit-step">
                    <span className="p6 muted tabular">
                      {formatClock(s.start)}
                      <br />
                      {formatClock(s.end)}
                    </span>
                    <span className="p5 edit-step-title">
                      {s.emoji} {s.title}
                    </span>
                    <span className="p6-medium tabular">{t.minutes(s.minutes)}</span>
                    <span className="edit-step-actions">
                      <button className="btn btn-icon btn-xsm btn-tertiary" aria-label={t.moveUp} onClick={() => update({ steps: moveWithinOwner(draft.steps, s.id, -1) })}>
                        ↑
                      </button>
                      <button className="btn btn-icon btn-xsm btn-tertiary" aria-label={t.moveDown} onClick={() => update({ steps: moveWithinOwner(draft.steps, s.id, 1) })}>
                        ↓
                      </button>
                      <button
                        className="btn btn-icon btn-xsm btn-destructive-ghost"
                        aria-label={t.removeStep}
                        onClick={() => update({ steps: draft.steps.filter((x) => x.id !== s.id) })}
                      >
                        ✕
                      </button>
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </section>
        )
      })}
    </div>
  )
}
