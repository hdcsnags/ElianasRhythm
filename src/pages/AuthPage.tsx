import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Mail, Eye, EyeOff } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

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
      navigate('/', { replace: true })
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
      navigate('/', { replace: true })
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
      <div className="min-h-screen bg-warm-50 flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-amber-300 animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-amber-700/10 flex items-center justify-center mb-4">
            <Leaf className="w-7 h-7 text-amber-700" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-900 tracking-tight">Eliana</h1>
          <p className="text-sm text-stone-500 mt-1.5 text-center leading-relaxed">
            A calm, grounded companion for the journey.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-stone-800 mb-1">
            {mode === 'signin' ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-stone-500 mb-5">
            {mode === 'signin'
              ? 'Sign in to continue your journey.'
              : 'Begin your journey with Eliana.'}
          </p>

          <button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 text-sm font-medium text-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <svg className="animate-spin h-4 w-4 text-stone-400" viewBox="0 0 24 24" fill="none">
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
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400">or</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <form onSubmit={handleEmailAuth} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  Display name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="How should Eliana address you?"
                  className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none transition-colors"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoFocus
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1.5">
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
                  className="w-full px-3 py-2.5 pr-10 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button type="submit" variant="primary" loading={submitting} className="w-full">
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-stone-500">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={switchMode}
              className="text-amber-700 hover:text-amber-800 font-medium transition-colors"
            >
              {mode === 'signin' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>

        <p className="text-xs text-center text-stone-400 mt-6 leading-relaxed">
          Eliana is a companion, not a therapist or crisis service.
          <br />
          Please seek professional care when needed.
        </p>
      </div>
    </div>
  )
}
