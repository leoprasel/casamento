import { useState, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import { site } from '@/config/site'
import { insertRsvp, isSupabaseConfigured, NAME_MAX } from '@/lib/supabase'

/**
 * RSVP section (PLAN 6.2). WhatsApp deep-link is the zero-maintenance primary
 * path; an optional on-site form writes to Supabase (`rsvps`) when configured
 * and otherwise falls back to WhatsApp so confirmation never dead-ends.
 */
export default function Rsvp() {
  const [name, setName] = useState('')
  const [guests, setGuests] = useState(1)
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const whatsappHref = `https://wa.me/${site.rsvp.whatsappNumber}?text=${encodeURIComponent(
    `Olá! Confirmo presença no casamento de ${site.couple.partnerA} & ${site.couple.partnerB}. 💌`,
  )}`

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    if (!isSupabaseConfigured) {
      window.open(whatsappHref, '_blank', 'noopener')
      return
    }

    setStatus('sending')
    const res = await insertRsvp({ guestName: name, guests, attending: true, note })
    setStatus(res.ok ? 'done' : 'error')
  }

  return (
    <section id="rsvp" className="bg-ivory bg-paper-texture px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-xl text-center">
        <p className="font-serif text-sm uppercase tracking-[0.35em] text-ink-muted">
          Confirme sua presença
        </p>
        <h2 className="mt-3 font-script text-title text-blush-500">R.S.V.P.</h2>
        <p className="mt-5 font-serif text-lg text-ink-soft">
          Faça sua confirmação {site.rsvp.deadlineLabel}. Mal podemos esperar para celebrar com você!
        </p>

        {status === 'done' ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl bg-blush-50 p-8"
          >
            <span className="text-4xl">💐</span>
            <p className="mt-3 font-script text-3xl text-blush-500">Presença confirmada!</p>
            <p className="mt-2 font-serif text-lg text-ink-soft">Obrigado, {name.split(' ')[0]}!</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-4 text-left">
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
              <span className="font-serif text-sm text-ink-soft">Quantas pessoas?</span>
              <input
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="rounded-xl border border-blush-200 bg-ivory px-4 py-3 font-serif text-lg text-ink outline-none focus:border-blush-400"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="font-serif text-sm text-ink-soft">Recado (opcional)</span>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="resize-none rounded-xl border border-blush-200 bg-ivory px-4 py-3 font-serif text-lg text-ink outline-none focus:border-blush-400"
              />
            </label>

            {status === 'error' && (
              <p className="font-serif text-sm text-blush-600">
                Não conseguimos salvar agora — confirme pelo WhatsApp abaixo 💌
              </p>
            )}

            <button type="submit" className="btn-primary w-full" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Confirmar presença 💌'}
            </button>

            <a
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary w-full"
            >
              Confirmar pelo WhatsApp
            </a>
          </form>
        )}
      </div>
    </section>
  )
}
