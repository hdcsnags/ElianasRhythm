import { useState, useEffect, useCallback } from 'react'
import type { PrayerLog } from '../lib/types'
import { listPrayerLogs, createPrayerLog, deletePrayerLog } from '../services/prayers'
import { useAuth } from './useAuth'

export function usePrayerLogs() {
  const { user } = useAuth()
  const [logs, setLogs] = useState<PrayerLog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLogs = useCallback(async () => {
    if (!user) {
      setLogs([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const data = await listPrayerLogs(user.id)
      setLogs(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prayer logs')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const create = useCallback(async (
    content: string,
    title?: string,
    tags?: string[],
    sessionId?: string
  ) => {
    if (!user) return
    const log = await createPrayerLog(user.id, content, title, tags, sessionId)
    setLogs(prev => [log, ...prev])
    return log
  }, [user])

  const remove = useCallback(async (id: string) => {
    await deletePrayerLog(id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }, [])

  return { logs, loading, error, create, remove, refetch: fetchLogs }
}
