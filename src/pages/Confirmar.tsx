import { useState } from 'react'
import { Link } from 'react-router-dom'
import { site } from '@/config/site'
import { insertRsvp, isSupabaseConfigured } from '@/lib/supabase'

interface Guest {
  id: number
  name: string
}

/**
 * RSVP page (design §2): dynamic per-guest name rows + optional message.
 * Submitting requires at least one named guest; on success it writes one
 * `rsvps` row (best-effort) and shows the thank-you state.
 */
export default function Confirmar() {
  const [guests, setGuests] = useState<Guest[]>([{ id: 1, name: '' }])
  const [nextId, setNextId] = useState(2)
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [count, setCount] = useState(0)

  function addGuest() {
    setGuests((g) => [...g, { id: nextId, name: '' }])
    setNextId((n) => n + 1)
  }
  function removeGuest(id: number) {
    setGuests((g) => (g.length > 1 ? g.filter((x) => x.id !== id) : g))
  }
  function changeGuest(id: number, name: string) {
    setGuests((g) => g.map((x) => (x.id === id ? { ...x, name } : x)))
  }

  async function submit() {
    const named = guests.map((g) => g.name.trim()).filter(Boolean)
    if (named.length === 0) return

    setCount(named.length)
    setSubmitted(true)

    if (isSupabaseConfigured) {
      const note = `Convidados: ${named.join(', ')}${message.trim() ? ` — ${message.trim()}` : ''}`
      await insertRsvp({ guestName: named[0], guests: named.length, attending: true, note })
    }
  }

  const namedGuests = guests.map((g) => g.name.trim()).filter(Boolean)
  const whatsappHref = `https://wa.me/${site.rsvp.whatsappNumber}?text=${encodeURIComponent(
    `Olá! Confirmo presença no casamento de ${site.couple.partnerA} & ${site.couple.partnerB} 💌` +
      (namedGuests.length ? `\nConvidados: ${namedGuests.join(', ')}` : '') +
      (message.trim() ? `\nRecado: ${message.trim()}` : ''),
  )}`

  return (
    <div className="phone flex flex-col items-center px-6 pb-20 pt-14">
      <Link
        to="/"
        className="self-start font-serif text-[12px] uppercase tracking-[0.28em] text-olive-muted"
      >
        ‹ Voltar ao convite
      </Link>

      <div className="mt-10 w-full max-w-[620px]">
        <div className="text-center">
          <div className="eyebrow">{site.couple.line}</div>
          <h1 className="mt-[14px] font-script text-[40px] leading-[1.05] text-olive">
            Confirmar Presença
          </h1>
          <p className="mx-auto mt-[18px] max-w-[300px] text-[16px] leading-[1.6] text-olive-body">
            Adicione o nome de cada convidado que virá celebrar conosco.
          </p>
        </div>

        {!submitted ? (
          <div className="mt-12">
            {guests.map((g, i) => (
              <div key={g.id} className="mb-4 flex animate-fadeUp items-center gap-[14px]">
                <div className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full border border-olive/30 font-serif text-[17px] italic text-olive-muted">
                  {i + 1}
                </div>
                <input
                  type="text"
                  value={g.name}
                  onChange={(e) => changeGuest(g.id, e.target.value)}
                  placeholder="Nome completo do convidado"
                  aria-label={`Nome do convidado ${i + 1}`}
                  maxLength={80}
                  className="field flex-1"
                />
                <button
                  onClick={() => removeGuest(g.id)}
                  title="Remover"
                  aria-label="Remover convidado"
                  className="h-[50px] w-[44px] shrink-0 border border-olive/20 text-[22px] leading-none text-olive-muted"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              onClick={addGuest}
              className="mt-[10px] inline-flex items-center gap-3 border border-dashed border-olive/40 px-[22px] py-[14px] font-serif text-[14px] uppercase tracking-[0.16em] text-olive"
            >
              <span className="text-[20px] leading-none">+</span> Adicionar convidado
            </button>

            <div className="mt-[34px]">
              <label className="mb-3 block font-serif text-[12px] uppercase tracking-[0.28em] text-olive-muted">
                Recado (opcional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="Deixe uma mensagem para os noivos..."
                className="field resize-y"
              />
            </div>

            <button onClick={submit} className="btn-dark mt-[30px] !py-5 !text-[15px] !tracking-[0.28em]">
              Enviar Confirmação →
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="mt-3 block border border-olive/40 bg-transparent px-6 py-4 text-center font-serif text-[13px] font-semibold uppercase tracking-[0.22em] text-olive transition-colors hover:bg-olive/5"
            >
              Confirmar pelo WhatsApp
            </a>
          </div>
        ) : (
          <div className="mt-[60px] animate-fadeUp border border-olive/25 bg-cream-input px-8 py-14 text-center">
            <div className="eyebrow">Presença confirmada</div>
            <h2 className="mt-[14px] font-script text-[40px] leading-none text-olive">
              Muito obrigado!
            </h2>
            <p className="mx-auto mt-5 max-w-[320px] text-[16px] leading-[1.7] text-olive-body">
              Que alegria contar com você neste dia tão especial.{' '}
              {count === 1 ? 'Sua presença está confirmada.' : `${count} presenças confirmadas.`}
            </p>
            <div className="mx-auto my-[34px] h-px w-[56px] bg-olive/35" />
            <Link
              to="/presentes"
              className="border-b border-olive/50 pb-[6px] font-serif text-[13px] uppercase tracking-[0.26em] text-olive"
            >
              Ver lista de presentes →
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
