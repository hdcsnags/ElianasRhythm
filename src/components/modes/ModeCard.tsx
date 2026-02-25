import { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
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
        'group relative w-full text-left rounded-2xl p-6 transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2',
        isPrimary
          ? 'bg-white border-amber-200 hover:border-amber-400 hover:shadow-md shadow-sm'
          : 'bg-white border-stone-200 hover:border-stone-300 hover:shadow-sm',
        disabled && 'opacity-60 cursor-not-allowed hover:border-stone-200 hover:shadow-none'
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center',
          isPrimary ? 'bg-amber-50 text-amber-700' : 'bg-stone-100 text-stone-600'
        )}>
          {icon}
        </div>
        {badge && (
          <Badge variant={badge.variant}>{badge.label}</Badge>
        )}
      </div>

      <h3 className={cn(
        'font-semibold mb-1.5',
        isPrimary ? 'text-stone-900 text-lg' : 'text-stone-800 text-base'
      )}>
        {title}
      </h3>
      <p className="text-sm text-stone-500 leading-relaxed">{description}</p>

      {!disabled && onClick && (
        <div className={cn(
          'flex items-center gap-1 mt-4 text-sm font-medium transition-colors',
          isPrimary ? 'text-amber-700 group-hover:text-amber-800' : 'text-stone-500 group-hover:text-stone-700'
        )}>
          Begin
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </div>
      )}
    </button>
  )
}
