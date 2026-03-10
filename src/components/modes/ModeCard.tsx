import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ModeCardProps {
  title: string
  description: string
  icon: ReactNode
  badge?: { label: string; variant: 'prototype' | 'soon' | 'active' }
  isPrimary?: boolean
  onClick?: () => void
  disabled?: boolean
}

export function ModeCard({ title, description, icon, badge, isPrimary, onClick, disabled }: ModeCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'group relative w-full text-left p-6 transition-all duration-200 border',
        isPrimary
          ? 'bg-gradient-to-br from-gold/[0.08] to-surface border-gold/25 hover:border-gold/40'
          : 'bg-surface border-gold/10 hover:border-gold/25',
        disabled && 'opacity-50 cursor-not-allowed hover:border-gold/10'
      )}
    >
      {isPrimary && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent" />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="text-gold/40">
          {icon}
        </div>
        {badge && (
          <span className={cn(
            'text-[0.55rem] font-display tracking-[0.15em] uppercase border px-1.5 py-px',
            badge.variant === 'active' ? 'border-gold text-gold' :
            badge.variant === 'prototype' ? 'border-cream/[0.28] text-cream/[0.28]' :
            'border-cream/10 text-cream/[0.15]'
          )}>
            {badge.label}
          </span>
        )}
      </div>

      <h3 className="font-serif text-xl text-cream mb-1.5">{title}</h3>
      <p className="text-sm text-cream/[0.28] leading-relaxed">{description}</p>
    </button>
  )
}
