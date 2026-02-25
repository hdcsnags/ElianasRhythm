import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Info } from 'lucide-react'
import { CompanionOrb } from '../components/companion/CompanionOrb'
import { LiveControls } from '../components/companion/LiveControls'
import { TranscriptPanel } from '../components/companion/TranscriptPanel'
import { ExplainabilityPanel } from '../components/session/ExplainabilityPanel'
import { SessionMetadata } from '../components/session/SessionMetadata'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { useLive } from '../hooks/useLive'
import { useMessages } from '../hooks/useMessages'
import { useSessions } from '../hooks/useSessions'
import { useAuth } from '../hooks/useAuth'
import { getSession } from '../services/sessions'
import { addMessage } from '../services/messages'
import type { Session } from '../lib/types'
import type { LiveStreamEvent } from '../services/live'

export default function CompanionPage() {
  const { sessionId } = useParams<{ sessionId?: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { startSession, endSession } = useSessions()

  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  const [partialText, setPartialText] = useState<string | undefined>()
  const [showSidebar, setShowSidebar] = useState(false)

  const { messages, loading: messagesLoading, sendMessage, appendMessage } = useMessages(session?.id)

  const handleLiveEvent = useCallback((event: LiveStreamEvent) => {
    if (!session || !user) return
    if (event.type === 'transcript_partial') {
      const p = event.payload as { text: string; speaker: string }
      if (p.speaker === 'assistant') setPartialText(p.text)
    } else if (event.type === 'transcript_final') {
      const p = event.payload as { text: string; speaker: string; messageId?: string }
      setPartialText(undefined)
      // Persist the final message to DB
      const nextIndex = messages.length
      addMessage({
        session_id: session.id,
        user_id: user.id,
        role: p.speaker === 'user' ? 'user' : 'assistant',
        content: p.text,
        sequence_index: nextIndex,
      }).then(msg => appendMessage(msg)).catch(console.error)
    }
  }, [session, user, messages.length, appendMessage])

  const live = useLive({ onTranscriptEvent: handleLiveEvent })

  useEffect(() => {
    async function loadOrCreate() {
      setSessionLoading(true)
      try {
        if (sessionId) {
          const existing = await getSession(sessionId)
          if (existing) {
            setSession(existing)
          } else {
            const s = await startSession('companion')
            setSession(s)
            navigate(`/companion/${s.id}`, { replace: true })
          }
        } else {
          const s = await startSession('companion')
          setSession(s)
          navigate(`/companion/${s.id}`, { replace: true })
        }
      } catch {
        // fallback: show error state
      } finally {
        setSessionLoading(false)
      }
    }
    if (user) loadOrCreate()
  }, [sessionId, user]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleConnect = useCallback(() => {
    if (!session || !user) return
    live.connect({
      sessionId: session.id,
      userId: user.id,
      mode: 'companion',
    })
  }, [session, user, live])

  const handleDisconnect = useCallback(async () => {
    live.disconnect()
    if (session?.status === 'active') {
      await endSession(session.id)
      setSession(prev => prev ? { ...prev, status: 'completed', ended_at: new Date().toISOString() } : prev)
    }
  }, [live, session, endSession])

  const handleSendText = async (text: string) => {
    if (!session || !text.trim()) return
    await sendMessage(text, 'user')
    // TODO [Phase 2]: Route text through live relay for LLM response
    // For Phase 1: simulate assistant acknowledgment
    setTimeout(async () => {
      await sendMessage(
        'I hear you. Let\'s sit with that for a moment.',
        'assistant'
      )
    }, 800)
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" label="Preparing your space…" />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-stone-600 mb-4">Unable to load session.</p>
          <button onClick={() => navigate('/')} className="text-amber-700 text-sm hover:text-amber-800">
            Return home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-stone-400 hover:text-stone-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-sm font-semibold text-stone-800">Companion Session</h1>
            <p className="text-xs text-stone-400">
              {session.status === 'active' ? 'In progress' : 'Completed'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSidebar(prev => !prev)}
          className="text-stone-400 hover:text-stone-700 transition-colors"
          title="Session info"
        >
          <Info className="w-5 h-5" />
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex flex-col items-center py-8 px-4 gap-6 border-b border-stone-100 bg-stone-50/50">
            <CompanionOrb state={live.state} size="md" />
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

          <div className="flex flex-col flex-1 overflow-hidden">
            <TranscriptPanel
              messages={messages}
              loading={messagesLoading}
              partialText={partialText}
            />

            {session.status === 'active' && (
              <TextInputBar onSend={handleSendText} disabled={live.isConnecting} />
            )}
          </div>
        </div>

        {showSidebar && (
          <aside className="w-72 border-l border-stone-200 bg-white p-4 space-y-4 overflow-y-auto hidden lg:block">
            <SessionMetadata session={session} messageCount={messages.length} />
            <ExplainabilityPanel isPlaceholder={messages.length > 0} />
          </aside>
        )}
      </div>
    </div>
  )
}

function TextInputBar({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [value, setValue] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!value.trim()) return
    onSend(value.trim())
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-t border-stone-200 bg-white">
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Write to Eliana…"
        disabled={disabled}
        className="flex-1 px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!value.trim() || disabled}
        className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  )
}
