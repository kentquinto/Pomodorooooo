import { describe, expect, it } from 'vitest'
import {
  DEFAULT_DURATIONS,
  INITIAL_CYCLE,
  advance,
  phaseDurationMs,
  type Cycle,
} from './session'

function advanceTimes(cycle: Cycle, times: number): Cycle {
  let result = cycle
  for (let i = 0; i < times; i++) result = advance(result)
  return result
}

describe('advance', () => {
  it('starts with a work session', () => {
    expect(INITIAL_CYCLE).toEqual({ phase: 'work', workDone: 0 })
  })

  it('goes to a short break after the first three work sessions', () => {
    expect(advance({ phase: 'work', workDone: 0 })).toEqual({
      phase: 'shortBreak',
      workDone: 1,
    })
    expect(advance({ phase: 'work', workDone: 2 })).toEqual({
      phase: 'shortBreak',
      workDone: 3,
    })
  })

  it('goes to a long break after the fourth work session', () => {
    expect(advance({ phase: 'work', workDone: 3 })).toEqual({
      phase: 'longBreak',
      workDone: 4,
    })
  })

  it('goes back to work after a short break, keeping the count', () => {
    expect(advance({ phase: 'shortBreak', workDone: 2 })).toEqual({
      phase: 'work',
      workDone: 2,
    })
  })

  it('starts a new cycle after the long break', () => {
    expect(advance({ phase: 'longBreak', workDone: 4 })).toEqual({
      phase: 'work',
      workDone: 0,
    })
  })

  it('follows the full order work, short, work, short, work, short, work, long', () => {
    const phases = []
    let cycle = INITIAL_CYCLE
    for (let i = 0; i < 9; i++) {
      phases.push(cycle.phase)
      cycle = advance(cycle)
    }
    expect(phases).toEqual([
      'work',
      'shortBreak',
      'work',
      'shortBreak',
      'work',
      'shortBreak',
      'work',
      'longBreak',
      'work',
    ])
  })

  it('gives the long break again after the 8th work session, not the 5th', () => {
    // Two full cycles are 16 phases; the 16th is the second long break.
    expect(advanceTimes(INITIAL_CYCLE, 9).phase).toBe('shortBreak')
    expect(advanceTimes(INITIAL_CYCLE, 15).phase).toBe('longBreak')
  })
})

describe('phaseDurationMs', () => {
  it('uses 25, 5 and 15 minutes by default', () => {
    expect(phaseDurationMs('work', DEFAULT_DURATIONS)).toBe(25 * 60_000)
    expect(phaseDurationMs('shortBreak', DEFAULT_DURATIONS)).toBe(5 * 60_000)
    expect(phaseDurationMs('longBreak', DEFAULT_DURATIONS)).toBe(15 * 60_000)
  })

  it('uses custom durations when given', () => {
    const durations = { work: 50, shortBreak: 10, longBreak: 30 }
    expect(phaseDurationMs('work', durations)).toBe(50 * 60_000)
    expect(phaseDurationMs('longBreak', durations)).toBe(30 * 60_000)
  })
})
