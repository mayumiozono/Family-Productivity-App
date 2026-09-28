import { useLayoutEffect, useRef, useState } from 'react'
import { PauseIcon, PlayIcon } from './components/common'
import { t } from './i18n/pt-BR'
import { formatClock } from './lib/schedule'
import { PhoneView } from './phone/PhoneView'
import { useStore } from './state/store'
import { TvView } from './tv/TvView'

type Screen = 'tv' | 'phone'

export function App() {
  const [screen, setScreen] = useState<Screen>('tv')
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <span className="brand-mark" aria-hidden="true" />
          <span className="p1-semibold">{t.appName}</span>
          <span className="badge badge-info">{t.demoBadge}</span>
        </div>
        <div className="segmented screen-switch" role="group" aria-label="Tela">
          <button aria-pressed={screen === 'tv'} onClick={() => setScreen('tv')}>
            📺 {t.switchTv}
          </button>
          <button aria-pressed={screen === 'phone'} onClick={() => setScreen('phone')}>
            📱 {t.switchPhone}
          </button>
        </div>
        <ClockPill />
      </header>
      <main className="stage">{screen === 'tv' ? <TvStage /> : <PhoneStage />}</main>
    </div>
  )
}

function ClockPill() {
  const { state, dispatch } = useStore()
  return (
    <button className="btn btn-sm btn-secondary-gray clock-pill tabular" aria-label={state.running ? t.pause : t.play} onClick={() => dispatch({ type: 'setRunning', running: !state.running })}>
      {state.running ? <PauseIcon /> : <PlayIcon />} {formatClock(state.now)}
    </button>
  )
}

const TV_W = 1920
const TV_H = 1080

/** Renders the TV at its real 1920×1080 size and scales it to fit the window. */
function TvStage() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.5)
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const fit = () => setScale(Math.min(el.clientWidth / TV_W, (window.innerHeight - 120) / TV_H))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    window.addEventListener('resize', fit)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', fit)
    }
  }, [])
  return (
    <div className="tv-wrap" ref={wrapRef}>
      <div className="tv-bezel" style={{ width: TV_W * scale + 24, height: TV_H * scale + 24 }}>
        <div className="tv-screen" style={{ width: TV_W, height: TV_H, transform: `scale(${scale})` }}>
          <TvView />
        </div>
      </div>
    </div>
  )
}

function PhoneStage() {
  return (
    <div className="phone-wrap">
      <div className="phone-bezel">
        <PhoneView />
      </div>
    </div>
  )
}
