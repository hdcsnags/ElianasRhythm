import { useState, useEffect, useCallback } from 'react'
import type { ExplainabilityEntry } from '../lib/types'
import { getSessionExplainability } from '../services/scripture'

export function useExplainability(sessionId?: string) {
  const [entries, setEntries] = useState<ExplainabilityEntry[]>([])
  const [loading, setLoading] = useState(false)

  const fetchEntries = useCallback(async () => {
    if (!sessionId) {
      setEntries([])
      return
    }
    setLoading(true)
    try {
      const data = await getSessionExplainability(sessionId)
      setEntries(data.map(d => ({
        verseReference: d.verse_reference ?? undefined,
        sourceLabel: d.source_label ?? undefined,
        originalTerm: d.original_term ?? undefined,
        originalTermLanguage: d.original_term_language ?? undefined,
        plainMeaning: d.plain_meaning ?? undefined,
        notes: d.notes ?? undefined,
      })))
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries])

  return { entries, loading, refetch: fetchEntries }
}
