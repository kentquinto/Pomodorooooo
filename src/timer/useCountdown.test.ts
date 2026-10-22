import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from './useCountdown'

const MINUTE = 60_000

function setup(durationMs = 25 * MINUTE) {
  const onFinish = vi.fn()
  const hook = renderHook(() => useCountdown(durationMs, onFinish))
  return { ...hook, onFinish }
}

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts idle with the full duration', () => {
    const { result } = setup()
    expect(result.current.status).toBe('idle')
    expect(result.current.remainingMs).toBe(25 * MINUTE)
  })

  it('counts down while running', () => {
    const { result } = setup()
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3_000))
    expect(result.current.status).toBe('running')
    expect(result.current.remainingMs).toBe(25 * MINUTE - 3_000)
  })

  it('does not drift when the browser skips ticks in a background tab', () => {
    const { result } = setup()
    act(() => result.current.start())

    // The clock moves 5 minutes but no tick runs, as in a throttled tab.
    vi.setSystemTime(5 * MINUTE)
    act(() => vi.advanceTimersToNextTimer())

    expect(result.current.remainingMs).toBeLessThanOrEqual(20 * MINUTE)
    expect(result.current.remainingMs).toBeGreaterThan(20 * MINUTE - 1_000)
  })

  it('updates at once when the tab becomes visible again', () => {
    const { result } = setup()
    act(() => result.current.start())
    vi.setSystemTime(5 * MINUTE)
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(result.current.remainingMs).toBe(20 * MINUTE)
  })

  it('keeps the exact remaining time across pause and resume', () => {
    const { result } = setup()
    act(() => result.current.start())
    vi.setSystemTime(10_123)
    act(() => result.current.pause())
    expect(result.current.status).toBe('paused')
    expect(result.current.remainingMs).toBe(25 * MINUTE - 10_123)

    act(() => vi.advanceTimersByTime(60 * MINUTE))
    expect(result.current.remainingMs).toBe(25 * MINUTE - 10_123)

    act(() => result.current.start())
    expect(result.current.remainingMs).toBe(25 * MINUTE - 10_123)
  })

  it('calls onFinish once and stops at zero', () => {
    const { result, onFinish } = setup(MINUTE)
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(MINUTE + 5_000))
    expect(onFinish).toHaveBeenCalledTimes(1)
    expect(result.current.status).toBe('idle')
    expect(result.current.remainingMs).toBe(0)

    act(() => vi.advanceTimersByTime(10 * MINUTE))
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('reset loads a new duration and stops the countdown', () => {
    const { result } = setup()
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(3_000))
    act(() => result.current.reset(5 * MINUTE))
    expect(result.current.status).toBe('idle')
    expect(result.current.remainingMs).toBe(5 * MINUTE)

    act(() => vi.advanceTimersByTime(MINUTE))
    expect(result.current.remainingMs).toBe(5 * MINUTE)
  })

  it('ignores a new duration prop until the next reset', () => {
    const onFinish = vi.fn()
    const { result, rerender } = renderHook(
      ({ duration }) => useCountdown(duration, onFinish),
      { initialProps: { duration: 25 * MINUTE } },
    )
    act(() => result.current.start())
    rerender({ duration: 50 * MINUTE })
    act(() => vi.advanceTimersByTime(1_000))
    expect(result.current.remainingMs).toBe(25 * MINUTE - 1_000)
  })
})
