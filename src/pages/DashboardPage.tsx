import { useNavigate } from 'react-router-dom'
import { MessageCircle, Globe2, GraduationCap, Plus, Sparkles } from 'lucide-react'
import { ModeCard } from '../components/modes/ModeCard'
import { SessionList } from '../components/history/SessionList'
import { Button } from '../components/ui/Button'
import { useSessions } from '../hooks/useSessions'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile()
  const { sessions, loading, error, startSession, refetch } = useSessions()

  const displayName = profile?.display_name ?? user?.email?.split('@')[0] ?? 'Friend'
  const recentSessions = sessions.slice(0, 3)

  const handleStartCompanion = async () => {
    try {
      const session = await startSession('companion')
      navigate(`/companion/${session.id}`)
    } catch {
      // error handled in hook
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-stone-900">
            Welcome, {displayName}
          </h1>
          <p className="text-stone-500 mt-1 text-sm">
            Eliana is here whenever you are ready.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleStartCompanion}>
          <Plus className="w-4 h-4" />
          New Session
        </Button>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-wider">Modes</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <ModeCard
            title="Companion"
            description="A presence-forward conversation with Eliana — calm, warm, and scripture-grounded."
            icon={<MessageCircle className="w-5 h-5" />}
            isPrimary
            onClick={handleStartCompanion}
          />
          <ModeCard
            title="Bridge"
            description="Live bilingual conversation aid for families across language distances."
            icon={<Globe2 className="w-5 h-5" />}
            badge={{ label: 'Prototype', variant: 'prototype' }}
            onClick={() => navigate('/companion')}
          />
          <ModeCard
            title="Tutor"
            description="Explore original scripture language with guided study and context."
            icon={<GraduationCap className="w-5 h-5" />}
            badge={{ label: 'Coming Soon', variant: 'soon' }}
            disabled
          />
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-stone-600 uppercase tracking-wider">Recent Sessions</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-amber-700 hover:text-amber-800 font-medium transition-colors"
          >
            View all
          </button>
        </div>
        <SessionList
          sessions={recentSessions}
          loading={loading}
          error={error}
          onSelect={(s) => navigate(`/companion/${s.id}`)}
          onRetry={refetch}
        />
      </section>

      {/* Phase 2 TODO: Companion orb quick-start on homepage */}
      {/* Phase 2 TODO: Prayer log quick-entry widget */}
      {/* Phase 2 TODO: Inspirational verse/reflection for the day */}
    </div>
  )
}
