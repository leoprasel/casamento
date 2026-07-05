import { useState } from 'react'
import { motion } from 'framer-motion'
import type { Gift } from '@/lib/gifts'
import { formatBRL } from '@/lib/format'

interface GiftCardProps {
  gift: Gift
  onSelect: (gift: Gift) => void
}

/**
 * Gift card following the "Gift card anatomy" spec (README §4): 4:3 illustration
 * in a soft paper-textured frame, a hanging price-tag over the image corner,
 * serif title, one-line playful description, full-width "Presentear" button.
 * Hover: 4px lift + soft shadow. Claimed state: wax-seal badge + desaturation.
 */
export default function GiftCard({ gift, onSelect }: GiftCardProps) {
  const [imgOk, setImgOk] = useState(true)
  const disabled = gift.claimed

  return (
    <motion.article
      whileHover={disabled ? undefined : { y: -4 }}
      transition={{ duration: 0.15 }}
      className="group flex flex-col overflow-hidden rounded-2xl bg-ivory shadow-card transition-shadow hover:shadow-lift"
    >
      {/* Illustration frame (4:3) */}
      <div className="relative aspect-[4/3] overflow-hidden bg-champagne-100">
        {imgOk ? (
          <img
            src={gift.image}
            alt={gift.title}
            loading="lazy"
            onError={() => setImgOk(false)}
            className={`h-full w-full object-cover transition duration-300 ${
              disabled ? 'grayscale-[60%]' : 'group-hover:scale-[1.03]'
            }`}
          />
        ) : (
          <IllustrationPlaceholder title={gift.title} dimmed={disabled} />
        )}

        {/* Hanging price tag */}
        {!gift.freeAmount && (
          <div className="absolute right-3 top-3 rotate-3 rounded-md bg-blush-500 px-3 py-1 shadow-seal">
            <span className="font-serif text-lg font-semibold tabular-nums text-ivory">
              {formatBRL(gift.price)}
            </span>
          </div>
        )}
        {gift.freeAmount && (
          <div className="absolute right-3 top-3 rotate-3 rounded-md bg-gold px-3 py-1 shadow-seal">
            <span className="font-serif text-sm font-semibold text-ivory">valor livre</span>
          </div>
        )}

        {/* Claimed wax-seal badge */}
        {disabled && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="flex h-24 w-24 -rotate-6 items-center justify-center rounded-full bg-blush-500/90 text-center font-script text-lg leading-tight text-ivory shadow-seal">
              Presenteado 💝
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-2xl font-semibold text-ink">{gift.title}</h3>
        <p className="mt-1 flex-1 font-serif text-base text-ink-muted">{gift.description}</p>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelect(gift)}
          className="btn-primary mt-4 w-full"
        >
          {disabled ? 'Presenteado 💝' : 'Presentear 🎁'}
        </button>
      </div>
    </motion.article>
  )
}

/** Elegant styled fallback shown until real illustrations are dropped in. */
function IllustrationPlaceholder({ title, dimmed }: { title: string; dimmed: boolean }) {
  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-paper-texture bg-gradient-to-br from-blush-100 to-champagne-200 ${
        dimmed ? 'grayscale-[60%]' : ''
      }`}
    >
      <span className="px-6 text-center font-script text-3xl text-blush-500/80">{title}</span>
    </div>
  )
}
