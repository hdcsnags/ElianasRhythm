import { useState } from 'react'
import type { Profile, ProfileUpdate, ResponseStyle } from '../../lib/types'
import { Button } from '../ui/Button'

interface CompanionSettingsProps {
  profile: Profile | null
  onSave: (updates: ProfileUpdate) => Promise<void>
}

const responseStyles: { value: ResponseStyle; label: string; description: string }[] = [
  { value: 'gentle', label: 'Gentle', description: 'Warm and tender, with unhurried pacing' },
  { value: 'concise', label: 'Concise', description: 'Clear and direct, without excess words' },
  { value: 'reflective', label: 'Reflective', description: 'Thoughtful and depth-oriented (default)' },
]

export function CompanionSettings({ profile, onSave }: CompanionSettingsProps) {
  const [style, setStyle] = useState<ResponseStyle>(
    (profile?.preferred_response_style as ResponseStyle) ?? 'reflective'
  )
  const [holyPause, setHolyPause] = useState(profile?.holy_pause_enabled ?? true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        preferred_response_style: style,
        holy_pause_enabled: holyPause,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-stone-800 mb-1">Response Style</h3>
        <p className="text-xs text-stone-500 mb-3">How Eliana shapes her responses to you.</p>
        <div className="space-y-2">
          {responseStyles.map(({ value, label, description }) => (
            <label
              key={value}
              className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-stone-50"
              style={{ borderColor: style === value ? '#b45309' : '#e7e5e4' }}
            >
              <input
                type="radio"
                name="responseStyle"
                value={value}
                checked={style === value}
                onChange={() => setStyle(value)}
                className="mt-0.5 accent-amber-700"
              />
              <div>
                <p className="text-sm font-medium text-stone-800">{label}</p>
                <p className="text-xs text-stone-500">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-stone-100 pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-stone-800">Holy Pause</h3>
            <p className="text-xs text-stone-500 mt-0.5 max-w-sm">
              Allows a moment of intentional silence before Eliana responds.
              {/* TODO [Phase 2]: Wire timing, silence threshold, and interruption sensitivity */}
            </p>
            <p className="text-xs text-amber-700 mt-1">Behavior tuning — Phase 2</p>
          </div>
          <button
            role="switch"
            aria-checked={holyPause}
            onClick={() => setHolyPause(prev => !prev)}
            className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-600 focus:ring-offset-2"
            style={{ backgroundColor: holyPause ? '#b45309' : '#d6d3d1' }}
          >
            <span
              className="block w-5 h-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: holyPause ? 'translateX(22px)' : 'translateX(2px)', marginTop: '2px' }}
            />
          </button>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={handleSave}
        loading={saving}
        className="w-full sm:w-auto"
      >
        {saved ? 'Saved' : 'Save Preferences'}
      </Button>
    </div>
  )
}
