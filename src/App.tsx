import { site } from '@/config/site'

/**
 * Phase 1 skeleton: a blank-but-styled page that proves the toolchain,
 * palette and fonts render. The scroll-animation scenes (Phase 2) and the
 * gift registry (Phase 4) mount here in later features.
 */
export default function App() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-paper-texture bg-blush-50 px-6 text-center">
      <p className="mb-4 font-serif text-sm uppercase tracking-[0.35em] text-ink-muted">
        {site.tagline}
      </p>
      <h1 className="script-heading text-display">{site.couple.monogram}</h1>
      <p className="mt-6 max-w-md font-serif text-xl text-ink-soft">
        {site.invitationLine}
      </p>
      <p className="mt-10 font-serif text-lg text-ink-muted">
        {site.weddingDateLabel}
      </p>
    </main>
  )
}
