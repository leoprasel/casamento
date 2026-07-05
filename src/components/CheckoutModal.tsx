import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Gift } from '@/lib/gifts'
import { formatBRL } from '@/lib/format'
import PixScreen from '@/components/PixScreen'
import CardScreen from '@/components/CardScreen'

interface CheckoutModalProps {
  gift: Gift | null
  onClose: () => void
}

type Step = 'amount' | 'method' | 'pix' | 'card'

const FREE_MIN = 10

/**
 * Checkout modal (PLAN 4.2). Step order:
 *   (valor livre only) amount → method choice → Pix | Card.
 * Pix is the visually dominant, first-listed option (fee strategy, README §5).
 */
export default function CheckoutModal({ gift, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<Step>('method')
  const [amount, setAmount] = useState(0)
  const [freeInput, setFreeInput] = useState('')

  // Reset state whenever a new gift opens the modal.
  useEffect(() => {
    if (gift) {
      if (gift.freeAmount) {
        setStep('amount')
        setAmount(0)
        setFreeInput('')
      } else {
        setStep('method')
        setAmount(gift.price)
      }
    }
  }, [gift])

  // Escape closes; lock body scroll while open.
  useEffect(() => {
    if (!gift) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [gift, onClose])

  return (
    <AnimatePresence>
      {gift && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Presentear: ${gift.title}`}
            className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-ivory p-6 shadow-lift sm:rounded-3xl"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-ink">{gift.title}</h2>
                <p className="font-serif text-base text-ink-muted">{gift.description}</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="shrink-0 rounded-full p-2 text-ink-muted hover:bg-blush-50"
              >
                ✕
              </button>
            </div>

            {step === 'amount' && (
              <FreeAmount
                value={freeInput}
                onChange={setFreeInput}
                onConfirm={(v) => {
                  setAmount(v)
                  setStep('method')
                }}
              />
            )}

            {step === 'method' && (
              <MethodChoice
                amount={amount}
                onPix={() => setStep('pix')}
                onCard={() => setStep('card')}
              />
            )}

            {step === 'pix' && <PixScreen gift={gift} amount={amount} onClose={onClose} />}

            {step === 'card' && (
              <CardScreen gift={gift} amount={amount} onUsePix={() => setStep('pix')} />
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function FreeAmount({
  value,
  onChange,
  onConfirm,
}: {
  value: string
  onChange: (v: string) => void
  onConfirm: (amount: number) => void
}) {
  const parsed = Number(value.replace(',', '.'))
  const valid = Number.isFinite(parsed) && parsed >= FREE_MIN

  return (
    <div className="flex flex-col gap-4">
      <p className="font-serif text-lg text-ink-soft">
        Escolha o valor da sua contribuição (mínimo {formatBRL(FREE_MIN)}):
      </p>
      <div className="flex items-center gap-2 rounded-xl border border-blush-200 bg-ivory px-4 py-3">
        <span className="font-serif text-xl text-ink-muted">R$</span>
        <input
          type="number"
          min={FREE_MIN}
          step="1"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="100"
          className="w-full bg-transparent font-serif text-xl text-ink outline-none"
        />
      </div>
      <button
        type="button"
        disabled={!valid}
        onClick={() => onConfirm(Math.round(parsed * 100) / 100)}
        className="btn-primary w-full"
      >
        Continuar
      </button>
    </div>
  )
}

function MethodChoice({
  amount,
  onPix,
  onCard,
}: {
  amount: number
  onPix: () => void
  onCard: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-center font-serif text-lg text-ink-soft">
        Valor: <span className="font-semibold text-ink">{formatBRL(amount)}</span>
      </p>

      {/* Pix — dominant, first */}
      <button
        type="button"
        onClick={onPix}
        className="flex flex-col items-center gap-1 rounded-2xl bg-blush-500 px-6 py-5 text-ivory shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-lift"
      >
        <span className="font-serif text-2xl font-semibold">Pix — sem taxas ❤️</span>
        <span className="font-serif text-sm opacity-90">Rápido, instantâneo e sem custo</span>
      </button>

      {/* Card — secondary */}
      <button
        type="button"
        onClick={onCard}
        className="flex flex-col items-center gap-1 rounded-2xl border border-blush-300 bg-ivory px-6 py-4 text-ink shadow-card transition-transform hover:-translate-y-0.5 hover:shadow-lift"
      >
        <span className="font-serif text-xl font-medium">Cartão de crédito</span>
        <span className="font-serif text-sm text-ink-muted">Para quem prefere parcelar</span>
      </button>
    </div>
  )
}
