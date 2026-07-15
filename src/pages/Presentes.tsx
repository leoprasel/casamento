import { useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '@/config/site'
import { gifts, type Gift } from '@/lib/gifts'
import { formatBRL } from '@/lib/format'

/**
 * Gift registry (design §3): 2-col grid of gift cards. Each "Presentear" leads
 * to the payment page (?gift=<id>). Uses the real catalog from gifts.json.
 */
export default function Presentes() {
  return (
    <div className="phone flex flex-col items-center px-6 pb-24 pt-14">
      <Link
        to="/"
        className="self-start font-serif text-[12px] uppercase tracking-[0.28em] text-olive-muted"
      >
        ‹ Voltar ao convite
      </Link>

      <div className="mt-10 max-w-[560px] text-center">
        <div className="eyebrow">{site.couple.line}</div>
        <h1 className="mt-[14px] font-script text-[42px] leading-[1.05] text-olive">
          Lista de Presentes
        </h1>
        <p className="mt-[18px] text-[16px] leading-[1.6] text-olive-body">
          Escolha um presente com carinho. Ao selecionar, você será levado à página de pagamento
          com opções de PIX e cartão de crédito.
        </p>
      </div>

      <div className="mt-11 grid w-full grid-cols-2 gap-4">
        {gifts
          .filter((g) => !g.freeAmount)
          .map((gift) => (
            <GiftCard key={gift.id} gift={gift} />
          ))}
      </div>

      {/* Free-amount option — a distinct full-width button at the end. */}
      <div className="mt-6 w-full border border-olive/25 bg-cream-input p-8 text-center">
        <div className="eyebrow">Se preferir</div>
        <p className="mx-auto mt-3 max-w-[360px] text-[16px] leading-[1.6] text-olive-body">
          Você também pode nos presentear com o valor que desejar, do jeito que fizer sentido
          pra você.
        </p>
        <Link
          to="/pagamento?gift=valor-livre"
          className="btn-dark mx-auto mt-6 max-w-[320px] !py-[14px] !text-[13px]"
        >
          O valor que desejar →
        </Link>
      </div>
    </div>
  )
}

function GiftCard({ gift }: { gift: Gift }) {
  const [imgOk, setImgOk] = useState(true)
  const claimed = gift.claimed

  return (
    <div className="flex flex-col border border-olive/20 bg-cream-input">
      <div className="relative aspect-[4/3] overflow-hidden border-b border-olive/20">
        {imgOk ? (
          <img
            src={gift.image}
            alt={gift.title}
            loading="lazy"
            onError={() => setImgOk(false)}
            className={`h-full w-full object-cover ${claimed ? 'grayscale-[60%]' : ''}`}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              backgroundImage:
                'repeating-linear-gradient(135deg, rgba(59,74,58,0.05) 0px, rgba(59,74,58,0.05) 10px, transparent 10px, transparent 20px)',
            }}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-olive-placeholder">
              foto do presente
            </span>
          </div>
        )}
        {claimed && (
          <div className="absolute inset-0 flex items-center justify-center bg-cream/60">
            <span className="border border-olive/40 bg-cream-card px-3 py-1 font-serif text-[11px] uppercase tracking-[0.2em] text-olive-muted">
              Presenteado
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4 pb-[18px]">
        <h3 className="font-serif text-[17px] font-medium leading-[1.25] text-olive">{gift.title}</h3>
        <div className="mt-[5px] font-serif text-[16px] italic text-olive-muted">
          {gift.freeAmount ? 'Valor livre' : formatBRL(gift.price)}
        </div>
        {claimed ? (
          <span className="mt-4 block cursor-not-allowed bg-olive/40 py-[11px] text-center font-serif text-[11px] font-semibold uppercase tracking-[0.2em] text-cream">
            Presenteado
          </span>
        ) : (
          <Link
            to={`/pagamento?gift=${encodeURIComponent(gift.id)}`}
            className="mt-4 block bg-olive py-[11px] text-center font-serif text-[11px] font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-olive-body"
          >
            Presentear
          </Link>
        )}
      </div>
    </div>
  )
}
