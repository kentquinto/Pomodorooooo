import { useCallback, useEffect, useRef, useState } from 'react'
import {
  createCountdown,
  getRemainingMs,
  pauseCountdown,
  startCountdown,
  type Countdown,
} from './countdown'

/** How often the display refreshes. The time itself comes from the clock. */
const TICK_MS = 250

/**
 * Runs a drift-free countdown. `initialDurationMs` is read once; load a new
 * duration with `reset`, so a settings change never alters a running session.
 */
export function useCountdown(initialDurationMs: number, onFinish: () => void) {
  const [countdown, setCountdown] = useState<Countdown>(() =>
    createCountdown(initialDurationMs),
  )
  const [now, setNow] = useState(() => Date.now())

  // Always call the latest onFinish without restarting the interval.
  const onFinishRef = useRef(onFinish)
  useEffect(() => {
    onFinishRef.current = onFinish
  })

  useEffect(() => {
    if (countdown.status !== 'running') return

    const stop = () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', tick)
    }

    const tick = () => {
      const time = Date.now()
      if (getRemainingMs(countdown, time) === 0) {
        // Stop before anything else, so a burst of late ticks finishes once.
        stop()
        setCountdown(createCountdown(0))
        onFinishRef.current()
      } else {
        setNow(time)
      }
    }

    const interval = setInterval(tick, TICK_MS)
    document.addEventListener('visibilitychange', tick)
    return stop
  }, [countdown])

  const start = useCallback(() => {
    const time = Date.now()
    setNow(time)
    setCountdown((current) => startCountdown(current, time))
  }, [])

  const pause = useCallback(() => {
    const time = Date.now()
    setNow(time)
    setCountdown((current) => pauseCountdown(current, time))
  }, [])

  const reset = useCallback((durationMs: number) => {
    setCountdown(createCountdown(durationMs))
  }, [])

  return {
    status: countdown.status,
    remainingMs: getRemainingMs(countdown, now),
    start,
    pause,
    reset,
  }
}
