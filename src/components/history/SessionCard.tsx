import { MessageSquare, Clock, ChevronRight } from 'lucide-react'
import type { Session } from '../../lib/types'
import { formatDate, formatDuration, truncate } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

interface SessionCardProps {
  session: Session
  onClick: () => void
}

const modeBadge: Record<string, { label: string; variant: 'amber' | 'sage' | 'default' }> = {
  companion: { label: 'Companion', variant: 'amber' },
  bridge: { label: 'Bridge', variant: 'sage' },
  tutor: { label: 'Tutor', variant: 'default' },
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const badge = modeBadge[session.mode] ?? { label: session.mode, variant: 'default' }
  const title = session.title ?? `${badge.label} — ${formatDate(session.started_at)}`

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left bg-white rounded-xl border border-stone-200 p-4',
        'hover:border-amber-200 hover:shadow-sm transition-all duration-150 group',
        'focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Badge variant={badge.variant}>{badge.label}</Badge>
            {session.status === 'active' && (
              <Badge variant="active">Live</Badge>
            )}
          </div>
          <h3 className="text-sm font-medium text-stone-800 truncate">{truncate(title, 60)}</h3>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-stone-400">
              <Clock className="w-3 h-3" />
              {formatDuration(session.started_at, session.ended_at)}
            </span>
            <span className="text-xs text-stone-400">{formatDate(session.started_at)}</span>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-400 flex-shrink-0 mt-0.5 transition-colors" />
      </div>
    </button>
  )
}
