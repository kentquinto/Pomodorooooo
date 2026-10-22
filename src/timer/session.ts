export type Phase = 'work' | 'shortBreak' | 'longBreak'

/** Length of each phase, in whole minutes. */
export interface Durations {
  work: number
  shortBreak: number
  longBreak: number
}

/**
 * Where we are in the Pomodoro cycle. `workDone` counts the work sessions
 * that ended (finished or skipped) since the last long break.
 */
export interface Cycle {
  phase: Phase
  workDone: number
}

export const DEFAULT_DURATIONS: Durations = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
}

export const WORK_SESSIONS_PER_LONG_BREAK = 4

export const INITIAL_CYCLE: Cycle = { phase: 'work', workDone: 0 }

/** The phase that comes after the current one, whether it finished or was skipped. */
export function advance(cycle: Cycle): Cycle {
  switch (cycle.phase) {
    case 'work': {
      const workDone = cycle.workDone + 1
      const phase =
        workDone >= WORK_SESSIONS_PER_LONG_BREAK ? 'longBreak' : 'shortBreak'
      return { phase, workDone }
    }
    case 'shortBreak':
      return { phase: 'work', workDone: cycle.workDone }
    case 'longBreak':
      return INITIAL_CYCLE
  }
}

export function phaseDurationMs(phase: Phase, durations: Durations): number {
  return durations[phase] * 60_000
}
