import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * POST /api/asaas-webhook (PLAN 5.3, optional)
 *
 * Receives Asaas payment events. Anyone can POST to a public URL, so the
 * shared token MUST be validated (TIPS #12) or an attacker could fake
 * "payment confirmed" events. On PAYMENT_CONFIRMED/RECEIVED we forward a row
 * to Supabase (best-effort) for automatic card reconciliation.
 */

const WEBHOOK_TOKEN = process.env.ASAAS_WEBHOOK_TOKEN
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY

interface AsaasEvent {
  event?: string
  payment?: {
    id?: string
    value?: number
    description?: string
    externalReference?: string
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  // Asaas sends the configured token in this header.
  const token = req.headers['asaas-access-token']
  if (!WEBHOOK_TOKEN || token !== WEBHOOK_TOKEN) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const body = req.body as AsaasEvent
  const confirmed = body.event === 'PAYMENT_CONFIRMED' || body.event === 'PAYMENT_RECEIVED'

  if (confirmed && body.payment && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          Prefer: 'return=minimal',
        },
        body: JSON.stringify({
          guest_name: 'Asaas',
          message: `Pagamento confirmado: ${body.payment.description ?? ''}`,
          gift_id: body.payment.externalReference ?? null,
          amount: body.payment.value ?? null,
          method: 'card',
        }),
      })
    } catch {
      // Never fail the webhook on a downstream error — Asaas would retry.
    }
  }

  // Always 200 so Asaas stops retrying a validated event.
  res.status(200).json({ received: true })
}
