import { supabase } from '../../lib/supabase/client'
import type { ScriptureVaultEntry, MessageExplainability } from '../../lib/types'

export async function listScriptureVault(): Promise<ScriptureVaultEntry[]> {
  const { data, error } = await supabase
    .from('scripture_vault')
    .select('*')
    .order('term')

  if (error) throw new Error(error.message)
  return data
}

export async function getSessionExplainability(sessionId: string): Promise<MessageExplainability[]> {
  const { data, error } = await supabase
    .from('message_explainability')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })

  if (error) throw new Error(error.message)
  return data
}

export async function getRandomScriptureEntry(): Promise<ScriptureVaultEntry | null> {
  const { data, error } = await supabase
    .from('scripture_vault')
    .select('*')

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) return null
  return data[Math.floor(Math.random() * data.length)]
}
