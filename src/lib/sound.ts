let ctx: AudioContext | undefined

/** A soft two-note chime; stands in for Alexa's spoken reminder in the demo. */
export function chime() {
  try {
    ctx ??= new AudioContext()
    const start = ctx.currentTime
    ;[660, 880].forEach((freq, i) => {
      const osc = ctx!.createOscillator()
      const gain = ctx!.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      const t0 = start + i * 0.35
      gain.gain.setValueAtTime(0, t0)
      gain.gain.linearRampToValueAtTime(0.2, t0 + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6)
      osc.connect(gain).connect(ctx!.destination)
      osc.start(t0)
      osc.stop(t0 + 0.65)
    })
  } catch {
    // Audio may be unavailable; the on-screen banner still shows.
  }
}
