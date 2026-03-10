import { Clock, Tag, Activity } from 'lucide-react'
import type { Session } from '../../lib/types'
import { formatDate, formatDuration, cn } from '../../lib/utils'

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

export function SessionMetadata({ session, messageCount = 0, className }: SessionMetadataProps) {
  const duration = formatDuration(session.started_at, session.ended_at)
  const mode = modeLabels[session.mode] ?? session.mode

  return (
    <div className={cn('border border-gold/[0.08] bg-surface p-4 space-y-3', className)}>
      <h4 className="text-[0.55rem] font-display tracking-[0.3em] text-gold uppercase">Session Info</h4>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-cream/[0.28]">
            <Activity className="w-3.5 h-3.5" />
            Mode
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[0.55rem] font-display tracking-wider uppercase border border-current px-1.5 py-px text-gold/50">
              {session.status === 'active' ? 'Live' : 'Ended'}
            </span>
            <span className="text-xs text-cream">{mode}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-cream/[0.28]">
            <Clock className="w-3.5 h-3.5" />
            Duration
          </span>
          <span className="text-xs text-cream">{duration}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-cream/[0.28]">
            <Tag className="w-3.5 h-3.5" />
            Exchanges
          </span>
          <span className="text-xs text-cream">{messageCount}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-cream/[0.28]">Started</span>
          <span className="text-xs text-cream">{formatDate(session.started_at)}</span>
        </div>
      </div>
    </div>
  )
}
