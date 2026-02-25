import { BookOpen } from 'lucide-react'
import type { Session } from '../../lib/types'
import { SessionCard } from './SessionCard'
import { EmptyState, ErrorState } from '../ui/EmptyState'
import { LoadingSpinner } from '../ui/LoadingSpinner'

interface SessionListProps {
  sessions: Session[]
  loading: boolean
  error: string | null
  onSelect: (session: Session) => void
  onRetry?: () => void
}

export function SessionList({ sessions, loading, error, onSelect, onRetry }: SessionListProps) {
  if (loading) {
    return <LoadingSpinner className="py-16" label="Loading sessions…" />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="w-12 h-12" />}
        title="No sessions yet"
        description="Begin a Companion session to start your journey. Your conversations will appear here."
      />
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map(session => (
        <SessionCard
          key={session.id}
          session={session}
          onClick={() => onSelect(session)}
        />
      ))}
    </div>
  )
}
