import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../hooks/useAuth'
import { StarField } from '../components/companion/StarField'

type AuthMode = 'signin' | 'signup'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<AuthMode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    if (!loading && user) {
      navigate('/companion', { replace: true })
    }
  }, [user, loading, navigate])

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password: password.trim(),
          options: {
            data: {
              display_name: displayName.trim() || undefined,
            },
          },
        })
        if (error) throw error
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password.trim(),
        })
        if (error) throw error
      }
      navigate('/companion', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      })
      if (error) throw error
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  const switchMode = () => {
    setMode(prev => prev === 'signin' ? 'signup' : 'signin')
    setError(null)
    setPassword('')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-night flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-gold/30 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-night flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(201,168,76,0.05) 0%, transparent 70%)'
      }} />
      <StarField count={50} />

      <div className="w-full max-w-sm relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="relative mb-6">
            <div className="absolute w-[100px] h-[100px] rounded-full border border-gold/[0.15] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ring-pulse" />
            <div className="absolute w-[130px] h-[130px] rounded-full border border-gold/[0.08] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-ring-pulse" style={{ animationDelay: '0.8s' }} />
            <div
              className="w-16 h-16 rounded-full animate-orb-breathe relative z-10"
              style={{
                background: 'radial-gradient(circle at 35% 35%, #E8C96A, #C9A84C 40%, #8B6520)',
                boxShadow: '0 0 40px rgba(201,168,76,0.35), 0 0 80px rgba(201,168,76,0.1)',
              }}
            />
          </div>
          <h1 className="font-serif text-4xl text-cream font-light tracking-wide">Eliana</h1>
          <p className="font-display text-[0.6rem] tracking-[0.3em] text-gold uppercase mt-1">
            God Has Answered
          </p>
        </div>

        <div className="border border-gold/[0.12] bg-deep p-6">
          <h2 className="font-serif text-lg text-cream mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-cream/[0.28] mb-5">
            {mode === 'signin'
              ? 'Sign in to continue your journey.'
              : 'Begin your journey with Eliana.'}
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gold/[0.15] hover:border-gold/30 text-sm text-cream transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin h-4 w-4 text-gold" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
              </svg>
            )}
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gold/[0.08]" />
            <span className="text-xs text-cream/[0.2] font-display tracking-wider uppercase">or</span>
            <div className="flex-1 h-px bg-gold/[0.08]" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm text-cream/[0.4] mb-1.5">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="How should Eliana address you?"
                  className="w-full px-3 py-2.5 bg-transparent border border-gold/[0.12] text-cream text-sm outline-none transition-colors focus:border-gold/30"
                />
              </div>
            )}
            <div>
              <label className="block text-sm text-cream/[0.4] mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cream/[0.2]" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 bg-transparent border border-gold/[0.12] text-cream text-sm outline-none transition-colors focus:border-gold/30"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-cream/[0.4] mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  required
                  minLength={6}
                  className="w-full px-3 py-2.5 pr-10 bg-transparent border border-gold/[0.12] text-cream text-sm outline-none transition-colors focus:border-gold/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/[0.2] hover:text-cream/[0.4] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-gradient-to-br from-gold to-[#A07830] text-night text-sm font-medium tracking-[0.1em] uppercase transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <svg className="animate-spin h-4 w-4 mx-auto" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-center text-sm text-cream/[0.28]">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={switchMode}
              className="text-gold hover:text-gold-soft transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-[0.7rem] text-center text-cream/[0.15] mt-6 leading-relaxed">
          Eliana is a companion, not a therapist or crisis service.
          <br />
          Please seek professional care when needed.
        </p>
      </div>
    </div>
  )
}
