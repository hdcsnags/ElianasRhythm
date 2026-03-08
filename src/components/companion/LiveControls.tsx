import { Mic, MicOff, PhoneOff, Phone, Pause, MessageSquare } from 'lucide-react'
import { Button } from '../ui/Button'
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
  const isActive = !isIdle && state !== 'error'
  const isConnecting = state === 'connecting'
  const isError = state === 'error'
  const isSpeaking = state === 'speaking'

  return (
    <div className="flex flex-col items-center gap-4">
      {isFallback && isActive && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          <MessageSquare className="w-3 h-3" />
          Text mode -- use the input below to chat with Eliana
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm text-red-600">Connection lost. You can reconnect or continue via text.</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        {isIdle || isError ? (
          <Button
            variant="primary"
            size="lg"
            onClick={onConnect}
            loading={isConnecting}
            className="rounded-full px-8"
          >
            <Phone className="w-4 h-4" />
            {isError ? 'Reconnect' : 'Begin Session'}
          </Button>
        ) : (
          <>
            <button
              onClick={onToggleMic}
              disabled={isConnecting || isFallback}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600',
                isFallback
                  ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                  : isMicActive
                    ? 'bg-amber-700 text-white hover:bg-amber-800 shadow-lg shadow-amber-700/20'
                    : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
              )}
              title={isFallback ? 'Mic unavailable in text mode' : isMicActive ? 'Mute mic' : 'Unmute mic'}
            >
              {isMicActive && !isFallback ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={onHolyPause}
              disabled={!isSpeaking}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400',
                isSpeaking
                  ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  : 'bg-stone-100 text-stone-300 cursor-not-allowed'
              )}
              title="Holy Pause"
            >
              <Pause className="w-4 h-4" />
            </button>

            <button
              onClick={onDisconnect}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200',
                'bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              )}
              title="End session"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
