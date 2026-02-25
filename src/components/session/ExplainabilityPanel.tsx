import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import type { ExplainabilityEntry } from '../../lib/types'

interface ExplainabilityPanelProps {
  entries?: ExplainabilityEntry[]
  isPlaceholder?: boolean
}

const SAMPLE_ENTRY: ExplainabilityEntry = {
  verseReference: 'Numbers 6:24-26',
  sourceLabel: 'Hebrew Scripture',
  originalTerm: 'Shalom',
  originalTermLanguage: 'Hebrew (שָׁלוֹם)',
  plainMeaning: 'More than the absence of conflict — wholeness, completeness, and fullness of flourishing.',
  notes: 'Used here in the sense of deep relational peace.',
}

export function ExplainabilityPanel({ entries, isPlaceholder = false }: ExplainabilityPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const displayEntries = entries?.length ? entries : (isPlaceholder ? [SAMPLE_ENTRY] : [])

  if (displayEntries.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-100 bg-amber-50/50 overflow-hidden">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-700" />
          <span className="text-sm font-medium text-amber-900">Grounded Context</span>
          {isPlaceholder && (
            <span className="text-xs text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">sample</span>
          )}
        </div>
        {isOpen
          ? <ChevronUp className="w-4 h-4 text-amber-600" />
          : <ChevronDown className="w-4 h-4 text-amber-600" />
        }
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-amber-100">
          {displayEntries.map((entry, i) => (
            <ExplainabilityEntry key={i} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

function ExplainabilityEntry({ entry }: { entry: ExplainabilityEntry }) {
  return (
    <div className="pt-3 space-y-2">
      {entry.verseReference && (
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-amber-700 w-28 flex-shrink-0">Reference</span>
          <span className="text-xs text-stone-700">{entry.verseReference}</span>
        </div>
      )}
      {entry.sourceLabel && (
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-amber-700 w-28 flex-shrink-0">Source</span>
          <span className="text-xs text-stone-700">{entry.sourceLabel}</span>
        </div>
      )}
      {entry.originalTerm && (
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-amber-700 w-28 flex-shrink-0">Original Term</span>
          <span className="text-xs text-stone-700 font-medium">{entry.originalTerm}</span>
        </div>
      )}
      {entry.originalTermLanguage && (
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-amber-700 w-28 flex-shrink-0">Language</span>
          <span className="text-xs text-stone-600">{entry.originalTermLanguage}</span>
        </div>
      )}
      {entry.plainMeaning && (
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-amber-700 w-28 flex-shrink-0">Meaning</span>
          <span className="text-xs text-stone-700 leading-relaxed">{entry.plainMeaning}</span>
        </div>
      )}
      {entry.notes && (
        <div className="flex items-start gap-2">
          <span className="text-xs font-medium text-amber-700 w-28 flex-shrink-0">Note</span>
          <span className="text-xs text-stone-500 italic leading-relaxed">{entry.notes}</span>
        </div>
      )}
    </div>
  )
}
