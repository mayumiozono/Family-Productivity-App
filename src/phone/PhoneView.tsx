import { useState } from 'react'
import { t } from '../i18n/pt-BR'
import { RoutinesTab } from './RoutinesTab'
import { SummaryTab } from './SummaryTab'
import { TodayTab } from './TodayTab'

type Tab = 'today' | 'routines' | 'summary'

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'today',
    label: t.tabToday,
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'routines',
    label: t.tabRoutines,
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path d="M9 6.5h11M9 12h11M9 17.5h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="4.5" cy="6.5" r="1.3" fill="currentColor" />
        <circle cx="4.5" cy="12" r="1.3" fill="currentColor" />
        <circle cx="4.5" cy="17.5" r="1.3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'summary',
    label: t.tabSummary,
    icon: (
      <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
        <path d="M4 20V13M10 20V8M16 20v-9M22 20H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
]

export function PhoneView() {
  const [tab, setTab] = useState<Tab>('today')
  return (
    <div className="phone">
      <div className="phone-scroll">
        {tab === 'today' && <TodayTab />}
        {tab === 'routines' && <RoutinesTab />}
        {tab === 'summary' && <SummaryTab />}
      </div>
      <nav className="phone-tabs" aria-label="Seções">
        {TABS.map((item) => (
          <button key={item.id} className={`phone-tab ${tab === item.id ? 'is-active' : ''}`} aria-current={tab === item.id ? 'page' : undefined} onClick={() => setTab(item.id)}>
            {item.icon}
            <span className="p6-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
