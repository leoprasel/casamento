import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Supabase client for INSERT-only guest messages (TIPS #29). The anon key is
 * public-safe *only* because the `messages` table has RLS: anon may INSERT,
 * nothing else. Never add a public SELECT policy.
 */

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

let client: SupabaseClient | null = null
if (url && anonKey) {
  client = createClient(url, anonKey, {
    auth: { persistSession: false },
  })
}

/** True when Supabase is configured — the UI degrades gracefully if not. */
export const isSupabaseConfigured = client !== null

// Input limits (TIPS #30): sanitize by length; React escapes on render.
export const NAME_MAX = 80
export const MESSAGE_MAX = 500

export interface GuestMessage {
  guestName: string
  message: string
  giftId?: string | null
  amount?: number | null
  method: 'pix' | 'card'
}

export interface InsertResult {
  ok: boolean
  error?: string
}

export async function insertMessage(input: GuestMessage): Promise<InsertResult> {
  if (!client) {
    return { ok: false, error: 'not-configured' }
  }

  const guest_name = input.guestName.trim().slice(0, NAME_MAX)
  const message = input.message.trim().slice(0, MESSAGE_MAX)

  const { error } = await client.from('messages').insert({
    guest_name,
    message,
    gift_id: input.giftId ?? null,
    amount: input.amount ?? null,
    method: input.method,
  })

  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}

export interface Rsvp {
  guestName: string
  guests: number
  attending: boolean
  note?: string
}

export async function insertRsvp(input: Rsvp): Promise<InsertResult> {
  if (!client) {
    return { ok: false, error: 'not-configured' }
  }

  const { error } = await client.from('rsvps').insert({
    guest_name: input.guestName.trim().slice(0, NAME_MAX),
    guests: Math.max(1, Math.min(20, Math.round(input.guests))),
    attending: input.attending,
    note: (input.note ?? '').trim().slice(0, MESSAGE_MAX) || null,
  })

  if (error) {
    return { ok: false, error: error.message }
  }
  return { ok: true }
}
