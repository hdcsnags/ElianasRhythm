import { useNavigate } from 'react-router-dom'
import { MessageCircle, Globe, GraduationCap } from 'lucide-react'
import { useSessions } from '../hooks/useSessions'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../hooks/useAuth'
import { StarField } from '../components/companion/StarField'
import { formatDate, formatDuration } from '../lib/utils'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { profile } = useProfile()
  const { sessions, startSession } = useSessions()

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
    <div className="h-full overflow-y-auto">
      <div className="relative min-h-[60vh] flex flex-col items-center justify-center px-6 py-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,168,76,0.06) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 20% 80%, rgba(139,90,43,0.08) 0%, transparent 60%)'
        }} />
        <StarField count={60} />

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="font-display text-[0.65rem] tracking-[0.35em] text-gold uppercase mb-8">
            Welcome back, {displayName}
          </div>

          <div className="relative mb-8">
            <div className="absolute w-[200px] h-[200px] rounded-full border border-gold/[0.15] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ring-pulse" />
            <div className="absolute w-[260px] h-[260px] rounded-full border border-gold/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ring-pulse" style={{ animationDelay: '0.8s' }} />
            <div
              className="w-[140px] h-[140px] rounded-full animate-orb-breathe cursor-pointer relative z-10"
              onClick={handleStartCompanion}
              style={{
                background: 'radial-gradient(circle at 35% 35%, #E8C96A 0%, #C9A84C 30%, #A07830 60%, #6B4E20 100%)',
                boxShadow: '0 0 60px rgba(201,168,76,0.4), 0 0 120px rgba(201,168,76,0.15), inset 0 0 30px rgba(255,255,255,0.1)',
              }}
            />
          </div>

          <h1 className="font-serif text-[clamp(3rem,8vw,5rem)] font-light tracking-wide leading-none mb-2" style={{
            background: 'linear-gradient(180deg, #F5EFE0 0%, rgba(245,239,224,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Eliana
          </h1>
          <div className="font-display text-[0.7rem] tracking-[0.3em] text-gold uppercase mb-8">
            God Has Answered
          </div>

          <p className="font-serif italic text-cream/[0.6] text-[clamp(1rem,2vw,1.3rem)] max-w-md leading-relaxed mb-10">
            A live voice companion that listens, prays, and bridges the silence between the people we love.
          </p>

          <div className="flex gap-3 flex-wrap justify-center">
            <button
              onClick={handleStartCompanion}
              className="px-8 py-3 bg-gradient-to-br from-gold to-[#A07830] text-night text-sm font-medium tracking-[0.1em] uppercase transition-all hover:brightness-110 relative overflow-hidden"
            >
              Begin Session
            </button>
            <button
              onClick={() => navigate('/history')}
              className="px-8 py-3 border border-cream/20 text-cream text-sm tracking-[0.1em] uppercase transition-all hover:border-gold hover:text-gold"
            >
              Past Sessions
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 max-w-4xl mx-auto px-6">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
        <div className="font-display text-[0.6rem] tracking-[0.3em] text-gold uppercase whitespace-nowrap">
          Three Modes
        </div>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }} />
      </div>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={handleStartCompanion}
            className="p-8 border border-gold/25 bg-gradient-to-br from-gold/[0.08] to-surface cursor-pointer transition-all duration-300 hover:border-gold/40 hover:-translate-y-1 relative overflow-hidden group"
          >
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent" />
            <div className="font-display text-[0.55rem] tracking-[0.3em] text-gold uppercase border border-gold px-2 py-0.5 inline-block mb-4">Live</div>
            <MessageCircle className="w-7 h-7 text-gold/60 mb-3" />
            <div className="font-serif text-[1.8rem] text-cream mb-2">Companion</div>
            <p className="text-sm text-cream/[0.28] leading-relaxed">Real-time voice conversation grounded in scripture. For the 2am moments when no one else is there.</p>
          </div>

          <div className="p-8 border border-gold/10 bg-surface transition-all duration-300 hover:border-gold/30 hover:-translate-y-1 relative overflow-hidden group cursor-pointer" onClick={handleStartCompanion}>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="font-display text-[0.55rem] tracking-[0.3em] text-cream/[0.28] uppercase border border-cream/[0.28] px-2 py-0.5 inline-block mb-4">Prototype</div>
            <Globe className="w-7 h-7 text-cream/20 mb-3" />
            <div className="font-serif text-[1.8rem] text-cream mb-2">Bridge</div>
            <p className="text-sm text-cream/[0.28] leading-relaxed">Live bilingual conversation. For families separated by language, not by love.</p>
          </div>

          <div className="p-8 border border-gold/[0.05] bg-surface transition-all duration-300 hover:border-gold/20 hover:-translate-y-1 relative overflow-hidden group opacity-60">
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="font-display text-[0.55rem] tracking-[0.3em] text-cream/[0.15] uppercase border border-cream/[0.15] px-2 py-0.5 inline-block mb-4">Soon</div>
            <GraduationCap className="w-7 h-7 text-cream/10 mb-3" />
            <div className="font-serif text-[1.8rem] text-cream mb-2">Tutor</div>
            <p className="text-sm text-cream/[0.28] leading-relaxed">Original language scripture study. Learn hesed, tikvah, agape as living words.</p>
          </div>
        </div>
      </section>

      {recentSessions.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-16">
          <div className="font-display text-[0.6rem] tracking-[0.4em] text-gold uppercase mb-6 flex items-center gap-3">
            Recent Sessions
            <span className="flex-1 max-w-[60px] h-px bg-gold/40" />
          </div>
          <div className="space-y-2">
            {recentSessions.map(s => (
              <button
                key={s.id}
                onClick={() => navigate(`/companion/${s.id}`)}
                className="w-full text-left px-5 py-4 bg-surface border border-gold/[0.08] hover:border-gold/20 transition-all flex items-center justify-between group"
              >
                <div>
                  <div className="font-serif text-cream text-sm">{s.title || `${s.mode.charAt(0).toUpperCase() + s.mode.slice(1)} Session`}</div>
                  <div className="text-[0.7rem] text-cream/[0.28] mt-0.5">{formatDate(s.started_at)}</div>
                </div>
                <div className="text-[0.65rem] text-gold/50 font-display tracking-wider uppercase group-hover:text-gold transition-colors">
                  {formatDuration(s.started_at, s.ended_at)}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
