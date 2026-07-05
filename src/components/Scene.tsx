import { useRef, type ReactNode } from 'react'
import { useScroll, type MotionValue } from 'framer-motion'

interface SceneProps {
  /**
   * Height of the scroll track as a multiple of the viewport (e.g. 3 =>
   * `h-[300dvh]`). Longer tracks = slower, more deliberate reveals.
   */
  heightVh?: number
  /**
   * Render-prop receiving scroll progress (0→1) through this scene's track.
   * Drive `useTransform` off it to animate the sticky stage.
   */
  children: (progress: MotionValue<number>) => ReactNode
  className?: string
  id?: string
}

/**
 * Scroll-driven scene primitive (PLAN 2.1): a tall track whose inner stage is
 * `sticky top-0`, pinned for the height of the track. `useScroll` reads scroll
 * position passively (never intercepts native scrolling — TIPS #20), and the
 * `start end / end start`-style offset maps the track to a clean 0→1 range.
 *
 * Uses `dvh` (not `vh`) so the iOS Safari URL-bar resize doesn't jump the
 * layout (TIPS #20).
 */
export default function Scene({
  heightVh = 3,
  children,
  className,
  id,
}: SceneProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  })

  return (
    <section
      ref={trackRef}
      id={id}
      className={className}
      style={{ height: `${heightVh * 100}dvh` }}
    >
      <div className="sticky top-0 h-[100dvh] w-full overflow-hidden">
        {children(scrollYProgress)}
      </div>
    </section>
  )
}
