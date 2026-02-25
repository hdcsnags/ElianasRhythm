import { supabase } from '../../lib/supabase/client'
import type { Session, SessionInsert, SessionUpdate, Profile, ProfileUpdate, SessionMode } from '../../lib/types'

export async function listSessions(userId: string): Promise<Session[]> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function getSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function createSession(userId: string, mode: SessionMode = 'companion', title?: string): Promise<Session> {
  const insert: SessionInsert = {
    user_id: userId,
    mode,
    status: 'active',
    started_at: new Date().toISOString(),
    title: title ?? null,
  }

  const { data, error } = await supabase
    .from('sessions')
    .insert(insert)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function updateSession(sessionId: string, updates: SessionUpdate): Promise<Session> {
  const { data, error } = await supabase
    .from('sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deleteSession(sessionId: string): Promise<void> {
  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data
}

export async function updateProfile(userId: string, updates: ProfileUpdate): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}
