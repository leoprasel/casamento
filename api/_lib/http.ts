import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * Lock CORS to the site origin (PLAN 5.1.5). Returns true if the request should
 * short-circuit (OPTIONS preflight already answered).
 */
export function applyCors(req: VercelRequest, res: VercelResponse): boolean {
  const allowed = process.env.ALLOWED_ORIGIN
  const origin = req.headers.origin

  if (allowed && origin === allowed) {
    res.setHeader('Access-Control-Allow-Origin', allowed)
  } else if (!allowed) {
    // No lock configured (e.g. local/preview) — reflect the caller's origin.
    if (origin) res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Vary', 'Origin')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return true
  }
  return false
}

/**
 * Best-effort in-memory IP throttle (PLAN 5.1.5). Serverless instances are
 * ephemeral, so this only smooths bursts within a warm instance — enough to
 * blunt casual endpoint probing at wedding scale.
 */
const HITS = new Map<string, { count: number; resetAt: number }>()
const WINDOW_MS = 60_000
const MAX_HITS = 10

export function rateLimited(req: VercelRequest): boolean {
  const fwd = req.headers['x-forwarded-for']
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd)?.split(',')[0]?.trim() || 'unknown'
  const now = Date.now()
  const entry = HITS.get(ip)

  if (!entry || now > entry.resetAt) {
    HITS.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }
  entry.count += 1
  return entry.count > MAX_HITS
}
