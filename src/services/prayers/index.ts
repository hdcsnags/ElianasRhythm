import { supabase } from '../../lib/supabase/client'
import type { PrayerLog } from '../../lib/types'

export async function listPrayerLogs(userId: string): Promise<PrayerLog[]> {
  const { data, error } = await supabase
    .from('prayer_logs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function createPrayerLog(
  userId: string,
  content: string,
  title?: string,
  tags?: string[],
  sessionId?: string
): Promise<PrayerLog> {
  const { data, error } = await supabase
    .from('prayer_logs')
    .insert({
      user_id: userId,
      content,
      title: title ?? null,
      tags: tags ?? [],
      session_id: sessionId ?? null,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function deletePrayerLog(prayerLogId: string): Promise<void> {
  const { error } = await supabase
    .from('prayer_logs')
    .delete()
    .eq('id', prayerLogId)

  if (error) throw new Error(error.message)
}
