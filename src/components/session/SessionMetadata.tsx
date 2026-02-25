import { Clock, Tag, Activity } from 'lucide-react'
import type { Session } from '../../lib/types'
import { formatDate, formatDuration } from '../../lib/utils'
import { Badge } from '../ui/Badge'
import { cn } from '../../lib/utils'

interface SessionMetadataProps {
  session: Session
  messageCount?: number
  className?: string
}

const modeLabels: Record<string, string> = {
  companion: 'Companion',
  bridge: 'Bridge',
  tutor: 'Tutor',
}

const statusVariant: Record<string, 'active' | 'default'> = {
  active: 'active',
  completed: 'default',
  archived: 'default',
}

export function SessionMetadata({ session, messageCount = 0, className }: SessionMetadataProps) {
  const duration = formatDuration(session.started_at, session.ended_at)
  const mode = modeLabels[session.mode] ?? session.mode

  return (
    <div className={cn('rounded-xl border border-stone-200 bg-white p-4 space-y-3', className)}>
      <h4 className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Session Info</h4>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-stone-500">
            <Activity className="w-3.5 h-3.5" />
            Mode
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant={session.status === 'active' ? 'active' : 'default'}>
              {statusVariant[session.status] === 'active' ? 'Live' : 'Ended'}
            </Badge>
            <span className="text-xs font-medium text-stone-700">{mode}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-stone-500">
            <Clock className="w-3.5 h-3.5" />
            Duration
          </span>
          <span className="text-xs font-medium text-stone-700">{duration}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-stone-500">
            <Tag className="w-3.5 h-3.5" />
            Exchanges
          </span>
          <span className="text-xs font-medium text-stone-700">{messageCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-stone-500">Started</span>
          <span className="text-xs text-stone-700">{formatDate(session.started_at)}</span>
        </div>
      </div>
    </div>
  )
}
