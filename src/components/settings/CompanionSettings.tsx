import { useState } from 'react'
import type { Profile, ProfileUpdate, ResponseStyle } from '../../lib/types'

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
        <h3 className="text-sm font-medium text-cream mb-1">Response Style</h3>
        <p className="text-xs text-cream/[0.28] mb-3">How Eliana shapes her responses to you.</p>
        <div className="space-y-2">
          {responseStyles.map(({ value, label, description }) => (
            <label
              key={value}
              className="flex items-start gap-3 p-3 border cursor-pointer transition-colors hover:bg-gold/[0.03]"
              style={{ borderColor: style === value ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.08)' }}
            >
              <input
                type="radio"
                name="responseStyle"
                value={value}
                checked={style === value}
                onChange={() => setStyle(value)}
                className="mt-0.5 accent-gold"
              />
              <div>
                <p className="text-sm text-cream">{label}</p>
                <p className="text-xs text-cream/[0.28]">{description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-gold/[0.08] pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium text-cream">Holy Pause</h3>
            <p className="text-xs text-cream/[0.28] mt-0.5 max-w-sm">
              Allows a moment of intentional silence before Eliana responds.
            </p>
            <p className="text-xs text-gold/50 mt-1">Behavior tuning coming in Phase 2</p>
          </div>
          <button
            role="switch"
            aria-checked={holyPause}
            onClick={() => setHolyPause(prev => !prev)}
            className="relative flex-shrink-0 w-11 h-6 rounded-full transition-colors focus:outline-none"
            style={{ backgroundColor: holyPause ? '#C9A84C' : 'rgba(245,239,224,0.1)' }}
          >
            <span
              className="block w-5 h-5 rounded-full bg-night shadow transition-transform"
              style={{ transform: holyPause ? 'translateX(22px)' : 'translateX(2px)', marginTop: '2px' }}
            />
          </button>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="px-6 py-2.5 bg-gradient-to-br from-gold to-[#A07830] text-night text-sm font-medium tracking-[0.1em] uppercase transition-all hover:brightness-110 disabled:opacity-50"
      >
        {saving ? 'Saving...' : saved ? 'Saved' : 'Save Preferences'}
      </button>
    </div>
  )
}
