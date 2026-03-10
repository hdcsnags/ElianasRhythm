import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  variant?: 'default' | 'amber' | 'sage' | 'prototype' | 'soon' | 'active' | 'error'
  size?: 'sm' | 'md'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  const base = 'inline-flex items-center font-display tracking-[0.15em] uppercase border'

  const variants = {
    default: 'border-cream/10 text-cream/[0.28]',
    amber: 'border-gold/30 text-gold',
    sage: 'border-emerald-500/30 text-emerald-400',
    prototype: 'border-cream/[0.28] text-cream/[0.28]',
    soon: 'border-cream/10 text-cream/[0.15]',
    active: 'border-emerald-500/30 text-emerald-400',
    error: 'border-danger/30 text-danger',
  }

  const sizes = {
    sm: 'text-[0.55rem] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  return (
    <span className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}
