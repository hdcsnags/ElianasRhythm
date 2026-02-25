import { supabase } from '../../lib/supabase/client'
import type { Message, MessageInsert, MessageExplainability, MessageExplainabilityInsert } from '../../lib/types'

export async function getMessages(sessionId: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('sequence_index', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function addMessage(insert: MessageInsert): Promise<Message> {
  const { data, error } = await supabase
    .from('messages')
    .insert(insert)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function getExplainabilityForSession(sessionId: string): Promise<MessageExplainability[]> {
  const { data, error } = await supabase
    .from('message_explainability')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function addExplainability(insert: MessageExplainabilityInsert): Promise<MessageExplainability> {
  const { data, error } = await supabase
    .from('message_explainability')
    .insert(insert)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
