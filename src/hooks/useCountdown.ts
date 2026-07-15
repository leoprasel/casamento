import { useEffect, useState } from 'react'

export interface Countdown {
  days: string
  hours: string
  mins: string
  secs: string
  done: boolean
}

function compute(target: number): Countdown {
  let diff = Math.max(0, target - Date.now())
  const done = diff === 0
  const d = Math.floor(diff / 86400000)
  diff -= d * 86400000
  const h = Math.floor(diff / 3600000)
  diff -= h * 3600000
  const m = Math.floor(diff / 60000)
  diff -= m * 60000
  const s = Math.floor(diff / 1000)
  const pad = (n: number) => String(n).padStart(2, '0')
  return { days: String(d), hours: pad(h), mins: pad(m), secs: pad(s), done }
}

/** Live countdown to an ISO datetime; days is a plain integer, h/m/s padded. */
export function useCountdown(iso: string): Countdown {
  const target = new Date(iso).getTime()
  const [value, setValue] = useState<Countdown>(() => compute(target))

  useEffect(() => {
    const id = window.setInterval(() => setValue(compute(target)), 1000)
    return () => window.clearInterval(id)
  }, [target])

  return value
}
