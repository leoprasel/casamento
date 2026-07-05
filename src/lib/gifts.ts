import giftsData from '@/data/gifts.json'
import { giftsArraySchema, type Gift } from '@/lib/giftSchema'

export {
  giftSchema,
  giftsArraySchema,
  categories,
  type Gift,
  type CategoryId,
} from '@/lib/giftSchema'

/** Parsed + validated gift catalog. Throws at import time if data is malformed. */
export const gifts: Gift[] = giftsArraySchema.parse(giftsData)

export function getGiftById(id: string): Gift | undefined {
  return gifts.find((g) => g.id === id)
}
