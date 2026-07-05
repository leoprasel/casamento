import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { gifts, categories, type Gift, type CategoryId } from '@/lib/gifts'
import GiftCard from '@/components/GiftCard'
import CheckoutModal from '@/components/CheckoutModal'

/**
 * Gift registry section (PLAN 4.1): filterable grid of symbolic gifts, each
 * opening the checkout modal. Framed as symbolic contributions, not sales
 * (TIPS #18) — no cart, no "comprar".
 */
export default function Registry() {
  const [filter, setFilter] = useState<CategoryId | 'all'>('all')
  const [selected, setSelected] = useState<Gift | null>(null)

  const visible = useMemo(
    () => (filter === 'all' ? gifts : gifts.filter((g) => g.category === filter)),
    [filter],
  )

  return (
    <section id="presentes" className="bg-blush-50 px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="font-serif text-sm uppercase tracking-[0.35em] text-ink-muted">
            Lista de presentes
          </p>
          <h2 className="mt-3 font-script text-title text-blush-500">Nos presenteie</h2>
          <p className="mx-auto mt-5 max-w-xl font-serif text-lg text-ink-soft">
            Sua presença é o nosso maior presente. Mas, se quiser nos mimar, escolha uma
            lembrança simbólica abaixo — com carinho, do jeitinho que você preferir. 💝
          </p>
        </div>

        {/* Category filter chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-2">
          <Chip active={filter === 'all'} onClick={() => setFilter('all')}>
            Todos
          </Chip>
          {categories.map((c) => (
            <Chip key={c.id} active={filter === c.id} onClick={() => setFilter(c.id)}>
              {c.label}
            </Chip>
          ))}
        </div>

        {/* Grid: 2 cols mobile, 3-4 desktop */}
        <motion.div
          layout
          className="mt-10 grid grid-cols-2 gap-5 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4"
        >
          {visible.map((gift) => (
            <GiftCard key={gift.id} gift={gift} onSelect={setSelected} />
          ))}
        </motion.div>
      </div>

      <CheckoutModal gift={selected} onClose={() => setSelected(null)} />
    </section>
  )
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 font-serif text-base transition-colors ${
        active
          ? 'bg-blush-500 text-ivory shadow-card'
          : 'bg-ivory text-ink-soft hover:bg-blush-100'
      }`}
    >
      {children}
    </button>
  )
}
