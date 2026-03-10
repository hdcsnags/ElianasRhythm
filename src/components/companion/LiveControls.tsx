import { Mic, MicOff, Pause, X } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { LiveSessionState } from '../../services/live'

interface LiveControlsProps {
  state: LiveSessionState
  isMicActive: boolean
  isFallback: boolean
  onConnect: () => void
  onDisconnect: () => void
  onToggleMic: () => void
  onHolyPause: () => void
}

export function LiveControls({
  state,
  isMicActive,
  isFallback,
  onConnect,
  onDisconnect,
  onToggleMic,
  onHolyPause,
}: LiveControlsProps) {
  const isIdle = state === 'idle' || state === 'disconnected'
  const isConnecting = state === 'connecting'
  const isSpeaking = state === 'speaking'

  if (isIdle || state === 'error') {
    return (
      <div className="flex items-center gap-5">
        <button
          onClick={onConnect}
          disabled={isConnecting}
          className="w-16 h-16 rounded-full border border-gold/[0.35] bg-transparent flex items-center justify-center text-gold text-[1.3rem] transition-all duration-250 hover:bg-gold hover:text-night hover:shadow-[0_0_30px_rgba(201,168,76,0.4)] disabled:opacity-50"
        >
          {isConnecting ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-5">
      <button
        onClick={onHolyPause}
        disabled={!isSpeaking}
        className={cn(
          'w-12 h-12 rounded-full border flex items-center justify-center transition-all duration-250 outline-none',
          isSpeaking
            ? 'border-gold/20 text-cream/[0.28] hover:border-gold hover:text-gold hover:bg-gold/[0.12]'
            : 'border-cream/10 text-cream/10 cursor-not-allowed'
        )}
        title="Pause"
      >
        <Pause className="w-4 h-4" />
      </button>

      <button
        onClick={onToggleMic}
        disabled={isFallback}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-250 outline-none',
          isFallback
            ? 'border border-cream/10 text-cream/10 cursor-not-allowed'
            : isMicActive
              ? 'bg-gold border-gold text-night shadow-[0_0_20px_rgba(201,168,76,0.3)]'
              : 'border border-gold/20 text-cream/[0.28] hover:border-gold hover:text-gold hover:bg-gold/[0.12]'
        )}
        title={isMicActive ? 'Mute' : 'Unmute'}
      >
        {isMicActive && !isFallback ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>

      <button
        onClick={onDisconnect}
        className="w-12 h-12 rounded-full border border-danger/30 text-danger/60 flex items-center justify-center transition-all duration-250 outline-none hover:border-danger hover:text-danger hover:bg-danger/10"
        title="End Session"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
