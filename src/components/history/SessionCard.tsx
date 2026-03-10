import { ChevronRight } from 'lucide-react'
import type { Session } from '../../lib/types'
import { formatDate, formatDuration } from '../../lib/utils'

interface SessionCardProps {
  session: Session
  onClick: () => void
}

const modeLabels: Record<string, string> = {
  companion: 'Companion',
  bridge: 'Bridge',
  tutor: 'Tutor',
}

export function SessionCard({ session, onClick }: SessionCardProps) {
  const modeLabel = modeLabels[session.mode] ?? session.mode
  const title = session.title ?? `${modeLabel} -- ${formatDate(session.started_at)}`

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-5 py-4 bg-surface border border-gold/[0.08] hover:border-gold/20 transition-all flex items-center justify-between group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-[0.55rem] font-display tracking-[0.15em] uppercase border border-gold/20 text-gold/50 px-1.5 py-px">
            {modeLabel}
          </span>
          {session.status === 'active' && (
            <span className="text-[0.55rem] font-display tracking-[0.15em] uppercase border border-emerald-500/30 text-emerald-400 px-1.5 py-px">
              Live
            </span>
          )}
        </div>
        <h3 className="font-serif text-sm text-cream truncate">{title}</h3>
        <div className="text-[0.7rem] text-cream/[0.28] mt-0.5">
          {formatDate(session.started_at)}
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[0.65rem] text-gold/50 font-display tracking-wider uppercase group-hover:text-gold transition-colors">
          {formatDuration(session.started_at, session.ended_at)}
        </span>
        <ChevronRight className="w-4 h-4 text-cream/[0.15] group-hover:text-cream/[0.3] transition-colors" />
      </div>
    </button>
  )
}
