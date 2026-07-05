import { useEffect, useState } from 'react'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  done: boolean
}

function computeTimeLeft(target: number): TimeLeft {
  const diff = target - Date.now()
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  }
  const seconds = Math.floor(diff / 1000)
  return {
    days: Math.floor(seconds / 86400),
    hours: Math.floor((seconds % 86400) / 3600),
    minutes: Math.floor((seconds % 3600) / 60),
    seconds: seconds % 60,
    done: false,
  }
}

const UNITS: { key: keyof Omit<TimeLeft, 'done'>; label: string }[] = [
  { key: 'days', label: 'dias' },
  { key: 'hours', label: 'horas' },
  { key: 'minutes', label: 'min' },
  { key: 'seconds', label: 'seg' },
]

/** Client-side countdown ticking to the wedding datetime (PLAN 2.4). */
export default function Countdown({ date }: { date: string }) {
  const target = new Date(date).getTime()
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => computeTimeLeft(target))

  useEffect(() => {
    const id = window.setInterval(() => setTimeLeft(computeTimeLeft(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])

  if (timeLeft.done) {
    return (
      <p className="font-script text-title text-blush-500">É hoje! 🎉</p>
    )
  }

  return (
    <div className="flex items-start justify-center gap-4 sm:gap-6" aria-label="Contagem regressiva">
      {UNITS.map(({ key, label }) => (
        <div key={key} className="flex min-w-[3.5rem] flex-col items-center">
          <span className="font-serif text-4xl font-semibold tabular-nums text-ink sm:text-5xl">
            {String(timeLeft[key]).padStart(2, '0')}
          </span>
          <span className="mt-1 font-serif text-xs uppercase tracking-[0.25em] text-ink-muted">
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
