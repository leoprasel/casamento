import Scene from '@/components/Scene'
import Envelope from '@/scenes/Envelope'
import Gate from '@/scenes/Gate'
import Invitation from '@/scenes/Invitation'
import Rsvp from '@/scenes/Rsvp'
import Registry from '@/scenes/Registry'
import { site } from '@/config/site'

/**
 * Scroll-driven narrative: sealed envelope → gate reveal → invitation.
 * The gift registry (Phase 4) mounts after <Invitation />.
 */
export default function App() {
  return (
    <main className="bg-ivory">
      {/* Scenes 1–2: the envelope opens */}
      <Scene heightVh={3} id="envelope">
        {(progress) => <Envelope progress={progress} />}
      </Scene>

      {/* Scene 3: the gate & ribbon */}
      <Scene heightVh={3} id="gate">
        {(progress) => <Gate progress={progress} />}
      </Scene>

      {/* Scene 4: the invitation */}
      <Invitation />

      {/* Scene 5: RSVP */}
      <Rsvp />

      {/* Scene 6: gift registry */}
      <Registry />

      <footer className="bg-blush-50 px-6 py-12 text-center">
        <p className="font-serif text-base text-ink-muted">{site.footerNote}</p>
      </footer>
    </main>
  )
}
