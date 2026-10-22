import { describe, expect, it } from 'vitest'
import { formatTime } from './format'

describe('formatTime', () => {
  it('shows minutes and seconds with two digits each', () => {
    expect(formatTime(25 * 60_000)).toBe('25:00')
    expect(formatTime(5 * 60_000 + 7_000)).toBe('05:07')
  })

  it('rounds up to the next whole second', () => {
    // Just after Start, the full time is still shown.
    expect(formatTime(25 * 60_000 - 1)).toBe('25:00')
    // The last fraction of a second still shows 00:01, never 00:00 early.
    expect(formatTime(1)).toBe('00:01')
  })

  it('shows 00:00 at zero', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('handles durations of an hour or more', () => {
    expect(formatTime(90 * 60_000)).toBe('90:00')
  })
})
