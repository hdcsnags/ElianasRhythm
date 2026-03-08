import { useState, useEffect } from 'react'
import { BookOpen } from 'lucide-react'
import type { ScriptureVaultEntry } from '../../lib/types'
import { getRandomScriptureEntry } from '../../services/scripture'

export function DailyVerse() {
  const [entry, setEntry] = useState<ScriptureVaultEntry | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRandomScriptureEntry()
      .then(setEntry)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-warm-100 p-5 animate-pulse">
        <div className="h-4 w-24 bg-amber-200/50 rounded mb-3" />
        <div className="h-3 w-full bg-amber-200/30 rounded mb-2" />
        <div className="h-3 w-3/4 bg-amber-200/30 rounded" />
      </div>
    )
  }

  if (!entry) return null

  return (
    <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-warm-100 p-5">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-amber-700" />
        <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Word for Today</span>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-stone-900">{entry.term}</span>
          {entry.original_script && (
            <span className="text-base text-amber-700 font-medium">{entry.original_script}</span>
          )}
        </div>
        {entry.phonetic && (
          <p className="text-xs text-stone-500 italic">{entry.phonetic}</p>
        )}
        <p className="text-sm text-stone-700 leading-relaxed">{entry.plain_meaning}</p>
        {entry.theological_note && (
          <p className="text-xs text-stone-500 leading-relaxed italic">{entry.theological_note}</p>
        )}
        {entry.verse_reference && (
          <p className="text-xs font-medium text-amber-700 pt-1">{entry.verse_reference}</p>
        )}
      </div>
    </div>
  )
}
