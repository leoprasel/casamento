import { z } from 'zod'

/**
 * Gift schema — the single source of truth for gift shape and validation.
 * Imports ONLY zod (no path aliases, no data import) so the Vercel serverless
 * card-checkout function can reuse it verbatim to validate prices server-side
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

export const categories = [
  { id: 'lua-de-mel', label: 'Lua de mel' },
  { id: 'casa-nova', label: 'Casa nova' },
  { id: 'experiencias', label: 'Experiências' },
] as const

export type CategoryId = (typeof categories)[number]['id']
