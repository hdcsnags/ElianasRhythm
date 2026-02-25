import { cn } from '../../lib/utils'
import type { LiveSessionState } from '../../services/live'

interface CompanionOrbProps {
  state: LiveSessionState
  size?: 'sm' | 'md' | 'lg'
}

const stateConfig: Record<LiveSessionState, { label: string; color: string; pulse: boolean; ring: string }> = {
  idle: {
    label: 'Ready',
    color: 'bg-amber-100',
    pulse: false,
    ring: 'ring-amber-200',
  },
  connecting: {
    label: 'Connecting',
    color: 'bg-amber-200',
    pulse: true,
    ring: 'ring-amber-300',
  },
  listening: {
    label: 'Listening',
    color: 'bg-amber-400',
    pulse: true,
    ring: 'ring-amber-300',
  },
  speaking: {
    label: 'Speaking',
    color: 'bg-amber-500',
    pulse: true,
    ring: 'ring-amber-400',
  },
  paused: {
    label: 'Paused',
    color: 'bg-stone-300',
    pulse: false,
    ring: 'ring-stone-200',
  },
  error: {
    label: 'Error',
    color: 'bg-red-300',
    pulse: false,
    ring: 'ring-red-200',
  },
  disconnected: {
    label: 'Disconnected',
    color: 'bg-stone-200',
    pulse: false,
    ring: 'ring-stone-100',
  },
}

export function CompanionOrb({ state, size = 'md' }: CompanionOrbProps) {
  const config = stateConfig[state]

  const sizes = {
    sm: { orb: 'w-16 h-16', inner: 'w-10 h-10', ring: 'w-16 h-16' },
    md: { orb: 'w-28 h-28', inner: 'w-18 h-18', ring: 'w-28 h-28' },
    lg: { orb: 'w-40 h-40', inner: 'w-28 h-28', ring: 'w-40 h-40' },
  }

  const s = sizes[size]

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        {config.pulse && (
          <>
            <div className={cn(
              'absolute rounded-full opacity-20 animate-ping',
              s.ring, config.color
            )} />
            <div className={cn(
              'absolute rounded-full opacity-10 animate-pulse',
              'scale-125',
              s.ring, config.color
            )} />
          </>
        )}
        <div className={cn(
          'rounded-full flex items-center justify-center ring-4 transition-all duration-700',
          s.orb, config.color, config.ring
        )}>
          <div className={cn(
            'rounded-full opacity-60',
            size === 'sm' ? 'w-6 h-6' : size === 'md' ? 'w-12 h-12' : 'w-20 h-20',
            config.color
          )} />
        </div>
      </div>
      <span className="text-xs text-stone-400 font-medium tracking-wide uppercase">
        {config.label}
      </span>
    </div>
  )
}
