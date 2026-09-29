import { useCallback, useEffect, useRef, useState } from 'react';
import { DURATION_MINUTES, REAL_SECONDS_FOR_ROUTINE } from './data';

const SIM_MINUTES_PER_REAL_MS = DURATION_MINUTES / (REAL_SECONDS_FOR_ROUTINE * 1000);

/** Relógio acelerado: `elapsed` são minutos simulados desde 09:00, parando no horário de saída. */
export function useSimulatedClock() {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const last = useRef<number | null>(null);

  useEffect(() => {
    if (!running) return;
    let frame = 0;
    last.current = performance.now();
    const tick = (now: number) => {
      const delta = now - (last.current ?? now);
      last.current = now;
      setElapsed((e) => Math.min(DURATION_MINUTES, e + delta * SIM_MINUTES_PER_REAL_MS));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const ended = elapsed >= DURATION_MINUTES;
  useEffect(() => {
    if (ended) setRunning(false);
  }, [ended]);

  const toggle = useCallback(() => setRunning((r) => !r), []);
  const reset = useCallback(() => {
    setRunning(false);
    setElapsed(0);
  }, []);

  return { elapsed, running, ended, toggle, reset };
}
