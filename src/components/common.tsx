import type { Member } from '../data/types'

export function Avatar({ member, size = 48 }: { member: Member; size?: number }) {
  return (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.55 }} aria-hidden="true">
      {member.emoji}
    </span>
  )
}

/** Circular visual timer: the ring empties as the step's time runs out. */
export function TimerRing({
  fraction,
  late,
  size,
  children,
}: {
  fraction: number
  late: boolean
  size: number
  children?: React.ReactNode
}) {
  const stroke = Math.max(8, size / 18)
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const shown = late ? 1 : Math.min(1, Math.max(0, fraction))
  return (
    <div className="timer-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--neutral-support-light)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={late ? 'var(--warning-main)' : 'var(--primary-main)'}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - shown)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          className="timer-ring-progress"
        />
      </svg>
      <div className="timer-ring-content">{children}</div>
    </div>
  )
}

export function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function WarningIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M8 2l6.5 11.5h-13z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 6.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8" cy="11.5" r="0.9" fill="currentColor" />
    </svg>
  )
}

/** Sorts kids youngest first, then parents, so the TV reads left to right by age. */
export function orderMembers(members: Member[]): Member[] {
  const kids = members.filter((m) => !m.isParent).sort((a, b) => (a.age ?? 0) - (b.age ?? 0))
  return [...kids, ...members.filter((m) => m.isParent)]
}

export function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <path d="M4 2.5v11l9-5.5z" fill="currentColor" />
    </svg>
  )
}

export function PauseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" fill="currentColor" />
    </svg>
  )
}
