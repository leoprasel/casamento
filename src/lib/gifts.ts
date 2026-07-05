import { z } from 'zod'
import giftsData from '@/data/gifts.json'

/**
 * Zod schema for a gift. The serverless card-checkout function reuses this
 * schema against its own copy of gifts.json to validate prices server-side
 * (never trust the client price — TIPS #8).
 */
export const giftSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  price: z.number().nonnegative(),
  image: z.string(),
  category: z.enum(['lua-de-mel', 'casa-nova', 'experiencias']),
  claimed: z.boolean().default(false),
  featured: z.boolean().default(false),
  /** When true this is the "valor livre" card with a guest-entered amount. */
  freeAmount: z.boolean().optional(),
})

export type Gift = z.infer<typeof giftSchema>

export const giftsArraySchema = z.array(giftSchema)

/** Parsed + validated gift catalog. Throws at import time if data is malformed. */
export const gifts: Gift[] = giftsArraySchema.parse(giftsData)

export const categories = [
  { id: 'lua-de-mel', label: 'Lua de mel' },
  { id: 'casa-nova', label: 'Casa nova' },
  { id: 'experiencias', label: 'Experiências' },
] as const

export type CategoryId = (typeof categories)[number]['id']

export function getGiftById(id: string): Gift | undefined {
  return gifts.find((g) => g.id === id)
}
