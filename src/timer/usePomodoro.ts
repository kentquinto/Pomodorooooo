import { useState } from 'react'
import {
  INITIAL_CYCLE,
  advance,
  phaseDurationMs,
  type Durations,
} from './session'
import { useCountdown } from './useCountdown'

/**
 * The whole timer: which phase we are in, and the countdown for it.
 * Durations are read whenever a phase is loaded, so a change made during a
 * session applies from the next one.
 */
export function usePomodoro(durations: Durations) {
  const [cycle, setCycle] = useState(INITIAL_CYCLE)
  const countdown = useCountdown(
    phaseDurationMs(INITIAL_CYCLE.phase, durations),
    goToNextPhase,
  )

  function goToNextPhase() {
    const next = advance(cycle)
    setCycle(next)
    countdown.reset(phaseDurationMs(next.phase, durations))
  }

  function reset() {
    countdown.reset(phaseDurationMs(cycle.phase, durations))
  }

  return {
    phase: cycle.phase,
    status: countdown.status,
    remainingMs: countdown.remainingMs,
    start: countdown.start,
    pause: countdown.pause,
    reset,
    skip: goToNextPhase,
  }
}
