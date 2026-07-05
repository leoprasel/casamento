import { useState, type FormEvent } from 'react'
import type { Gift } from '@/lib/gifts'
import { formatBRL } from '@/lib/format'
import { NAME_MAX } from '@/lib/supabase'

interface CardScreenProps {
  gift: Gift
  amount: number
  onUsePix: () => void
}

/** Max installments offered (mirror the server clamp — decide juros policy there). */
const MAX_INSTALLMENTS = 6

/**
 * Credit-card screen (PLAN 4.4): collect guest name (+ optional CPF, which
 * Asaas may require at customer creation — TIPS #11) and installment count,
 * then POST to the serverless function and redirect to the Asaas `invoiceUrl`.
 * On any failure it points the guest back to Pix (TIPS #32 degradation plan).
 */
export default function CardScreen({ gift, amount, onUsePix }: CardScreenProps) {
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [installments, setInstallments] = useState(1)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setStatus('loading')

    try {
      const res = await fetch('/api/card-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.id,
          installments,
          guestName: name.trim(),
          cpf: cpf.replace(/\D/g, '') || undefined,
          customAmount: gift.freeAmount ? amount : undefined,
        }),
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = (await res.json()) as { invoiceUrl?: string }
      if (!data.invoiceUrl) throw new Error('missing invoiceUrl')

      window.location.href = data.invoiceUrl
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <div className="text-center">
        <p className="font-serif text-sm uppercase tracking-[0.25em] text-ink-muted">
          Cartão de crédito
        </p>
        <p className="mt-1 font-serif text-lg text-ink-soft">
          {gift.title} · <span className="font-semibold text-ink">{formatBRL(amount)}</span>
        </p>
      </div>

      <label className="flex flex-col gap-1">
        <span className="font-serif text-sm text-ink-soft">Seu nome</span>
        <input
          type="text"
          required
          maxLength={NAME_MAX}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-blush-200 bg-ivory px-4 py-3 font-serif text-lg text-ink outline-none focus:border-blush-400"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-serif text-sm text-ink-soft">CPF</span>
        <input
          type="text"
          inputMode="numeric"
          required
          value={cpf}
          onChange={(e) => setCpf(e.target.value)}
          placeholder="000.000.000-00"
          className="rounded-xl border border-blush-200 bg-ivory px-4 py-3 font-serif text-lg text-ink outline-none focus:border-blush-400"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-serif text-sm text-ink-soft">Parcelas</span>
        <select
          value={installments}
          onChange={(e) => setInstallments(Number(e.target.value))}
          className="rounded-xl border border-blush-200 bg-ivory px-4 py-3 font-serif text-lg text-ink outline-none focus:border-blush-400"
        >
          {Array.from({ length: MAX_INSTALLMENTS }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}x de {formatBRL(amount / n)}
              {n === 1 ? ' à vista' : ''}
            </option>
          ))}
        </select>
      </label>

      {status === 'error' && (
        <p className="rounded-xl bg-blush-50 p-3 text-center font-serif text-sm text-blush-600">
          Não foi possível iniciar o pagamento por cartão agora.
          <br />
          Tente novamente ou use o Pix 😉
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={status === 'loading'}>
        {status === 'loading' ? 'Redirecionando…' : 'Continuar para o pagamento →'}
      </button>

      <button
        type="button"
        onClick={onUsePix}
        className="font-serif text-sm text-blush-600 underline underline-offset-4"
      >
        Prefiro pagar por Pix (sem taxas)
      </button>
    </form>
  )
}
