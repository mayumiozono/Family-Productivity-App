const DIRS = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
} as const

/**
 * TV remote navigation: arrow keys move focus to the nearest focusable
 * element in that direction inside `root`. Returns true when it handled the key.
 */
export function moveFocus(root: HTMLElement, key: string): boolean {
  const dir = DIRS[key as keyof typeof DIRS]
  if (!dir) return false
  const items = [...root.querySelectorAll<HTMLElement>('button:not([disabled]), [data-focusable]')].filter(
    (el) => el.offsetParent !== null,
  )
  if (!items.length) return false
  const active = document.activeElement as HTMLElement | null
  if (!active || !root.contains(active) || !items.includes(active)) {
    items[0].focus()
    return true
  }
  const from = active.getBoundingClientRect()
  const fx = from.left + from.width / 2
  const fy = from.top + from.height / 2
  let best: HTMLElement | undefined
  let bestScore = Infinity
  for (const el of items) {
    if (el === active) continue
    const r = el.getBoundingClientRect()
    const dx = r.left + r.width / 2 - fx
    const dy = r.top + r.height / 2 - fy
    const along = dx * dir[0] + dy * dir[1]
    if (along <= 1) continue
    const across = Math.abs(dx * dir[1] + dy * dir[0])
    const score = along + across * 2
    if (score < bestScore) {
      bestScore = score
      best = el
    }
  }
  best?.focus()
  return true
}
