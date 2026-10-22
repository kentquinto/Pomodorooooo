import { useEffect } from 'react'
import './App.css'
import { formatTime } from './timer/format'
import { DEFAULT_DURATIONS, type Phase } from './timer/session'
import { usePomodoro } from './timer/usePomodoro'

const PHASE_LABELS: Record<Phase, string> = {
  work: 'Focus',
  shortBreak: 'Short break',
  longBreak: 'Long break',
}

// Space on these already does something (press the button, type a space).
const KEEPS_SPACE = 'button, input, textarea, select, [contenteditable="true"]'

function App() {
  const timer = usePomodoro(DEFAULT_DURATIONS)
  const { status, start, pause } = timer
  const running = status === 'running'

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code !== 'Space' || event.repeat) return
      if (event.target instanceof Element && event.target.closest(KEEPS_SPACE))
        return
      event.preventDefault()
      if (running) pause()
      else start()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [running, start, pause])

  return (
    <main className="timer" data-phase={timer.phase}>
      <p className="timer__phase">{PHASE_LABELS[timer.phase]}</p>
      <p className="timer__time" role="timer" aria-label="Time left">
        {formatTime(timer.remainingMs)}
      </p>
      <div className="timer__controls">
        <button
          type="button"
          className="button button--primary"
          onClick={start}
          disabled={running}
        >
          Start
        </button>
        <button
          type="button"
          className="button"
          onClick={pause}
          disabled={!running}
        >
          Pause
        </button>
        <button type="button" className="button" onClick={timer.reset}>
          Reset
        </button>
        <button type="button" className="button" onClick={timer.skip}>
          Skip
        </button>
      </div>
      <p className="timer__hint">
        Press <kbd>Space</kbd> to start or pause
      </p>
    </main>
  )
}

export default App
