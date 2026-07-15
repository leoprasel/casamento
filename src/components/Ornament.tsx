/**
 * Divider ornament reused across the site: 30px line · 5px diamond (45°) ·
 * 30px line. `light` renders it for the dark olive CTA band.
 */
export default function Ornament({
  light = false,
  className = '',
}: {
  light?: boolean
  className?: string
}) {
  const line = light ? 'bg-cream/40' : 'bg-olive/30'
  const diamond = light ? 'bg-cream/60' : 'bg-olive-accent'
  return (
    <div className={`flex items-center justify-center gap-[9px] ${className}`}>
      <span className={`h-px w-[30px] ${line}`} />
      <span className={`h-[5px] w-[5px] rotate-45 ${diamond}`} />
      <span className={`h-px w-[30px] ${line}`} />
    </div>
  )
}
