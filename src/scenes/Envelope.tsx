import { motion, useReducedMotion, useTransform, type MotionValue } from 'framer-motion'
import { site } from '@/config/site'
import ScrollHint from '@/components/ScrollHint'

/**
 * Scenes 1–2 — the sealed envelope that opens on scroll (PLAN 2.2).
 * Placeholder art: flat colored panels standing in for the exported layers
 * (envelope body / flap / seal), swapped for real WebP layers in Phase 3.
 *
 * Progress timeline:
 *   0.00 → 0.30  wax seal scales up + fades + lifts
 *   0.30 → 0.70  flap rotates open (rotateX from top edge, with perspective)
 *   0.70 → 1.00  envelope body slides down/away, revealing the interior
 */
export default function Envelope({ progress }: { progress: MotionValue<number> }) {
  const reduce = useReducedMotion()

  // Seal: 0→0.3
  const sealScale = useTransform(progress, [0, 0.3], [1, 1.6])
  const sealOpacity = useTransform(progress, [0, 0.25], [1, 0])
  const sealY = useTransform(progress, [0, 0.3], [0, -80])

  // Flap: 0.3→0.7
  const flapRotate = useTransform(progress, [0.3, 0.7], [0, -180])

  // Envelope body: 0.7→1
  const bodyY = useTransform(progress, [0.7, 1], ['0%', '115%'])
  const bodyOpacity = useTransform(progress, [0.85, 1], [1, 0])

  // Interior reveal fades in a touch as the flap opens
  const interiorOpacity = useTransform(progress, [0.3, 0.6], [0.4, 1])

  if (reduce) {
    return (
      <div className="relative flex h-full w-full items-center justify-center bg-blush-100">
        <StaticInterior />
      </div>
    )
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center bg-blush-100">
      {/* Interior (bottom layer) */}
      <motion.div
        style={{ opacity: interiorOpacity }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <StaticInterior />
      </motion.div>

      {/* Envelope assembly (slides away last) */}
      <motion.div
        style={{ y: bodyY, opacity: bodyOpacity, perspective: 1200 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="relative h-[62vh] w-[86vw] max-w-md">
          {/* Envelope body — placeholder panel */}
          <div className="absolute inset-0 rounded-lg bg-blush-200 shadow-card" />
          {/* Diagonal side flaps (decorative triangles) */}
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.25) 0 50%, transparent 50%), linear-gradient(-135deg, rgba(0,0,0,0.04) 0 50%, transparent 50%)',
            }}
          />

          {/* Top flap — rotates open from its top edge */}
          <motion.div
            style={{ rotateX: flapRotate, transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
            className="absolute inset-x-0 top-0 z-20 h-1/2 origin-top"
          >
            <div
              className="h-full w-full rounded-t-lg bg-blush-300 shadow-sm"
              style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
            />
          </motion.div>

          {/* Wax seal — lifts & fades first */}
          <motion.div
            style={{ scale: sealScale, opacity: sealOpacity, y: sealY }}
            className="absolute left-1/2 top-1/2 z-30 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-blush-500 shadow-seal"
          >
            <span className="font-script text-2xl text-ivory">
              {site.couple.monogram}
            </span>
          </motion.div>
        </div>
      </motion.div>

      <ScrollHint />
    </div>
  )
}

/** Placeholder for the floral interior revealed inside the envelope. */
function StaticInterior() {
  return (
    <div className="flex h-[62vh] w-[86vw] max-w-md flex-col items-center justify-center rounded-lg bg-champagne-100 p-8 text-center shadow-inner">
      <p className="font-serif text-sm uppercase tracking-[0.3em] text-ink-muted">
        {site.tagline}
      </p>
      <h2 className="mt-3 font-script text-6xl text-blush-500">
        {site.couple.monogram}
      </h2>
    </div>
  )
}
