import { describe, expect, it } from 'vitest'
import {
  createCountdown,
  getRemainingMs,
  pauseCountdown,
  startCountdown,
} from './countdown'

const MINUTE = 60_000

describe('countdown', () => {
  it('starts idle with the full duration', () => {
    const countdown = createCountdown(25 * MINUTE)
    expect(countdown).toEqual({ status: 'idle', remainingMs: 25 * MINUTE })
    expect(getRemainingMs(countdown, 999_999)).toBe(25 * MINUTE)
  })

  it('stores the end timestamp on start', () => {
    const running = startCountdown(createCountdown(25 * MINUTE), 1_000)
    expect(running).toEqual({ status: 'running', endsAt: 1_000 + 25 * MINUTE })
  })

  it('computes the remaining time from the end timestamp, not from ticks', () => {
    const running = startCountdown(createCountdown(25 * MINUTE), 0)
    expect(getRemainingMs(running, 1_000)).toBe(25 * MINUTE - 1_000)
    // Five minutes later, however many ticks the browser skipped.
    expect(getRemainingMs(running, 5 * MINUTE)).toBe(20 * MINUTE)
  })

  it('never goes below zero', () => {
    const running = startCountdown(createCountdown(MINUTE), 0)
    expect(getRemainingMs(running, 10 * MINUTE)).toBe(0)
  })

  it('keeps the exact remaining time across pause and resume', () => {
    const running = startCountdown(createCountdown(25 * MINUTE), 0)
    const paused = pauseCountdown(running, 10_123)
    expect(paused).toEqual({
      status: 'paused',
      remainingMs: 25 * MINUTE - 10_123,
    })

    // Staying paused for an hour changes nothing.
    expect(getRemainingMs(paused, 60 * MINUTE)).toBe(25 * MINUTE - 10_123)

    const resumed = startCountdown(paused, 60 * MINUTE)
    expect(getRemainingMs(resumed, 60 * MINUTE)).toBe(25 * MINUTE - 10_123)
    expect(getRemainingMs(resumed, 60 * MINUTE + 1_000)).toBe(
      25 * MINUTE - 11_123,
    )
  })

  it('ignores start when already running', () => {
    const running = startCountdown(createCountdown(MINUTE), 0)
    expect(startCountdown(running, 30_000)).toBe(running)
  })

  it('ignores pause when not running', () => {
    const idle = createCountdown(MINUTE)
    expect(pauseCountdown(idle, 30_000)).toBe(idle)
  })
})
