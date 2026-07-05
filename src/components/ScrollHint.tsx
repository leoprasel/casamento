import { motion, useReducedMotion } from 'framer-motion'

/**
 * Subtle "scroll to open" hint on scene 1 (PLAN 2.5.3). Fades itself out
 * politely and bobs unless the guest prefers reduced motion.
 */
export default function ScrollHint({ label = 'role para abrir' }: { label?: string }) {
  const reduce = useReducedMotion()

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-8 z-30 flex flex-col items-center gap-2 text-ink-soft">
      <span className="font-serif text-sm uppercase tracking-[0.3em]">{label}</span>
      <motion.svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        animate={reduce ? undefined : { y: [0, 8, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path
          d="M6 9l6 6 6-6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </motion.svg>
    </div>
  )
}
