import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_DURATIONS, type Durations } from './session'
import { usePomodoro } from './usePomodoro'

const MINUTE = 60_000

function setup(durations: Durations = DEFAULT_DURATIONS) {
  return renderHook((props) => usePomodoro(props.durations), {
    initialProps: { durations },
  })
}

describe('usePomodoro', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('starts on a stopped 25 minute work session', () => {
    const { result } = setup()
    expect(result.current.phase).toBe('work')
    expect(result.current.status).toBe('idle')
    expect(result.current.remainingMs).toBe(25 * MINUTE)
  })

  it('loads the short break when a work session finishes, without starting it', () => {
    const { result } = setup()
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(25 * MINUTE + 1_000))
    expect(result.current.phase).toBe('shortBreak')
    expect(result.current.status).toBe('idle')
    expect(result.current.remainingMs).toBe(5 * MINUTE)
  })

  it('skip moves to the next phase and stops the countdown', () => {
    const { result } = setup()
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(MINUTE))
    act(() => result.current.skip())
    expect(result.current.phase).toBe('shortBreak')
    expect(result.current.status).toBe('idle')
    expect(result.current.remainingMs).toBe(5 * MINUTE)
  })

  it('reaches the long break after the fourth work session', () => {
    const { result } = setup()
    for (let i = 0; i < 7; i++) act(() => result.current.skip())
    expect(result.current.phase).toBe('longBreak')
    expect(result.current.remainingMs).toBe(15 * MINUTE)
  })

  it('reset puts the current phase back to its full time', () => {
    const { result } = setup()
    act(() => result.current.skip())
    act(() => result.current.start())
    act(() => vi.advanceTimersByTime(2 * MINUTE))
    act(() => result.current.reset())
    expect(result.current.phase).toBe('shortBreak')
    expect(result.current.status).toBe('idle')
    expect(result.current.remainingMs).toBe(5 * MINUTE)
  })

  it('applies changed durations from the next session, not the running one', () => {
    const { result, rerender } = setup()
    act(() => result.current.start())
    rerender({ durations: { work: 50, shortBreak: 10, longBreak: 30 } })
    act(() => vi.advanceTimersByTime(MINUTE))
    expect(result.current.remainingMs).toBe(24 * MINUTE)

    act(() => result.current.skip())
    expect(result.current.remainingMs).toBe(10 * MINUTE)
  })
})
