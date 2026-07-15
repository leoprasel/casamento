import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const SEEN_KEY = 'convite_intro_seen'

/**
 * Opening intro video that freezes on its final frame and blends into the
 * scroll (design §1.0). Locks body scroll while playing; a localStorage flag
 * skips the replay on return visits (starts paused on the last frame). Guests
 * who prefer reduced motion skip straight to the frozen last frame.
 */
export default function IntroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const reduce = useReducedMotion()

  const seenInitial = (() => {
    try {
      return localStorage.getItem(SEEN_KEY) === '1'
    } catch {
      return false
    }
  })()

  const [done, setDone] = useState(seenInitial || !!reduce)
  const [muted, setMuted] = useState(true)

  function finishIntro() {
    try {
      localStorage.setItem(SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
    document.body.style.overflow = ''
    setDone(true)
  }

  function freezeLastFrame() {
    const v = videoRef.current
    if (v && v.duration) {
      try {
        v.currentTime = Math.max(0, v.duration - 0.05)
        v.pause()
      } catch {
        /* ignore */
      }
    }
  }

  useEffect(() => {
    const v = videoRef.current
    const alreadyDone = seenInitial || !!reduce

    const onLoadedMeta = () => {
      if (alreadyDone) freezeLastFrame()
    }
    if (v) v.addEventListener('loadedmetadata', onLoadedMeta)

    if (alreadyDone) {
      if (v && v.readyState >= 1) freezeLastFrame()
    } else {
      document.body.style.overflow = 'hidden'
      if (v) {
        const p = v.play()
        if (p && p.catch) p.catch(() => {})
      }
    }

    return () => {
      if (v) v.removeEventListener('loadedmetadata', onLoadedMeta)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function skip() {
    freezeLastFrame()
    finishIntro()
  }

  function toggleMute() {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    if (!v.muted) {
      const p = v.play()
      if (p && p.catch) p.catch(() => {})
    }
    setMuted(v.muted)
  }

  return (
    <section className="relative h-[100dvh] overflow-hidden bg-night">
      <video
        ref={videoRef}
        onEnded={() => {
          videoRef.current?.pause()
          finishIntro()
        }}
        autoPlay
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/assets/intro.mp4" type="video/mp4" />
      </video>

      {/* Bottom fade blending the last frame into the cream scroll */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%]"
        style={{
          background:
            'linear-gradient(to bottom, rgba(241,238,228,0) 0%, rgba(241,238,228,0.55) 55%, #F1EEE4 100%)',
        }}
      />

      {!done && (
        <>
          <button
            onClick={toggleMute}
            className="absolute bottom-6 left-5 z-10 border border-cream/50 px-[14px] py-[9px] font-serif text-[11px] uppercase tracking-[0.2em] text-cream backdrop-blur-sm"
            style={{ background: 'rgba(241,238,228,0.14)' }}
          >
            {muted ? 'Ativar som' : 'Silenciar'}
          </button>
          <button
            onClick={skip}
            className="absolute bottom-6 right-5 z-10 border border-cream/50 px-[14px] py-[9px] font-serif text-[11px] uppercase tracking-[0.2em] text-cream backdrop-blur-sm"
            style={{ background: 'rgba(241,238,228,0.14)' }}
          >
            Pular ›
          </button>
        </>
      )}

      {done && (
        <div className="absolute inset-x-0 bottom-[26px] z-10 flex animate-fadeIn flex-col items-center gap-[6px] text-olive">
          <span className="font-serif text-[11px] uppercase tracking-[0.34em]">Continue rolando</span>
          <span className="animate-floatArrow text-lg">↓</span>
        </div>
      )}
    </section>
  )
}
