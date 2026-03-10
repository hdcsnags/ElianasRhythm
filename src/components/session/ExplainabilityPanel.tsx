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
  originalTermLanguage: 'Hebrew',
  plainMeaning: 'More than the absence of conflict — wholeness, completeness, and fullness of flourishing.',
  notes: 'Used here in the sense of deep relational peace.',
}

export function ExplainabilityPanel({ entries, isPlaceholder = false }: ExplainabilityPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const displayEntries = entries?.length ? entries : (isPlaceholder ? [SAMPLE_ENTRY] : [])

  if (displayEntries.length === 0) return null

  return (
    <div className="border border-gold/[0.12] bg-gold/[0.03] overflow-hidden">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gold/[0.05] transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-gold" />
          <span className="text-sm text-gold">Grounded Context</span>
          {isPlaceholder && (
            <span className="text-[0.55rem] text-gold/50 font-display tracking-wider uppercase border border-gold/20 px-1.5 py-px">sample</span>
          )}
        </div>
        {isOpen
          ? <ChevronUp className="w-4 h-4 text-gold/50" />
          : <ChevronDown className="w-4 h-4 text-gold/50" />
        }
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3 border-t border-gold/[0.08]">
          {displayEntries.map((entry, i) => (
            <ExplainEntry key={i} entry={entry} />
          ))}
        </div>
      )}
    </div>
  )
}

function ExplainEntry({ entry }: { entry: ExplainabilityEntry }) {
  return (
    <div className="pt-3 space-y-2">
      {entry.verseReference && (
        <div className="flex items-start gap-2">
          <span className="text-xs text-gold/60 w-28 flex-shrink-0">Reference</span>
          <span className="text-xs text-cream">{entry.verseReference}</span>
        </div>
      )}
      {entry.sourceLabel && (
        <div className="flex items-start gap-2">
          <span className="text-xs text-gold/60 w-28 flex-shrink-0">Source</span>
          <span className="text-xs text-cream">{entry.sourceLabel}</span>
        </div>
      )}
      {entry.originalTerm && (
        <div className="flex items-start gap-2">
          <span className="text-xs text-gold/60 w-28 flex-shrink-0">Original Term</span>
          <span className="text-xs text-cream font-medium">{entry.originalTerm}</span>
        </div>
      )}
      {entry.originalTermLanguage && (
        <div className="flex items-start gap-2">
          <span className="text-xs text-gold/60 w-28 flex-shrink-0">Language</span>
          <span className="text-xs text-cream/[0.4]">{entry.originalTermLanguage}</span>
        </div>
      )}
      {entry.plainMeaning && (
        <div className="flex items-start gap-2">
          <span className="text-xs text-gold/60 w-28 flex-shrink-0">Meaning</span>
          <span className="text-xs text-cream leading-relaxed">{entry.plainMeaning}</span>
        </div>
      )}
      {entry.notes && (
        <div className="flex items-start gap-2">
          <span className="text-xs text-gold/60 w-28 flex-shrink-0">Note</span>
          <span className="text-xs text-cream/[0.28] italic leading-relaxed">{entry.notes}</span>
        </div>
      )}
    </div>
  )
}
