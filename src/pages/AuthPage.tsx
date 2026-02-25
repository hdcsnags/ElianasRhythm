import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Leaf, Send, CheckCircle } from 'lucide-react'
import { supabase } from '../lib/supabase/client'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'

type AuthStep = 'email' | 'verify' | 'sent'

export default function AuthPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState<AuthStep>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin,
        },
      })
      if (error) throw error
      setStep('sent')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otp.trim(),
        type: 'email',
      })
      if (error) throw error
      navigate('/', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid or expired code. Please try again.')
    } finally {
      setSubmitting(false)
    }
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
          {step === 'email' && (
            <>
              <h2 className="text-base font-semibold text-stone-800 mb-1">Sign in</h2>
              <p className="text-sm text-stone-500 mb-5">
                Enter your email. We'll send a magic link or code to sign you in.
              </p>
              <form onSubmit={handleSendLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none transition-colors"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" variant="primary" loading={submitting} className="w-full">
                  <Send className="w-4 h-4" />
                  Continue with Email
                </Button>
              </form>
              <button
                onClick={() => { setStep('verify'); setError(null) }}
                className="mt-3 w-full text-center text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                Already have a code? Enter it here
              </button>
            </>
          )}

          {step === 'sent' && (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-stone-800 mb-1">Check your email</h2>
                <p className="text-sm text-stone-500 leading-relaxed">
                  We sent a link and a 6-digit code to{' '}
                  <span className="font-medium text-stone-700">{email}</span>.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setStep('verify')}
                className="w-full"
              >
                Enter code instead
              </Button>
              <button
                onClick={() => { setStep('email'); setError(null) }}
                className="text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}

          {step === 'verify' && (
            <>
              <h2 className="text-base font-semibold text-stone-800 mb-1">Enter your code</h2>
              <p className="text-sm text-stone-500 mb-5">
                Enter the 6-digit code from the email sent to{' '}
                <span className="font-medium text-stone-700">{email || 'your email'}</span>.
              </p>
              {!email && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none"
                  />
                </div>
              )}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1.5">
                    Verification code
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                    placeholder="000000"
                    required
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm outline-none font-mono text-center tracking-widest"
                  />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <Button type="submit" variant="primary" loading={submitting} className="w-full">
                  Sign in
                </Button>
              </form>
              <button
                onClick={() => { setStep('email'); setError(null) }}
                className="mt-3 w-full text-center text-xs text-stone-400 hover:text-stone-600 transition-colors"
              >
                Back
              </button>
            </>
          )}
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
