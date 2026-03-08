import { useEffect, useRef } from 'react'
import { cn } from '../../lib/utils'
import type { LiveSessionState } from '../../services/live'

interface CompanionOrbProps {
  state: LiveSessionState
  size?: 'sm' | 'md' | 'lg'
}

const stateConfig: Record<LiveSessionState, {
  label: string
  gradient: string
  glow: string
  animate: 'none' | 'breathe' | 'pulse' | 'wave'
}> = {
  idle: {
    label: 'Ready',
    gradient: 'from-amber-100 to-amber-200',
    glow: 'shadow-amber-200/40',
    animate: 'none',
  },
  connecting: {
    label: 'Connecting',
    gradient: 'from-amber-200 to-amber-300',
    glow: 'shadow-amber-300/50',
    animate: 'pulse',
  },
  listening: {
    label: 'Listening',
    gradient: 'from-amber-300 to-amber-500',
    glow: 'shadow-amber-400/60',
    animate: 'breathe',
  },
  speaking: {
    label: 'Speaking',
    gradient: 'from-amber-400 to-amber-600',
    glow: 'shadow-amber-500/70',
    animate: 'wave',
  },
  paused: {
    label: 'Paused',
    gradient: 'from-stone-200 to-stone-300',
    glow: 'shadow-stone-300/30',
    animate: 'none',
  },
  error: {
    label: 'Error',
    gradient: 'from-red-200 to-red-400',
    glow: 'shadow-red-300/40',
    animate: 'none',
  },
  disconnected: {
    label: 'Disconnected',
    gradient: 'from-stone-100 to-stone-200',
    glow: 'shadow-stone-200/20',
    animate: 'none',
  },
}

const sizes = {
  sm: { container: 'w-20 h-20', orb: 'w-16 h-16', inner: 'w-8 h-8' },
  md: { container: 'w-36 h-36', orb: 'w-28 h-28', inner: 'w-14 h-14' },
  lg: { container: 'w-48 h-48', orb: 'w-40 h-40', inner: 'w-20 h-20' },
}

export function CompanionOrb({ state, size = 'md' }: CompanionOrbProps) {
  const config = stateConfig[state]
  const s = sizes[size]
  const prevState = useRef(state)

  useEffect(() => {
    prevState.current = state
  }, [state])

  const animClass =
    config.animate === 'breathe' ? 'animate-orb-breathe' :
    config.animate === 'pulse' ? 'animate-orb-pulse' :
    config.animate === 'wave' ? 'animate-orb-wave' : ''

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={cn('relative flex items-center justify-center', s.container)}>
        {config.animate !== 'none' && (
          <div className={cn(
            'absolute rounded-full bg-gradient-to-br opacity-20',
            config.gradient,
            s.orb,
            config.animate === 'wave' ? 'animate-ping' : 'animate-pulse'
          )} style={{ animationDuration: config.animate === 'wave' ? '2s' : '3s' }} />
        )}

        {config.animate === 'wave' && (
          <div className={cn(
            'absolute rounded-full bg-gradient-to-br opacity-10',
            config.gradient,
            s.orb,
            'animate-ping'
          )} style={{ animationDuration: '3s', animationDelay: '0.5s' }} />
        )}

        <div className={cn(
          'relative rounded-full bg-gradient-to-br flex items-center justify-center',
          'shadow-xl transition-all duration-700 ease-in-out',
          config.gradient,
          config.glow,
          s.orb,
          animClass
        )}>
          <div className={cn(
            'rounded-full bg-white/30 backdrop-blur-sm transition-all duration-700',
            s.inner,
            config.animate === 'wave' && 'animate-orb-inner-wave'
          )} />
        </div>
      </div>

      <span className={cn(
        'text-xs font-medium tracking-widest uppercase transition-all duration-500',
        state === 'error' ? 'text-red-500' : 'text-stone-400'
      )}>
        {config.label}
      </span>
    </div>
  )
}
