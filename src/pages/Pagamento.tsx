import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getGiftById, gifts, type Gift } from '@/lib/gifts'
import { buildPixPayload, isPixError, renderPixQr } from '@/lib/pix'
import { formatBRL } from '@/lib/format'

const FREE_MIN = 10
const MAX_INSTALLMENTS = 6

/**
 * Checkout (design §4). PIX uses the real BR Code + QR built client-side; the
 * card path redirects to Asaas's hosted checkout (no raw card data touches the
 * site — that's why the design's literal card form is replaced by a secure
 * redirect). Reads the gift from ?gift=<id>.
 */
export default function Pagamento() {
  const [params] = useSearchParams()
  const gift = getGiftById(params.get('gift') ?? '')

  if (!gift) {
    return (
      <div className="phone flex flex-col items-center px-6 pb-20 pt-14">
        <Link to="/presentes" className="self-start font-serif text-[12px] uppercase tracking-[0.28em] text-olive-muted">
          ‹ Voltar à lista
        </Link>
        <p className="mt-20 text-center text-[18px] text-olive-body">Presente não encontrado.</p>
      </div>
    )
  }
  return <Checkout gift={gift} />
}

function Checkout({ gift }: { gift: Gift }) {
  const [amount, setAmount] = useState<number | null>(gift.freeAmount ? null : gift.price)
  const [method, setMethod] = useState<'pix' | 'card'>('pix')
  const [done, setDone] = useState(false)

  return (
    <div className="phone flex flex-col items-center px-6 pb-20 pt-14">
      <Link to="/presentes" className="self-start font-serif text-[12px] uppercase tracking-[0.28em] text-olive-muted">
        ‹ Voltar à lista
      </Link>

      <div className="mt-10 w-full max-w-[480px]">
        {done ? (
          <DoneState />
        ) : amount === null ? (
          <FreeAmount gift={gift} onConfirm={setAmount} />
        ) : (
          <>
            <div className="text-center">
              <div className="eyebrow">Você está presenteando</div>
              <h1 className="mt-3 font-script text-[40px] leading-[1.05] text-olive">{gift.title}</h1>
              <div className="mt-[10px] font-serif text-[24px] text-olive-body">{formatBRL(amount)}</div>
            </div>

            <div className="mt-10 flex border border-olive/25">
              <Tab active={method === 'pix'} onClick={() => setMethod('pix')}>
                PIX
              </Tab>
              <Tab active={method === 'card'} onClick={() => setMethod('card')}>
                Cartão de Crédito
              </Tab>
            </div>

            {method === 'pix' ? (
              <PixPanel gift={gift} amount={amount} onDone={() => setDone(true)} />
            ) : (
              <CardPanel gift={gift} amount={amount} onUsePix={() => setMethod('pix')} />
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-[15px] font-serif text-[13px] uppercase tracking-[0.2em] transition-colors ${
        active ? 'bg-olive text-cream' : 'bg-transparent text-olive-muted'
      }`}
    >
      {children}
    </button>
  )
}

function FreeAmount({ gift, onConfirm }: { gift: Gift; onConfirm: (v: number) => void }) {
  const [value, setValue] = useState('')
  const parsed = Number(value.replace(',', '.'))
  const valid = Number.isFinite(parsed) && parsed >= FREE_MIN

  return (
    <div>
      <div className="text-center">
        <div className="eyebrow">Você está presenteando</div>
        <h1 className="mt-3 font-script text-[40px] leading-[1.05] text-olive">{gift.title}</h1>
      </div>
      <div className="mt-8 border border-olive/20 bg-cream-input p-[34px]">
        <p className="mb-5 text-center text-[18px] leading-[1.6] text-olive-body">
          Escolha o valor da sua contribuição (mínimo {formatBRL(FREE_MIN)}):
        </p>
        <div className="flex items-center gap-2 border border-olive/25 bg-cream px-4 py-[14px]">
          <span className="font-serif text-[20px] text-olive-muted">R$</span>
          <input
            type="number"
            min={FREE_MIN}
            step="1"
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="100"
            aria-label="Valor da contribuição em reais"
            className="w-full bg-transparent font-serif text-[20px] text-olive outline-none"
          />
        </div>
        <button
          disabled={!valid}
          onClick={() => onConfirm(Math.round(parsed * 100) / 100)}
          className="btn-dark mt-6 !py-[18px] !text-[14px] !tracking-[0.26em]"
        >
          Continuar →
        </button>
      </div>
    </div>
  )
}

function PixPanel({ gift, amount, onDone }: { gift: Gift; amount: number; onDone: () => void }) {
  const giftIndex = gifts.findIndex((g) => g.id === gift.id)
  const payload = useMemo(
    () => buildPixPayload({ amount, giftIndex: giftIndex >= 0 ? giftIndex : 0 }),
    [amount, giftIndex],
  )
  const configError = isPixError(payload) ? payload.error : null
  const brCode = isPixError(payload) ? '' : payload.brCode

  const [qr, setQr] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let alive = true
    if (brCode) renderPixQr(brCode).then((url) => alive && setQr(url))
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
      /* visible for manual copy */
    }
  }

  if (configError) {
    return (
      <div className="mt-8 border border-olive/20 bg-cream-input p-[34px] text-center">
        <p className="text-[17px] text-olive-body">
          O Pix está temporariamente indisponível. Tente novamente ou use o cartão 😉
        </p>
      </div>
    )
  }

  return (
    <div className="mt-8 border border-olive/20 bg-cream-input p-[34px] text-center">
      <p className="mb-6 text-[19px] leading-[1.6] text-olive-body">
        Escaneie o QR Code ou copie a chave PIX abaixo.
      </p>
      <div className="mx-auto flex h-[190px] w-[190px] items-center justify-center bg-white p-2">
        {qr ? (
          <img src={qr} alt="QR Code PIX" className="h-full w-full" />
        ) : (
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-olive-placeholder">
            gerando…
          </span>
        )}
      </div>
      <div className="mb-[26px] mt-[14px] font-mono text-[10px] uppercase tracking-[0.14em] text-olive-placeholder">
        pix copia e cola
      </div>
      <div className="flex items-center gap-[10px] border border-olive/25 bg-cream px-[14px] py-3">
        <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-left font-mono text-[13px] text-olive">
          {brCode}
        </span>
        <button
          onClick={copy}
          className="shrink-0 bg-olive px-4 py-[9px] font-serif text-[11px] uppercase tracking-[0.2em] text-cream"
        >
          {copied ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
      <button onClick={onDone} className="btn-dark mt-[26px] !py-[18px] !text-[14px] !tracking-[0.26em]">
        Já fiz o PIX →
      </button>
    </div>
  )
}

function CardPanel({ gift, amount, onUsePix }: { gift: Gift; amount: number; onUsePix: () => void }) {
  const [name, setName] = useState('')
  const [cpf, setCpf] = useState('')
  const [installments, setInstallments] = useState(1)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function pay() {
    if (!name.trim() || cpf.replace(/\D/g, '').length !== 11) {
      setStatus('error')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/card-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.id,
          installments,
          guestName: name.trim(),
          cpf: cpf.replace(/\D/g, ''),
          customAmount: gift.freeAmount ? amount : undefined,
        }),
      })
      if (!res.ok) throw new Error(String(res.status))
      const data = (await res.json()) as { invoiceUrl?: string }
      if (!data.invoiceUrl) throw new Error('no url')
      window.location.href = data.invoiceUrl
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="mt-8 border border-olive/20 bg-cream-input p-[34px]">
      <label className="mb-2 block font-serif text-[11px] uppercase tracking-[0.24em] text-olive-muted">
        Nome no cartão
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Como impresso no cartão"
        aria-label="Nome no cartão"
        maxLength={80}
        className="mb-5 w-full border border-olive/25 bg-cream px-4 py-[14px] font-serif text-[18px] text-olive outline-none"
      />

      <label className="mb-2 block font-serif text-[11px] uppercase tracking-[0.24em] text-olive-muted">
        CPF
      </label>
      <input
        type="text"
        inputMode="numeric"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
        placeholder="000.000.000-00"
        aria-label="CPF"
        className="mb-5 w-full border border-olive/25 bg-cream px-4 py-[14px] font-mono text-[16px] text-olive outline-none"
      />

      <label className="mb-2 block font-serif text-[11px] uppercase tracking-[0.24em] text-olive-muted">
        Parcelas
      </label>
      <select
        value={installments}
        onChange={(e) => setInstallments(Number(e.target.value))}
        aria-label="Número de parcelas"
        className="mb-2 w-full border border-olive/25 bg-cream px-4 py-[14px] font-serif text-[18px] text-olive outline-none"
      >
        {Array.from({ length: MAX_INSTALLMENTS }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}x de {formatBRL(amount / n)}
            {n === 1 ? ' à vista' : ''}
          </option>
        ))}
      </select>

      <p className="mb-5 mt-3 font-serif text-[13px] italic leading-[1.6] text-olive-muted">
        Você será direcionado ao ambiente de pagamento seguro da Asaas. Seus dados do cartão não
        passam por este site.
      </p>

      {status === 'error' && (
        <p className="mb-4 border border-olive/20 bg-cream p-3 text-center font-serif text-[14px] text-olive-body">
          Não foi possível iniciar o pagamento. Confira os dados, tente novamente ou{' '}
          <button onClick={onUsePix} className="underline underline-offset-2">
            use o PIX
          </button>
          .
        </p>
      )}

      <button onClick={pay} disabled={status === 'loading'} className="btn-dark !py-[18px] !text-[14px] !tracking-[0.26em]">
        {status === 'loading' ? 'Redirecionando…' : `Pagar ${formatBRL(amount)} →`}
      </button>
    </div>
  )
}

function DoneState() {
  return (
    <div className="border border-olive/25 bg-cream-input px-8 py-[60px] text-center">
      <div className="eyebrow">Presente confirmado</div>
      <h2 className="mt-[14px] font-script text-[40px] leading-none text-olive">
        De coração, obrigado!
      </h2>
      <p className="mx-auto mt-5 max-w-[320px] text-[16px] leading-[1.7] text-olive-body">
        Seu carinho torna nosso começo ainda mais especial. Mal podemos esperar para celebrar com
        você.
      </p>
      <div className="mx-auto my-[34px] h-px w-[56px] bg-olive/35" />
      <Link
        to="/"
        className="border-b border-olive/50 pb-[6px] font-serif text-[13px] uppercase tracking-[0.26em] text-olive"
      >
        Voltar ao convite →
      </Link>
    </div>
  )
}
