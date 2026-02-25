import { useState } from 'react'
import type { Profile, ProfileUpdate } from '../../lib/types'
import { Button } from '../ui/Button'
import { useAuth } from '../../hooks/useAuth'

interface ProfileSettingsProps {
  profile: Profile | null
  onSave: (updates: ProfileUpdate) => Promise<void>
}

export function ProfileSettings({ profile, onSave }: ProfileSettingsProps) {
  const { user } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [primaryLang, setPrimaryLang] = useState(profile?.preferred_language_primary ?? 'en')
  const [secondaryLang, setSecondaryLang] = useState(profile?.preferred_language_secondary ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        display_name: displayName || null,
        preferred_language_primary: primaryLang,
        preferred_language_secondary: secondaryLang || null,
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
        <input
          type="email"
          value={user?.email ?? ''}
          disabled
          className="w-full px-3 py-2 rounded-lg border border-stone-200 bg-stone-50 text-stone-500 text-sm"
        />
        <p className="text-xs text-stone-400 mt-1">Email cannot be changed here.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1.5">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Your name"
          className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">Primary Language</label>
          <select
            value={primaryLang}
            onChange={e => setPrimaryLang(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none bg-white"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="pt">Portuguese</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ar">Arabic</option>
            <option value="sw">Swahili</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Secondary Language
            <span className="text-stone-400 font-normal ml-1">(optional)</span>
          </label>
          <select
            value={secondaryLang}
            onChange={e => setSecondaryLang(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none bg-white"
          >
            <option value="">None</option>
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="pt">Portuguese</option>
            <option value="de">German</option>
            <option value="zh">Chinese</option>
            <option value="ar">Arabic</option>
            <option value="sw">Swahili</option>
          </select>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={handleSave}
        loading={saving}
        className="w-full sm:w-auto"
      >
        {saved ? 'Saved' : 'Save Profile'}
      </Button>
    </div>
  )
}
