import { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface BadgeProps {
  variant?: 'default' | 'amber' | 'sage' | 'prototype' | 'soon' | 'active' | 'error'
  size?: 'sm' | 'md'
  children: ReactNode
  className?: string
}

export function Badge({ variant = 'default', size = 'sm', children, className }: BadgeProps) {
  const base = 'inline-flex items-center font-medium rounded-full'

  const variants = {
    default: 'bg-stone-100 text-stone-600',
    amber: 'bg-amber-100 text-amber-800',
    sage: 'bg-emerald-100 text-emerald-800',
    prototype: 'bg-sky-100 text-sky-700',
    soon: 'bg-stone-100 text-stone-500',
    active: 'bg-emerald-100 text-emerald-700',
    error: 'bg-red-100 text-red-700',
  }

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  }

  return (
    <span className={cn(base, variants[variant], sizes[size], className)}>
      {children}
    </span>
  )
}
