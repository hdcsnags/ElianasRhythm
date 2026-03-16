import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase/client'

export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.history.replaceState(null, '', window.location.pathname)
        navigate('/companion', { replace: true })
      }
    })

    // If the session is already established (e.g. page refresh), handle it immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.history.replaceState(null, '', window.location.pathname)
        navigate('/companion', { replace: true })
      }
    })

    // Fallback: if nothing fires within 10s, send back to auth
    const timeout = setTimeout(() => {
      navigate('/auth', { replace: true })
    }, 10000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
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
