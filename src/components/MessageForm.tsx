import { useState, type FormEvent } from 'react'
import {
  insertMessage,
  isSupabaseConfigured,
  NAME_MAX,
  MESSAGE_MAX,
  type GuestMessage,
} from '@/lib/supabase'

interface MessageFormProps {
  giftId?: string | null
  amount?: number | null
  method: GuestMessage['method']
  onDone: () => void
  submitLabel?: string
}

/**
 * Guest name + message → Supabase INSERT (TIPS #30 length limits). Degrades
 * gracefully to a plain thank-you when Supabase isn't configured, so the gift
 * flow never blocks on the database.
 */
export default function MessageForm({
  giftId,
  amount,
  method,
  onDone,
  submitLabel = 'Enviar mensagem 💌',
}: MessageFormProps) {
  const [name, setName] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'error'>('idle')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    if (!isSupabaseConfigured) {
      // No DB configured — honor-system flow, just thank them.
      onDone()
      return
    }

    setStatus('sending')
    const res = await insertMessage({ guestName: name, message, giftId, amount, method })
    if (res.ok) {
      onDone()
    } else {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
      <label className="flex flex-col gap-1">
        <span className="font-serif text-sm text-ink-soft">Seu nome</span>
        <input
          type="text"
          required
          maxLength={NAME_MAX}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Como você assina?"
          className="rounded-xl border border-blush-200 bg-ivory px-4 py-3 font-serif text-lg text-ink outline-none focus:border-blush-400"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-serif text-sm text-ink-soft">Mensagem para o casal (opcional)</span>
        <textarea
          rows={3}
          maxLength={MESSAGE_MAX}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Deixe um recadinho ❤️"
          className="resize-none rounded-xl border border-blush-200 bg-ivory px-4 py-3 font-serif text-lg text-ink outline-none focus:border-blush-400"
        />
        <span className="self-end font-serif text-xs text-ink-muted">
          {message.length}/{MESSAGE_MAX}
        </span>
      </label>

      {status === 'error' && (
        <p className="font-serif text-sm text-blush-600">
          Não conseguimos salvar agora, mas seu presente já vale 💗 — tente novamente.
        </p>
      )}

      <button type="submit" className="btn-primary w-full" disabled={status === 'sending'}>
        {status === 'sending' ? 'Enviando…' : submitLabel}
      </button>
    </form>
  )
}
