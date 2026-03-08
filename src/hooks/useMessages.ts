import { useState, useEffect, useCallback, useRef } from 'react'
import type { Message, MessageRole } from '../lib/types'
import { getMessages, addMessage, getMaxSequenceIndex } from '../services/messages'
import { useAuth } from './useAuth'

export function useMessages(sessionId: string | undefined) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const seenIds = useRef(new Set<string>())

  const fetchMessages = useCallback(async () => {
    if (!sessionId || !user) return
    try {
      setLoading(true)
      setError(null)
      const data = await getMessages(sessionId)
      seenIds.current = new Set(data.map(m => m.id))
      setMessages(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load messages')
    } finally {
      setLoading(false)
    }
  }, [sessionId, user])

  useEffect(() => {
    fetchMessages()
  }, [fetchMessages])

  const sendMessage = useCallback(async (content: string, role: MessageRole = 'user'): Promise<Message> => {
    if (!sessionId || !user) throw new Error('No active session')
    const nextIndex = await getMaxSequenceIndex(sessionId) + 1
    const message = await addMessage({
      session_id: sessionId,
      user_id: user.id,
      role,
      content,
      sequence_index: nextIndex,
    })
    seenIds.current.add(message.id)
    setMessages(prev => [...prev, message])
    return message
  }, [sessionId, user])

  const appendMessage = useCallback((message: Message) => {
    if (seenIds.current.has(message.id)) return
    seenIds.current.add(message.id)
    setMessages(prev => [...prev, message])
  }, [])

  return { messages, loading, error, sendMessage, appendMessage, refetch: fetchMessages }
}
