import { useState } from 'react'
import { Send, X } from 'lucide-react'
import { Button } from '../ui/Button'

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
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none transition-colors"
        />
      )}
      <textarea
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder={compact ? 'Write a prayer or reflection...' : 'Pour out your heart...'}
        rows={compact ? 3 : 5}
        className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none transition-colors resize-none leading-relaxed"
      />
      {!compact && (
        <div className="flex flex-wrap gap-1.5">
          {PRAYER_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedTags.includes(tag)
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-stone-100 text-stone-500 border border-stone-200 hover:bg-stone-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2">
        <Button type="submit" variant="primary" size="sm" loading={submitting} disabled={!content.trim()}>
          <Send className="w-3.5 h-3.5" />
          {compact ? 'Save' : 'Save Prayer'}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="w-3.5 h-3.5" />
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
