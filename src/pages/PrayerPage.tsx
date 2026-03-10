import { useState } from 'react'
import { Heart, Plus } from 'lucide-react'
import { usePrayerLogs } from '../hooks/usePrayerLogs'
import { PrayerEntryForm } from '../components/prayer/PrayerEntryForm'
import { PrayerCard } from '../components/prayer/PrayerCard'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

export default function PrayerPage() {
  const { logs, loading, error, create, remove } = usePrayerLogs()
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (content: string, title?: string, tags?: string[]) => {
    await create(content, title, tags)
    setShowForm(false)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-2 flex items-center gap-3">
              Prayers
              <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
            </div>
            <h1 className="font-serif text-3xl text-cream font-light">Prayer Journal</h1>
            <p className="text-cream/[0.28] mt-1 text-sm">
              A quiet place to pour out your heart before God.
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gold/[0.12] border border-gold/20 text-gold text-xs font-display tracking-[0.15em] uppercase transition-colors hover:bg-gold/20"
            >
              <Plus className="w-4 h-4" />
              New Prayer
            </button>
          )}
        </div>

        {showForm && (
          <div className="border border-gold/[0.12] bg-gold/[0.03] p-5">
            <PrayerEntryForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <p className="text-sm text-danger text-center py-8">{error}</p>
        ) : logs.length === 0 ? (
          <EmptyState
            icon={<Heart className="w-6 h-6" />}
            title="No prayers yet"
            description="Start writing your first prayer or reflection above."
          />
        ) : (
          <div className="space-y-3">
            {logs.map(log => (
              <PrayerCard key={log.id} log={log} onDelete={remove} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
