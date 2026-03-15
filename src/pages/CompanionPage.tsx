import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CompanionOrb } from '../components/companion/CompanionOrb'
import { LiveControls } from '../components/companion/LiveControls'
import { TranscriptPanel } from '../components/companion/TranscriptPanel'
import { StarField } from '../components/companion/StarField'
import { Waveform } from '../components/companion/Waveform'
import { ScripturePeek } from '../components/companion/ScripturePeek'

import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useLive } from '../hooks/useLive'
import { useMessages } from '../hooks/useMessages'
import { useSessions } from '../hooks/useSessions'
import { useAuth } from '../hooks/useAuth'
import { getSession } from '../services/sessions'
import { addMessage, getMaxSequenceIndex } from '../services/messages'
import { liveService } from '../services/live'
import { supabase } from '../lib/supabase/client'
import type { Session, SessionMode } from '../lib/types'
import type { LiveStreamEvent } from '../services/live'

const MODE_OPTIONS: { value: SessionMode; label: string; icon: string }[] = [
  { value: 'companion', label: 'Companion', icon: '🕊' },
  { value: 'bridge', label: 'Bridge', icon: '🌉' },
  { value: 'tutor', label: 'Tutor', icon: '📖' },
]

export default function CompanionPage() {
  const { sessionId } = useParams<{ sessionId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { startSession, endSession } = useSessions()

  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [partialText, setPartialText] = useState<string | undefined>()
  const [textSending, setTextSending] = useState(false)
  const [timer, setTimer] = useState(0)
  const [mode, setMode] = useState<SessionMode>('companion')

  const { messages, loading: messagesLoading, sendMessage, appendMessage } = useMessages(session?.id)
  const handleLiveEvent = useCallback((event: LiveStreamEvent) => {
    if (!session || !user) return
    if (event.type === 'transcript_partial') {
      const p = event.payload as { text: string; speaker: string }
      if (p.speaker === 'assistant') setPartialText(p.text)
    } else if (event.type === 'transcript_final') {
      const p = event.payload as { text: string; speaker: string }
      setPartialText(undefined)
      getMaxSequenceIndex(session.id).then(maxIdx => {
        addMessage({
          session_id: session.id,
          user_id: user.id,
          role: p.speaker === 'user' ? 'user' : 'assistant',
          content: p.text,
          sequence_index: maxIdx + 1,
        }).then(msg => appendMessage(msg)).catch(console.error)
      })
    }
  }, [session, user, appendMessage])

  const live = useLive({ onTranscriptEvent: handleLiveEvent })

  useEffect(() => {
    if (!live.isActive) return
    const interval = setInterval(() => setTimer(t => t + 1), 1000)
    return () => clearInterval(interval)
  }, [live.isActive])

  useEffect(() => {
    async function loadOrCreate() {
      setSessionLoading(true)
      try {
        if (sessionId) {
          const existing = await getSession(sessionId)
          if (existing) {
            setSession(existing)
            if (existing.mode) setMode(existing.mode as SessionMode)
          } else {
            const s = await startSession(mode)
            setSession(s)
            navigate(`/companion/${s.id}`, { replace: true })
          }
        } else {
          const s = await startSession(mode)
          setSession(s)
          navigate(`/companion/${s.id}`, { replace: true })
        }
      } catch {
        // fallback
      } finally {
        setSessionLoading(false)
      }
    }
    if (user) loadOrCreate()
  }, [sessionId, user, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = useCallback(() => {
    if (!session || !user) return
    setTimer(0)
    live.connect({
      sessionId: session.id,
      userId: user.id,
      mode,
    })
  }, [session, user, live, mode])

  const handleDisconnect = useCallback(async () => {
    live.disconnect()
    if (session?.status === 'active') {
      await endSession(session.id)
      setSession(prev => prev ? { ...prev, status: 'completed', ended_at: new Date().toISOString() } : prev)
    }
  }, [live, session, endSession])

  const handleSendText = async (text: string) => {
    if (!session || !user || !text.trim()) return
    setTextSending(true)

    try {
      await sendMessage(text, 'user')

      if (liveService.isConnected()) {
        liveService.sendText(text)
      } else {
        const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }))

        const { data: authData } = await supabase.auth.getSession()
        const accessToken = authData.session?.access_token
        if (!accessToken) throw new Error('Not authenticated')

        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-text`
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify({ sessionId: session.id, message: text, history }),
        })

        if (!res.ok) throw new Error(`Chat request failed: ${res.status}`)
        const data = await res.json()

        const responseText = (data as { response?: string })?.response
          ?? "Peace be with you. I'm here and listening."

        await sendMessage(responseText, 'assistant')
      }
    } catch (err) {
      console.error('[CompanionPage] Text send error:', err)
      await sendMessage(
        "I'm here with you. Let me gather my thoughts for a moment.",
        'assistant'
      ).catch(console.error)
    } finally {
      setTextSending(false)
    }
  }

  const formatTimer = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0')
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0')
    const sec = (s % 60).toString().padStart(2, '0')
    return `${h}:${m}:${sec}`
  }

  if (sessionLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-night">
        <LoadingSpinner size="lg" label="Preparing your space..." />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center bg-night px-4">
        <div className="text-center">
          <p className="text-cream/[0.28] mb-4">Unable to load session.</p>
          <button onClick={() => navigate('/')} className="text-gold text-sm hover:text-gold-soft transition-colors">
            Return home
          </button>
        </div>
      </div>
    )
  }

  const isThinking = live.state === 'paused' || live.state === 'connecting'

  return (
    <div className="h-full grid grid-cols-1 lg:grid-cols-[1fr_340px]">
      <div className="relative flex flex-col items-center justify-center overflow-hidden bg-night">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(201,168,76,0.045) 0%, transparent 65%), radial-gradient(ellipse 40% 40% at 20% 80%, rgba(100,60,20,0.06) 0%, transparent 55%), radial-gradient(ellipse 30% 30% at 80% 15%, rgba(201,168,76,0.025) 0%, transparent 50%)'
        }} />
        <StarField />

        <div className="absolute top-6 left-6 flex flex-col gap-1 z-10">
          <div className="font-serif text-base text-cream font-normal">{MODE_OPTIONS.find(m => m.value === mode)?.label ?? 'Companion'} Session</div>
          <div className="text-[0.7rem] text-cream/[0.28] tracking-wide">{user?.email}</div>
          {live.isActive && (
            <div className="font-display text-[0.65rem] text-gold tracking-[0.2em] mt-1">
              {formatTimer(timer)}
            </div>
          )}
          {!live.isActive && (
            <div className="flex gap-1.5 mt-2">
              {MODE_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => { if (value !== mode) { setMode(value); setSession(null); navigate('/companion', { replace: true }) } }}
                  className={`px-2.5 py-1 text-[0.65rem] font-display tracking-[0.15em] uppercase border transition-colors ${
                    value === mode
                      ? 'border-gold/40 bg-gold/[0.12] text-gold'
                      : 'border-gold/10 text-cream/30 hover:text-cream/60 hover:border-gold/20'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        <CompanionOrb state={live.state} />

        <div className="mt-2">
          <Waveform
            visible={live.state === 'listening' || live.state === 'speaking'}
            speaking={live.state === 'speaking'}
          />
        </div>

        <div className="mt-4">
          <LiveControls
            state={live.state}
            isMicActive={live.isMicActive}
            isFallback={live.isFallback}
            onConnect={handleConnect}
            onDisconnect={handleDisconnect}
            onToggleMic={live.toggleMic}
            onHolyPause={live.triggerHolyPause}
          />
        </div>
      </div>

      <aside className="hidden lg:flex flex-col bg-deep border-l border-gold/[0.08] overflow-hidden">
        <div className="px-6 py-5 border-b border-gold/[0.08] flex items-center justify-between shrink-0">
          <div className="font-display text-[0.6rem] tracking-[0.3em] text-gold uppercase">Transcript</div>
          <div className="text-[0.7rem] text-cream/[0.28] flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-gold animate-mode-pulse" />
            {MODE_OPTIONS.find(m => m.value === mode)?.label ?? 'Companion'}
          </div>
        </div>

        <TranscriptPanel
          messages={messages}
          loading={messagesLoading}
          partialText={partialText}
          isThinking={isThinking}
        />

        <div className="px-6 py-4 border-t border-gold/[0.08] shrink-0">
          <ScripturePeek />

          {session.status === 'active' && (
            <TextInputBar onSend={handleSendText} disabled={live.isConnecting || textSending} sending={textSending} />
          )}
          {session.status !== 'active' && (
            <p className="text-[0.72rem] text-cream/[0.28] text-center leading-relaxed">
              Eliana honors silence. If you pause, she waits.
            </p>
          )}
        </div>
      </aside>
    </div>
  )
}

function TextInputBar({ onSend, disabled, sending }: { onSend: (text: string) => void; disabled: boolean; sending?: boolean }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-3">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Write to Eliana..."
        disabled={disabled}
        className="flex-1 px-3 py-2 bg-transparent border border-gold/[0.15] text-cream text-sm outline-none transition-colors focus:border-gold/40 disabled:opacity-50 placeholder:text-cream/[0.2]"
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="px-4 py-2 bg-gold/[0.12] border border-gold/20 text-gold text-xs font-display tracking-[0.15em] uppercase transition-colors hover:bg-gold/20 disabled:opacity-30 disabled:cursor-not-allowed"
      >
        {sending ? '...' : 'Send'}
      </button>
    </form>
  )
}
