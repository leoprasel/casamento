import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { site } from '@/config/site'

/**
 * Scene 3 — the garden gate tied with a ribbon that unties, then the two
 * panels swing open to reveal the invitation behind (PLAN 2.3).
 *
 * Progress timeline:
 *   0.00 → 0.40  ribbon bow shrinks + tails slide apart (untie)
 *   0.40 → 1.00  left panel exits left, right panel exits right (curtain reveal)
 */
export default function Gate({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion()

  // Ribbon untie: 0→0.4
  const bowScale = useTransform(progress, [0, 0.4], [1, 0])
  const bowOpacity = useTransform(progress, [0.25, 0.4], [1, 0])
  const tailLeftX = useTransform(progress, [0, 0.4], [0, -140])
  const tailRightX = useTransform(progress, [0, 0.4], [0, 140])

  // Panels swing/slide open: 0.4→1
  const leftX = useTransform(progress, [0.4, 1], ['0%', '-105%'])
  const rightX = useTransform(progress, [0.4, 1], ['0%', '105%'])
  const contentOpacity = useTransform(progress, [0.55, 0.9], [0, 1])

  if (reduce) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-champagne-50">
        <GateReveal />
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-champagne-50">
      {/* Invitation preview behind the gate */}
      <motion.div style={{ opacity: contentOpacity }} className="absolute inset-0 flex items-center justify-center">
        <GateReveal />
      </motion.div>

      {/* Left gate panel */}
      <motion.div
        style={{ x: leftX }}
        className="absolute inset-y-0 left-0 z-10 w-1/2 border-r border-champagne-300 bg-champagne-200"
      >
        <GateLattice side="left" />
      </motion.div>

      {/* Right gate panel */}
      <motion.div
        style={{ x: rightX }}
        className="absolute inset-y-0 right-0 z-10 w-1/2 border-l border-champagne-300 bg-champagne-200"
      >
        <GateLattice side="right" />
      </motion.div>

      {/* Ribbon over the seam */}
      <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <motion.span
          style={{ x: tailLeftX }}
          className="absolute h-40 w-4 -rotate-6 rounded-full bg-blush-400"
        />
        <motion.span
          style={{ x: tailRightX }}
          className="absolute h-40 w-4 rotate-6 rounded-full bg-blush-400"
        />
        <motion.span
          style={{ scale: bowScale, opacity: bowOpacity }}
          className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-blush-500 text-2xl shadow-seal"
        >
          🎀
        </motion.span>
      </div>
    </div>
  )
}

function GateLattice({ side }: { side: 'left' | 'right' }) {
  return (
    <div
      className="h-full w-full opacity-40"
      style={{
        backgroundImage:
          'repeating-linear-gradient(45deg, rgba(184,147,90,0.5) 0 2px, transparent 2px 22px), repeating-linear-gradient(-45deg, rgba(184,147,90,0.5) 0 2px, transparent 2px 22px)',
        maskImage:
          side === 'left'
            ? 'linear-gradient(to left, black, transparent)'
            : 'linear-gradient(to right, black, transparent)',
      }}
    />
  )
}

function GateReveal() {
  return (
    <div className="px-8 text-center">
      <p className="font-serif text-sm uppercase tracking-[0.35em] text-ink-muted">
        {site.tagline}
      </p>
      <h2 className="mt-4 font-script text-title text-blush-500">
        {site.couple.partnerA} &amp; {site.couple.partnerB}
      </h2>
    </div>
  )
}
