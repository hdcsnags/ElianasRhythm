import { useState, useEffect, useCallback } from 'react'
import type { Message, MessageRole } from '../lib/types'
import { getMessages, addMessage } from '../services/messages'
import { useAuth } from './useAuth'

export function useMessages(sessionId: string | undefined) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMessages = useCallback(async () => {
    if (!sessionId || !user) return
    try {
      setLoading(true)
      setError(null)
      const data = await getMessages(sessionId)
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
    const nextIndex = messages.length
    const message = await addMessage({
      session_id: sessionId,
      user_id: user.id,
      role,
      content,
      sequence_index: nextIndex,
    })
    setMessages(prev => [...prev, message])
    return message
  }, [sessionId, user, messages.length])

  const appendMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message])
  }, [])

  return { messages, loading, error, sendMessage, appendMessage, refetch: fetchMessages }
}
