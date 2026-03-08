import { useState } from 'react'
import { Heart, Plus } from 'lucide-react'
import { usePrayerLogs } from '../hooks/usePrayerLogs'
import { PrayerEntryForm } from '../components/prayer/PrayerEntryForm'
import { PrayerCard } from '../components/prayer/PrayerCard'
import { Button } from '../components/ui/Button'
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">Prayer Journal</h1>
          <p className="text-stone-500 mt-1 text-sm">
            A quiet place to pour out your heart before God.
          </p>
        </div>
        {!showForm && (
          <Button variant="primary" size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            New Prayer
          </Button>
        )}
      </div>

      {showForm && (
        <div className="bg-amber-50/50 rounded-xl border border-amber-100 p-5">
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
        <p className="text-sm text-red-600 text-center py-8">{error}</p>
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
  )
}
