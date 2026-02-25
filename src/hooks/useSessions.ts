import { useState, useEffect, useCallback } from 'react'
import type { Session, SessionMode } from '../lib/types'
import { listSessions, createSession, updateSession as updateSessionService } from '../services/sessions'
import { useAuth } from './useAuth'

export function useSessions() {
  const { user } = useAuth()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSessions = useCallback(async () => {
    if (!user) return
    try {
      setLoading(true)
      setError(null)
      const data = await listSessions(user.id)
      setSessions(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  const startSession = useCallback(async (mode: SessionMode = 'companion'): Promise<Session> => {
    if (!user) throw new Error('Not authenticated')
    const session = await createSession(user.id, mode)
    setSessions(prev => [session, ...prev])
    return session
  }, [user])

  const endSession = useCallback(async (sessionId: string) => {
    await updateSessionService(sessionId, {
      status: 'completed',
      ended_at: new Date().toISOString(),
    })
    setSessions(prev =>
      prev.map(s => s.id === sessionId ? { ...s, status: 'completed', ended_at: new Date().toISOString() } : s)
    )
  }, [])

  return { sessions, loading, error, startSession, endSession, refetch: fetchSessions }
}
