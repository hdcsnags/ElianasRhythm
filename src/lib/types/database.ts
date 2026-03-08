export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string | null
          preferred_response_style: string
          holy_pause_enabled: boolean
          preferred_language_primary: string
          preferred_language_secondary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name?: string | null
          preferred_response_style?: string
          holy_pause_enabled?: boolean
          preferred_language_primary?: string
          preferred_language_secondary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string | null
          preferred_response_style?: string
          holy_pause_enabled?: boolean
          preferred_language_primary?: string
          preferred_language_secondary?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          mode: string
          title: string | null
          status: string
          started_at: string
          ended_at: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mode?: string
          title?: string | null
          status?: string
          started_at?: string
          ended_at?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          mode?: string
          title?: string | null
          status?: string
          ended_at?: string | null
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          session_id: string
          user_id: string
          role: string
          content: string
          content_type: string
          language_code: string | null
          sequence_index: number
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          role?: string
          content: string
          content_type?: string
          language_code?: string | null
          sequence_index?: number
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          content?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      message_explainability: {
        Row: {
          id: string
          message_id: string | null
          session_id: string | null
          verse_reference: string | null
          source_label: string | null
          original_term: string | null
          original_term_language: string | null
          plain_meaning: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          message_id?: string | null
          session_id?: string | null
          verse_reference?: string | null
          source_label?: string | null
          original_term?: string | null
          original_term_language?: string | null
          plain_meaning?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          verse_reference?: string | null
          source_label?: string | null
          original_term?: string | null
          original_term_language?: string | null
          plain_meaning?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      scripture_vault: {
        Row: {
          id: string
          term: string
          original_script: string | null
          language: string
          phonetic: string | null
          plain_meaning: string | null
          theological_note: string | null
          verse_reference: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          term: string
          original_script?: string | null
          language: string
          phonetic?: string | null
          plain_meaning?: string | null
          theological_note?: string | null
          verse_reference?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          term?: string
          original_script?: string | null
          language?: string
          phonetic?: string | null
          plain_meaning?: string | null
          theological_note?: string | null
          verse_reference?: string | null
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      prayer_logs: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          title: string | null
          content: string
          tags: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          session_id?: string | null
          title?: string | null
          content: string
          tags?: Json
          created_at?: string
        }
        Update: {
          title?: string | null
          content?: string
          tags?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
