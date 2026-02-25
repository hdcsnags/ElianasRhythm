import { useState } from 'react'
import { Settings, User, Heart, Shield } from 'lucide-react'
import { ProfileSettings } from '../components/settings/ProfileSettings'
import { CompanionSettings } from '../components/settings/CompanionSettings'
import { useProfile } from '../hooks/useProfile'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { cn } from '../lib/utils'

type Tab = 'profile' | 'companion' | 'privacy'

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'companion', label: 'Companion', icon: Heart },
  { id: 'privacy', label: 'Privacy', icon: Shield },
]

export default function SettingsPage() {
  const { profile, loading, update } = useProfile()
  const [activeTab, setActiveTab] = useState<Tab>('profile')

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner label="Loading settings…" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Settings className="w-5 h-5 text-amber-600" />
        <h1 className="text-xl font-semibold text-stone-900">Settings</h1>
      </div>

      <div className="flex gap-1 border-b border-stone-200 mb-8">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              activeTab === id
                ? 'text-amber-700 border-amber-700'
                : 'text-stone-500 border-transparent hover:text-stone-700'
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <ProfileSettings profile={profile} onSave={update} />
      )}

      {activeTab === 'companion' && (
        <CompanionSettings profile={profile} onSave={update} />
      )}

      {activeTab === 'privacy' && (
        <PrivacyTab />
      )}
    </div>
  )
}

function PrivacyTab() {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200 bg-stone-50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-stone-800">Data & Privacy</h3>
        <div className="space-y-2 text-sm text-stone-600">
          <p>Your session transcripts are stored securely and are only accessible to you.</p>
          <p>Eliana does not share your conversations with third parties.</p>
          <p>You may delete your sessions at any time from Session History.</p>
        </div>
      </div>

      <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-amber-900">Scripture Display</h3>
        <p className="text-xs text-amber-700">
          Preferences for how scripture references and original language terms are displayed.
        </p>
        <p className="text-xs text-stone-500 italic">Coming in Phase 2 — scripture display preferences</p>
      </div>

      <div className="rounded-xl border border-stone-200 p-5 space-y-3">
        <h3 className="text-sm font-semibold text-stone-700">Session Recordings</h3>
        <p className="text-xs text-stone-500">
          Live voice sessions are not recorded as audio. Only the text transcript is saved.
        </p>
        {/* TODO [Phase 2]: Granular data retention preferences */}
      </div>
    </div>
  )
}
