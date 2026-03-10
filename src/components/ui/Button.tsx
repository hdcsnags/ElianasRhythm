import { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gradient-to-br from-gold to-[#A07830] text-night hover:brightness-110',
    secondary: 'border border-cream/20 text-cream hover:border-gold hover:text-gold bg-transparent',
    ghost: 'text-cream/[0.28] hover:text-cream bg-transparent',
    danger: 'border border-danger/30 text-danger/60 hover:border-danger hover:text-danger hover:bg-danger/10 bg-transparent',
  }

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 tracking-[0.1em] uppercase',
    md: 'text-sm px-5 py-2.5 gap-2 tracking-[0.1em] uppercase',
    lg: 'text-sm px-8 py-3 gap-2 tracking-[0.1em] uppercase font-medium',
  }

  return (
    <button
      disabled={disabled || loading}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
