import { cn } from '../../lib/utils'
import type { LiveSessionState } from '../../services/live'

interface CompanionOrbProps {
  state: LiveSessionState
  onClick?: () => void
}

const stateConfig: Record<LiveSessionState, {
  label: string
  innerStyle: string
  shadowStyle: string
  animation: string
  ringAnimation: string
  labelColor: string
}> = {
  idle: {
    label: 'Ready',
    innerStyle: 'bg-gradient-to-br from-[#C4B89A] via-[#8A7A5A] to-[#4A3C20]',
    shadowStyle: 'shadow-[0_0_30px_rgba(150,130,80,0.2),0_0_60px_rgba(150,130,80,0.05)]',
    animation: 'animate-orb-breathe',
    ringAnimation: 'opacity-30',
    labelColor: 'text-cream/[0.28]',
  },
  connecting: {
    label: 'Connecting',
    innerStyle: 'bg-gradient-to-br from-[#D4B06A] via-[#C9A84C] to-[#8B6520]',
    shadowStyle: 'shadow-[0_0_40px_rgba(201,168,76,0.3),0_0_80px_rgba(201,168,76,0.1)]',
    animation: 'animate-orb-pulse',
    ringAnimation: 'animate-ring-spin opacity-50 border-dashed',
    labelColor: 'text-gold',
  },
  listening: {
    label: 'Listening',
    innerStyle: 'bg-gradient-to-br from-[#F0D878] via-[#D4B040] via-[#C9A84C] to-[#8B6520]',
    shadowStyle: 'shadow-[0_0_60px_rgba(201,168,76,0.5),0_0_120px_rgba(201,168,76,0.2)]',
    animation: 'animate-orb-listen',
    ringAnimation: 'animate-ring-pulse',
    labelColor: 'text-gold-soft',
  },
  speaking: {
    label: 'Speaking',
    innerStyle: 'bg-gradient-to-br from-[#FFE89A] via-[#E8C840] via-[#C9A84C] to-[#9B7830]',
    shadowStyle: 'shadow-[0_0_80px_rgba(220,190,60,0.6),0_0_160px_rgba(201,168,76,0.25)]',
    animation: 'animate-orb-speak',
    ringAnimation: 'animate-ring-pulse border-gold/20',
    labelColor: 'text-[#FFE89A]',
  },
  paused: {
    label: 'Paused',
    innerStyle: 'bg-gradient-to-br from-[#C4B89A] via-[#8A7A5A] to-[#4A3C20]',
    shadowStyle: 'shadow-[0_0_30px_rgba(150,130,80,0.2)]',
    animation: '',
    ringAnimation: 'opacity-30',
    labelColor: 'text-cream/[0.28]',
  },
  error: {
    label: 'Connection Error',
    innerStyle: 'bg-gradient-to-br from-[#D4806A] via-[#C0524A] to-[#802820]',
    shadowStyle: 'shadow-[0_0_40px_rgba(192,82,74,0.4),0_0_80px_rgba(192,82,74,0.1)]',
    animation: 'animate-orb-breathe',
    ringAnimation: 'border-danger/30',
    labelColor: 'text-[#E07870]',
  },
  disconnected: {
    label: 'Ready',
    innerStyle: 'bg-gradient-to-br from-[#C4B89A] via-[#8A7A5A] to-[#4A3C20]',
    shadowStyle: 'shadow-[0_0_30px_rgba(150,130,80,0.2),0_0_60px_rgba(150,130,80,0.05)]',
    animation: 'animate-orb-breathe',
    ringAnimation: 'opacity-30',
    labelColor: 'text-cream/[0.28]',
  },
}

export function CompanionOrb({ state, onClick }: CompanionOrbProps) {
  const config = stateConfig[state]

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center mb-6">
        <div className={cn(
          'absolute w-[180px] h-[180px] rounded-full border border-gold/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          config.ringAnimation
        )} />
        <div className={cn(
          'absolute w-[230px] h-[230px] rounded-full border border-gold/[0.06] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          config.ringAnimation
        )} style={{ animationDelay: '0.5s' }} />
        <div className={cn(
          'absolute w-[290px] h-[290px] rounded-full border border-gold/[0.03] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
          config.ringAnimation
        )} style={{ animationDelay: '1s' }} />

        <div
          className="w-[130px] h-[130px] rounded-full relative z-[2] cursor-pointer transition-transform duration-400 hover:scale-[1.03]"
          onClick={onClick}
        >
          <div className={cn(
            'w-full h-full rounded-full transition-all duration-600 ease-in-out',
            config.innerStyle,
            config.shadowStyle,
            config.animation
          )} />
        </div>
      </div>

      <div className={cn(
        'font-display text-[0.62rem] tracking-[0.35em] uppercase transition-colors duration-400 h-5',
        config.labelColor
      )}>
        {config.label}
      </div>
    </div>
  )
}
