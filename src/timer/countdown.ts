/**
 * A countdown that never drifts: while running it stores only the moment it
 * ends, and the time left is always (end time - now). Browsers slow down
 * timers in background tabs, so counting ticks would lose time; reading the
 * clock does not.
 */
export type Countdown =
  | { status: 'idle'; remainingMs: number }
  | { status: 'running'; endsAt: number }
  | { status: 'paused'; remainingMs: number }

export function createCountdown(durationMs: number): Countdown {
  return { status: 'idle', remainingMs: durationMs }
}

/** Starts or resumes: the end time is now plus whatever time is left. */
export function startCountdown(countdown: Countdown, now: number): Countdown {
  if (countdown.status === 'running') return countdown
  return { status: 'running', endsAt: now + countdown.remainingMs }
}

/** Freezes the time left, so resuming later continues from exactly here. */
export function pauseCountdown(countdown: Countdown, now: number): Countdown {
  if (countdown.status !== 'running') return countdown
  return { status: 'paused', remainingMs: getRemainingMs(countdown, now) }
}

export function getRemainingMs(countdown: Countdown, now: number): number {
  if (countdown.status !== 'running') return countdown.remainingMs
  return Math.max(0, countdown.endsAt - now)
}
