import type { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Session = Database['public']['Tables']['sessions']['Row']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']

export type MessageExplainability = Database['public']['Tables']['message_explainability']['Row']
export type MessageExplainabilityInsert = Database['public']['Tables']['message_explainability']['Insert']

export type ScriptureVaultEntry = Database['public']['Tables']['scripture_vault']['Row']

export type PrayerLog = Database['public']['Tables']['prayer_logs']['Row']

export type SessionMode = 'companion' | 'bridge' | 'tutor'
export type SessionStatus = 'active' | 'completed' | 'archived'
export type MessageRole = 'user' | 'assistant' | 'system'
export type ResponseStyle = 'gentle' | 'concise' | 'reflective'

export type SessionTag = 'prayer' | 'reflection' | 'family' | 'study'

export interface ExplainabilityEntry {
  verseReference?: string
  sourceLabel?: string
  originalTerm?: string
  originalTermLanguage?: string
  plainMeaning?: string
  notes?: string
}
