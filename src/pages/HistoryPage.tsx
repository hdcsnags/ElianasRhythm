import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSessions } from '../hooks/useSessions'
import { formatDate, formatDuration } from '../lib/utils'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import type { Session } from '../lib/types'

type ModeFilter = 'all' | 'companion' | 'bridge' | 'tutor'

const filterLabels: Record<ModeFilter, string> = {
  all: 'All',
  companion: 'Companion',
  bridge: 'Bridge',
  tutor: 'Tutor',
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { sessions, loading, error, refetch } = useSessions()
  const [filter, setFilter] = useState<ModeFilter>('all')

  const filtered = filter === 'all'
    ? sessions
    : sessions.filter(s => s.mode === filter)

  const handleSelect = (session: Session) => {
    navigate(`/companion/${session.id}`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-2 flex items-center gap-3">
          History
          <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
        </div>
        <h1 className="font-serif text-3xl text-cream font-light mb-8">Session History</h1>

        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-1">
          {(Object.keys(filterLabels) as ModeFilter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={[
                'flex-shrink-0 px-4 py-1.5 font-display text-[0.55rem] tracking-[0.2em] uppercase border transition-all duration-200',
                filter === f
                  ? 'bg-gold/[0.12] border-gold/40 text-gold'
                  : 'border-cream/10 text-cream/[0.28] hover:border-gold/20 hover:text-cream/50',
              ].join(' ')}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <LoadingSpinner label="Loading sessions..." />
          </div>
        )}

        {error && (
          <div className="text-center py-16">
            <p className="text-danger text-sm mb-3">Failed to load sessions</p>
            <button onClick={refetch} className="text-gold text-sm hover:text-gold-soft transition-colors">
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-serif text-lg text-cream/[0.28]">No sessions yet</p>
            <p className="text-sm text-cream/[0.15] mt-2">Begin a companion session to start your journey.</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="space-y-2">
            {filtered.map(s => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-5 py-4 bg-surface border border-gold/[0.08] hover:border-gold/20 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-serif text-cream text-sm">
                    {s.title || `${s.mode.charAt(0).toUpperCase() + s.mode.slice(1)} Session`}
                  </div>
                  <div className="text-[0.7rem] text-cream/[0.28] mt-0.5 flex items-center gap-3">
                    <span>{formatDate(s.started_at)}</span>
                    <span className="font-display text-[0.55rem] tracking-[0.15em] uppercase border border-current px-1.5 py-px">
                      {s.mode}
                    </span>
                  </div>
                </div>
                <div className="text-[0.65rem] text-gold/50 font-display tracking-wider uppercase group-hover:text-gold transition-colors">
                  {formatDuration(s.started_at, s.ended_at)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
