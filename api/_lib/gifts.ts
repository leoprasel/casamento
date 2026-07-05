import giftsData from '../../src/data/gifts.json'
import { giftsArraySchema, type Gift } from '../../src/lib/giftSchema'

/**
 * Server-side copy of the validated gift catalog. The card-checkout function
 * looks up prices HERE, never trusting the amount sent by the browser
 * (TIPS #8). Shares the exact schema used by the frontend.
 */
export const gifts: Gift[] = giftsArraySchema.parse(giftsData)

export function getGiftById(id: string): Gift | undefined {
  return gifts.find((g) => g.id === id)
}

/** Minimum accepted "valor livre" contribution, in BRL. */
export const FREE_MIN = 10

/**
 * Resolve the authoritative charge amount for a gift.
 * - Fixed gifts: always the catalog price (client amount ignored).
 * - "valor livre": the client amount, clamped to >= FREE_MIN.
 * Returns null when the gift is unknown, claimed, or the custom amount is invalid.
 */
export function resolveAmount(gift: Gift, customAmount?: number): number | null {
  if (gift.claimed) return null

  if (gift.freeAmount) {
    if (typeof customAmount !== 'number' || !Number.isFinite(customAmount)) return null
    if (customAmount < FREE_MIN) return null
    return Math.round(customAmount * 100) / 100
  }

  return Math.round(gift.price * 100) / 100
}
