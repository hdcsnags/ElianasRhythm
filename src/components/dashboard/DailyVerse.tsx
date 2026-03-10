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
      <div className="border border-gold/[0.08] bg-surface p-5 animate-pulse">
        <div className="h-4 w-24 bg-gold/10 mb-3" />
        <div className="h-3 w-full bg-gold/[0.05] mb-2" />
        <div className="h-3 w-3/4 bg-gold/[0.05]" />
      </div>
    )
  }

  if (!entry) return null

  return (
    <div className="border border-gold/[0.12] bg-gold/[0.03] p-5">
      <div className="flex items-center gap-2 mb-3">
        <BookOpen className="w-4 h-4 text-gold" />
        <span className="text-[0.55rem] font-display tracking-[0.3em] text-gold uppercase">Word for Today</span>
      </div>
      <div className="space-y-2.5">
        <div className="flex items-baseline gap-2">
          <span className="font-serif text-2xl text-gold">{entry.term}</span>
          {entry.original_script && (
            <span className="font-serif text-lg text-cream">{entry.original_script}</span>
          )}
        </div>
        {entry.phonetic && (
          <p className="text-xs text-cream/[0.28] italic font-serif">{entry.phonetic}</p>
        )}
        <p className="text-sm text-cream/[0.4] leading-relaxed">{entry.plain_meaning}</p>
        {entry.theological_note && (
          <p className="text-xs text-cream/[0.28] leading-relaxed italic">{entry.theological_note}</p>
        )}
        {entry.verse_reference && (
          <p className="text-[0.55rem] font-display tracking-[0.2em] text-gold/50 uppercase pt-1">{entry.verse_reference}</p>
        )}
      </div>
    </div>
  )
}
