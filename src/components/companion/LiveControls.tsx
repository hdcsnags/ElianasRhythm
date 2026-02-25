import { Mic, MicOff, PhoneOff, Phone, Pause } from 'lucide-react'
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
  const isActive = !isIdle
  const isConnecting = state === 'connecting'
  const isError = state === 'error'

  return (
    <div className="flex flex-col items-center gap-4">
      {isFallback && isActive && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Demo mode — live relay not connected
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-600">Connection error. Please try again.</p>
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
              disabled={isConnecting}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600',
                isMicActive
                  ? 'bg-amber-700 text-white hover:bg-amber-800'
                  : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
              )}
              title={isMicActive ? 'Mute mic' : 'Unmute mic'}
            >
              {isMicActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={onHolyPause}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                'bg-stone-100 text-stone-500 hover:bg-stone-200',
                'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-400'
              )}
              title="Holy Pause"
            >
              <Pause className="w-4 h-4" />
            </button>

            <button
              onClick={onDisconnect}
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center transition-all',
                'bg-red-100 text-red-600 hover:bg-red-200',
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
