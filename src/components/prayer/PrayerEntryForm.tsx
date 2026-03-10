import { useState } from 'react'
import { Send, X } from 'lucide-react'

const PRAYER_TAGS = ['gratitude', 'intercession', 'confession', 'praise', 'petition', 'reflection'] as const

interface PrayerEntryFormProps {
  onSubmit: (content: string, title?: string, tags?: string[]) => Promise<void>
  onCancel?: () => void
  compact?: boolean
}

export function PrayerEntryForm({ onSubmit, onCancel, compact = false }: PrayerEntryFormProps) {
  const [content, setContent] = useState('')
  const [title, setTitle] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!content.trim()) return
    setSubmitting(true)
    try {
      await onSubmit(content.trim(), title.trim() || undefined, selectedTags.length ? selectedTags : undefined)
      setContent('')
      setTitle('')
      setSelectedTags([])
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {!compact && (
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="w-full px-3 py-2 bg-transparent border border-gold/[0.12] text-cream text-sm outline-none transition-colors focus:border-gold/30"
        />
      )}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={compact ? 'Write a prayer or reflection...' : 'Pour out your heart...'}
        rows={compact ? 3 : 5}
        className="w-full px-3 py-2.5 bg-transparent border border-gold/[0.12] text-cream text-sm outline-none transition-colors focus:border-gold/30 resize-none leading-relaxed"
      />
      {!compact && (
        <div className="flex flex-wrap gap-1.5">
          {PRAYER_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 text-[0.55rem] font-display tracking-[0.15em] uppercase border transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-gold/[0.12] border-gold/40 text-gold'
                  : 'border-cream/10 text-cream/[0.28] hover:border-gold/20'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-gold to-[#A07830] text-night text-xs font-medium tracking-[0.1em] uppercase transition-all hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send className="w-3.5 h-3.5" />
          {compact ? 'Save' : 'Save Prayer'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2 text-cream/[0.28] text-xs tracking-[0.1em] uppercase hover:text-cream transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
