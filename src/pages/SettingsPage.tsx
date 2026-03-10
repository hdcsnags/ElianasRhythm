import { useState } from 'react'
import { User, Heart, Shield } from 'lucide-react'
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
      <div className="h-full flex items-center justify-center">
        <LoadingSpinner label="Loading settings..." />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-2 flex items-center gap-3">
          Settings
          <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
        </div>
        <h1 className="font-serif text-3xl text-cream font-light mb-8">Preferences</h1>

        <div className="flex gap-1 border-b border-gold/[0.08] mb-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px',
                activeTab === id
                  ? 'text-gold border-gold'
                  : 'text-cream/[0.28] border-transparent hover:text-cream/50'
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
    </div>
  )
}

function PrivacyTab() {
  return (
    <div className="space-y-6">
      <div className="border border-gold/[0.08] bg-surface p-6 space-y-3">
        <h3 className="text-sm font-medium text-cream">Data & Privacy</h3>
        <div className="space-y-2 text-sm text-cream/[0.4]">
          <p>Your session transcripts are stored securely and are only accessible to you.</p>
          <p>Eliana does not share your conversations with third parties.</p>
          <p>You may delete your sessions at any time from Session History.</p>
        </div>
      </div>

      <div className="border border-gold/[0.12] bg-gold/[0.03] p-6 space-y-3">
        <h3 className="text-sm font-medium text-gold">Scripture Display</h3>
        <p className="text-xs text-cream/[0.28]">
          Preferences for how scripture references and original language terms are displayed.
        </p>
        <p className="text-xs text-cream/[0.15] italic">Coming in Phase 2</p>
      </div>

      <div className="border border-gold/[0.08] bg-surface p-6 space-y-3">
        <h3 className="text-sm font-medium text-cream/[0.6]">Session Recordings</h3>
        <p className="text-xs text-cream/[0.28]">
          Live voice sessions are not recorded as audio. Only the text transcript is saved.
        </p>
      </div>
    </div>
  )
}
