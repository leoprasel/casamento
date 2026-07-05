import { useEffect, useState } from 'react'
import type { Gift } from '@/lib/gifts'
import { gifts } from '@/lib/gifts'
import { buildPixPayload, isPixError, renderPixQr } from '@/lib/pix'
import { formatBRL } from '@/lib/format'
import MessageForm from '@/components/MessageForm'

interface PixScreenProps {
  gift: Gift
  amount: number
  onClose: () => void
}

/**
 * Pix payment screen (PLAN 4.3): build the BR Code, render the QR, expose
 * "copia e cola" + the txid as an "identificador", then a "Já paguei" path to
 * the message form and a thank-you state.
 */
export default function PixScreen({ gift, amount, onClose }: PixScreenProps) {
  const giftIndex = gifts.findIndex((g) => g.id === gift.id)
  const payload = buildPixPayload({ amount, giftIndex: giftIndex >= 0 ? giftIndex : 0 })

  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [stage, setStage] = useState<'pay' | 'message' | 'thanks'>('pay')

  const configError = isPixError(payload) ? payload.error : null
  const brCode = isPixError(payload) ? '' : payload.brCode
  const txid = isPixError(payload) ? '' : payload.txid

  useEffect(() => {
    let alive = true
    if (brCode) {
      renderPixQr(brCode).then((url) => {
        if (alive) setQr(url)
      })
    }
    return () => {
      alive = false
    }
  }, [brCode])

  async function copy() {
    try {
      await navigator.clipboard.writeText(brCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — the string is visible for manual copy */
    }
  }

  if (configError) {
    return (
      <div className="text-center">
        <p className="font-serif text-lg text-ink-soft">
          O Pix está temporariamente indisponível. Tente novamente ou use o cartão 😉
        </p>
      </div>
    )
  }

  if (stage === 'thanks') {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="text-5xl">💝</span>
        <h3 className="font-script text-4xl text-blush-500">Obrigado!</h3>
        <p className="font-serif text-lg text-ink-soft">
          Seu carinho já faz parte da nossa história. Nos vemos no grande dia!
        </p>
        <button type="button" onClick={onClose} className="btn-secondary mt-2">
          Fechar
        </button>
      </div>
    )
  }

  if (stage === 'message') {
    return (
      <div>
        <h3 className="mb-4 text-center font-script text-3xl text-blush-500">
          Deixe seu recadinho
        </h3>
        <MessageForm
          giftId={gift.id}
          amount={amount}
          method="pix"
          onDone={() => setStage('thanks')}
          submitLabel="Enviar 💌"
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <p className="font-serif text-sm uppercase tracking-[0.25em] text-blush-500">
        Pix — sem taxas ❤️
      </p>
      <p className="font-serif text-lg text-ink-soft">
        {gift.title} · <span className="font-semibold text-ink">{formatBRL(amount)}</span>
      </p>

      {/* QR — dark on white for reliable scanning */}
      <div className="rounded-2xl bg-white p-3 shadow-card">
        {qr ? (
          <img src={qr} alt="QR Code Pix" width={220} height={220} className="h-[220px] w-[220px]" />
        ) : (
          <div className="flex h-[220px] w-[220px] items-center justify-center text-ink-muted">
            Gerando…
          </div>
        )}
      </div>

      {/* Copia e cola */}
      <div className="w-full">
        <p className="mb-1 font-serif text-sm text-ink-soft">Pix copia e cola</p>
        <div className="flex items-stretch gap-2">
          <code className="flex-1 truncate rounded-xl bg-blush-50 px-3 py-2 text-left font-mono text-xs text-ink-soft">
            {brCode}
          </code>
          <button type="button" onClick={copy} className="btn-secondary shrink-0 px-4 py-2 text-base">
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Identificador (txid) */}
      <p className="font-serif text-sm text-ink-muted">
        Identificador: <span className="font-mono text-ink-soft">{txid}</span>
      </p>

      <button type="button" onClick={() => setStage('message')} className="btn-primary mt-2 w-full">
        Já paguei 💌
      </button>
    </div>
  )
}
