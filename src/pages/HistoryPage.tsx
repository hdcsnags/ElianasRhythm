import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen } from 'lucide-react'
import { SessionList } from '../components/history/SessionList'
import { useSessions } from '../hooks/useSessions'
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-5 h-5 text-amber-600" />
        <h1 className="text-xl font-semibold text-stone-900">Session History</h1>
      </div>

      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {(Object.keys(filterLabels) as ModeFilter[]).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={[
              'flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              filter === f
                ? 'bg-amber-700 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200',
            ].join(' ')}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      <SessionList
        sessions={filtered}
        loading={loading}
        error={error}
        onSelect={handleSelect}
        onRetry={refetch}
      />
    </div>
  )
}
