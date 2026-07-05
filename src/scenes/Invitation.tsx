import { motion } from 'framer-motion'
import { site } from '@/config/site'
import Countdown from '@/components/Countdown'

/**
 * Scene 4 — the invitation proper (PLAN 2.4). Normal-flow content with gentle
 * `whileInView` fade-ups: names, date, countdown, venues, schedule, dress code.
 */
const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-80px' },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
}

export default function Invitation() {
  return (
    <section className="relative bg-paper-texture bg-ivory px-6 py-24 sm:py-32">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <motion.p {...fadeUp} className="font-serif text-sm uppercase tracking-[0.35em] text-ink-muted">
          {site.tagline}
        </motion.p>

        <motion.h1 {...fadeUp} className="mt-6 font-script text-display leading-none text-blush-500">
          {site.couple.partnerA}
          <span className="mx-3 align-middle text-4xl text-gold">&amp;</span>
          {site.couple.partnerB}
        </motion.h1>

        <motion.p {...fadeUp} className="mt-8 max-w-lg font-serif text-xl text-ink-soft">
          {site.invitationLine}
        </motion.p>

        <motion.p {...fadeUp} className="mt-4 font-serif text-2xl font-medium text-ink">
          {site.weddingDateLabel}
        </motion.p>

        {/* Countdown */}
        <motion.div {...fadeUp} className="mt-14">
          <Countdown date={site.weddingDate} />
        </motion.div>

        {/* Venues */}
        <motion.div {...fadeUp} className="mt-20 grid w-full gap-8 sm:grid-cols-2">
          {site.venues.map((venue) => (
            <div key={venue.label} className="rounded-2xl bg-blush-50 p-6 shadow-card">
              <p className="font-serif text-xs uppercase tracking-[0.3em] text-blush-500">
                {venue.label}
              </p>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-ink">{venue.name}</h3>
              {venue.time && <p className="mt-1 font-serif text-lg text-ink-soft">{venue.time}</p>}
              <p className="mt-2 font-serif text-base text-ink-muted">{venue.address}</p>
              {venue.mapsUrl && (
                <a
                  href={venue.mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block font-serif text-sm font-medium text-blush-600 underline underline-offset-4"
                >
                  Ver no mapa →
                </a>
              )}
            </div>
          ))}
        </motion.div>

        {/* Schedule */}
        <motion.div {...fadeUp} className="mt-20 w-full">
          <h3 className="font-script text-4xl text-blush-500">Programação</h3>
          <ul className="mx-auto mt-8 max-w-md space-y-6 text-left">
            {site.schedule.map((item) => (
              <li key={item.time} className="flex gap-5">
                <span className="w-16 shrink-0 font-serif text-lg font-semibold text-gold">
                  {item.time}
                </span>
                <span>
                  <span className="block font-serif text-lg font-medium text-ink">{item.title}</span>
                  {item.description && (
                    <span className="block font-serif text-base text-ink-muted">
                      {item.description}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Dress code */}
        <motion.div {...fadeUp} className="mt-16">
          <p className="font-serif text-sm uppercase tracking-[0.3em] text-ink-muted">Traje</p>
          <p className="mt-2 font-serif text-xl text-ink">{site.dressCode}</p>
        </motion.div>
      </div>
    </section>
  )
}
