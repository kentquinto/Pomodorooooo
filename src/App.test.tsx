import { act, fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

function setup() {
  const user = userEvent.setup()
  render(<App />)
  return { user }
}

const timeLeft = () => screen.getByRole('timer')
const button = (name: string) => screen.getByRole('button', { name })
const pressSpace = (init: KeyboardEventInit = {}) =>
  fireEvent.keyDown(document.body, { key: ' ', code: 'Space', ...init })

describe('App', () => {
  beforeEach(() => {
    // Only the clock and the tick are faked. Testing Library waits on a real
    // setTimeout after each click, which a fake one would never fire.
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] })
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a stopped focus session of 25 minutes', () => {
    setup()
    expect(screen.getByText('Focus')).toBeInTheDocument()
    expect(timeLeft()).toHaveTextContent('25:00')
    expect(button('Start')).toBeEnabled()
    expect(button('Pause')).toBeDisabled()
  })

  it('counts down after Start and holds after Pause', async () => {
    const { user } = setup()
    await user.click(button('Start'))
    act(() => vi.advanceTimersByTime(61_000))
    expect(timeLeft()).toHaveTextContent('23:59')

    await user.click(button('Pause'))
    act(() => vi.advanceTimersByTime(60_000))
    expect(timeLeft()).toHaveTextContent('23:59')
    expect(button('Start')).toBeEnabled()
  })

  it('Skip loads the short break', async () => {
    const { user } = setup()
    await user.click(button('Skip'))
    expect(screen.getByText('Short break')).toBeInTheDocument()
    expect(timeLeft()).toHaveTextContent('05:00')
  })

  it('Reset puts the time back to the full session', async () => {
    const { user } = setup()
    await user.click(button('Start'))
    act(() => vi.advanceTimersByTime(90_000))
    await user.click(button('Reset'))
    expect(timeLeft()).toHaveTextContent('25:00')
    expect(button('Pause')).toBeDisabled()
  })

  it('Space starts and pauses the timer', () => {
    setup()
    pressSpace()
    expect(button('Pause')).toBeEnabled()
    pressSpace()
    expect(button('Start')).toBeEnabled()
  })

  it('ignores a held-down Space key', () => {
    setup()
    pressSpace()
    pressSpace({ repeat: true })
    expect(button('Pause')).toBeEnabled()
  })

  it('leaves Space on a focused button to that button', () => {
    setup()
    // The browser turns Space on a button into a click; the shortcut stays out.
    fireEvent.keyDown(button('Skip'), { key: ' ', code: 'Space' })
    expect(button('Start')).toBeEnabled()
    expect(screen.getByText('Focus')).toBeInTheDocument()
  })

  it('leaves Space alone while typing in a field', () => {
    setup()
    const input = document.createElement('input')
    document.body.appendChild(input)
    fireEvent.keyDown(input, { key: ' ', code: 'Space' })
    expect(button('Start')).toBeEnabled()
    input.remove()
  })
})
