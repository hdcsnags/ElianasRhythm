import { Trash2 } from 'lucide-react'
import type { PrayerLog } from '../../lib/types'
import { formatDate, formatTime } from '../../lib/utils'

interface PrayerCardProps {
  log: PrayerLog
  onDelete?: (id: string) => void
}

export function PrayerCard({ log, onDelete }: PrayerCardProps) {
  const tags = Array.isArray(log.tags) ? log.tags as string[] : []

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-4 hover:border-amber-200 transition-colors group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {log.title && (
            <h3 className="text-sm font-semibold text-stone-800 mb-1">{log.title}</h3>
          )}
          <p className="text-sm text-stone-600 leading-relaxed whitespace-pre-wrap">{log.content}</p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(log.id)}
            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex items-center gap-2 mt-3 flex-wrap">
        {tags.map(tag => (
          <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-amber-50 text-amber-700 border border-amber-100">
            {tag}
          </span>
        ))}
        <span className="text-xs text-stone-400 ml-auto">
          {formatDate(log.created_at)} at {formatTime(log.created_at)}
        </span>
      </div>
    </div>
  )
}
