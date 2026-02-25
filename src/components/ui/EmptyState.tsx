import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && (
        <div className="mb-4 text-stone-300">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium text-stone-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-stone-500 max-w-sm mb-6">{description}</p>
      )}
      {action}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <p className="text-sm text-stone-600 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-amber-700 hover:text-amber-800 font-medium"
        >
          Try again
        </button>
      )}
    </div>
  )
}
