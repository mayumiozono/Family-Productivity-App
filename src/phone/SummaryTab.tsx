import { Avatar, WarningIcon, orderMembers } from '../components/common'
import { sampleWeek } from '../data/sample'
import { t } from '../i18n/pt-BR'
import { useStore } from '../state/store'

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

export function SummaryTab() {
  const { state } = useStore()
  const thisWeek = sum(sampleWeek.thisWeek)
  const lastWeek = sum(sampleWeek.lastWeek)
  const members = orderMembers(state.members)
  const max = Math.max(1, ...members.map((m) => sampleWeek.byMember[m.id] ?? 0))
  const stepsById = new Map(state.routines.flatMap((r) => r.steps.map((s) => [s.id, s] as const)))

  return (
    <div className="phone-page">
      <div className="summary-head">
        <h1 className="headline-6">{t.summaryTitle}</h1>
        <span className="badge badge-neutral">{t.exampleBadge}</span>
      </div>
      <p className="p6 muted">{t.exampleNote}</p>

      <section className="summary-hero">
        <span className="p5 muted">{t.lateThisWeek}</span>
        <div className="summary-hero-row">
          <span className="headline-3 tabular">{thisWeek}</span>
          <span className="p5 muted tabular">
            {lastWeek} {t.lateLastWeek}
          </span>
        </div>
      </section>

      <section className="phone-section">
        <h2 className="p5-medium">{t.byPerson}</h2>
        <ul className="bar-list">
          {members.map((m) => {
            const v = sampleWeek.byMember[m.id] ?? 0
            return (
              <li key={m.id} className="bar-row" title={`${m.name}: ${v}`}>
                <Avatar member={m} size={28} />
                <span className="p5 bar-name">{m.name}</span>
                <span className="bar-track">
                  <span className="bar-fill" style={{ width: `${(v / max) * 100}%` }} />
                </span>
                <span className="p5-medium tabular bar-value">{v}</span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="phone-section">
        <h2 className="p5-medium">{t.todayLive}</h2>
        {state.log.length === 0 ? (
          <p className="p6 muted">{t.todayLiveNone}</p>
        ) : (
          <ul className="log-list">
            {state.log.map((entry, i) => {
              const step = stepsById.get(entry.stepId)
              const who = state.members.find((m) => m.id === entry.ownerId)
              return (
                <li key={i} className="log-row">
                  <span className="p5">
                    {who?.emoji} {who?.name} · {step?.emoji} {step?.title}
                  </span>
                  <span className="badge badge-warning">
                    <WarningIcon size={12} /> {entry.skipped ? t.skipped : t.lateEntry(entry.lateBy)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
      <p className="p6 muted">{t.parentsOnly}</p>
    </div>
  )
}
