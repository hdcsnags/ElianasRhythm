import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase/client'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          window.history.replaceState(null, '', window.location.pathname)
          navigate('/companion', { replace: true })
        } else {
          navigate('/auth', { replace: true })
        }
      })
    } else {
      supabase.auth.getSession().then(({ data: { session } }) => {
        navigate(session ? '/companion' : '/auth', { replace: true })
      })
    }
  }, [navigate])

  return (
    <div className="min-h-screen bg-night flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-gold/30 animate-pulse" />
        <p className="text-cream/40 text-sm font-display tracking-wider">Signing you in...</p>
      </div>
    </div>
  )
}
