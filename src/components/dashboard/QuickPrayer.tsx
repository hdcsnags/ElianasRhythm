import { useState } from 'react'
import { Heart, ChevronDown, ChevronUp } from 'lucide-react'
import { PrayerEntryForm } from '../prayer/PrayerEntryForm'
import { usePrayerLogs } from '../../hooks/usePrayerLogs'

export function QuickPrayer() {
  const [isOpen, setIsOpen] = useState(false)
  const { create } = usePrayerLogs()
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (content: string, title?: string, tags?: string[]) => {
    await create(content, title, tags)
    setSaved(true)
    setTimeout(() => {
      setSaved(false)
      setIsOpen(false)
    }, 1500)
  }

  return (
    <div className="border border-gold/[0.08] bg-surface overflow-hidden">
      <button
        onClick={() => { setIsOpen(prev => !prev); setSaved(false) }}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gold/[0.03] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Heart className="w-4 h-4 text-gold/50" />
          <span className="text-sm text-cream">Quick Prayer</span>
        </div>
        {isOpen
          ? <ChevronUp className="w-4 h-4 text-cream/[0.28]" />
          : <ChevronDown className="w-4 h-4 text-cream/[0.28]" />
        }
      </button>
      {isOpen && (
        <div className="px-5 pb-4 border-t border-gold/[0.08]">
          {saved ? (
            <div className="py-4 text-center">
              <p className="text-sm text-gold">Prayer saved</p>
            </div>
          ) : (
            <div className="pt-3">
              <PrayerEntryForm onSubmit={handleSubmit} compact />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
