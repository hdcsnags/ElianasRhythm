/*
  # Eliana Phase 1 Initial Schema

  ## Summary
  Creates the full database schema for the Eliana spiritual companion app.
  Includes tables for user profiles, sessions, messages, explainability,
  scripture reference, and prayer logs.

  ## New Tables

  1. **profiles** - User profile and preferences
     - id: references auth.users
     - display_name, preferred_response_style, holy_pause_enabled
     - language preferences, timestamps

  2. **sessions** - Companion/Bridge/Tutor sessions
     - user_id, mode (companion|bridge|tutor), status, title
     - started_at, ended_at, metadata (jsonb), timestamps

  3. **messages** - Session transcript messages
     - session_id, user_id, role (user|assistant|system)
     - content, content_type, sequence_index, metadata, timestamps

  4. **message_explainability** - Spiritual grounding context per message
     - Links to message/session, verse_reference, original_term details

  5. **scripture_vault** - Shared reference data for original-language terms
     - term, original_script, language, phonetic, plain_meaning, notes

  6. **prayer_logs** - Optional prayer/reflection log entries
     - user-owned, optional session link, tags

  ## Security
  - RLS enabled on all tables
  - All user-owned tables: users can only access their own records
  - scripture_vault: authenticated read-only (shared reference data)

  ## Indexes
  - sessions(user_id, created_at DESC)
  - messages(session_id, sequence_index)
  - messages(user_id, created_at DESC)
  - scripture_vault(term), scripture_vault(language)

  ## Triggers
  - Auto-update updated_at on profiles, sessions, scripture_vault
  - Auto-create profile on auth user signup
*/

-- =============================================
-- UTILITY FUNCTION
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

-- =============================================
-- PROFILES
-- =============================================

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text,
  preferred_response_style text DEFAULT 'reflective',
  holy_pause_enabled boolean DEFAULT true,
  preferred_language_primary text DEFAULT 'en',
  preferred_language_secondary text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- SESSIONS
-- =============================================

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'companion',
  title text,
  status text NOT NULL DEFAULT 'active',
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
  ON sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_sessions_updated_at ON sessions;
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_sessions_user_id_created_at ON sessions(user_id, created_at DESC);

-- =============================================
-- MESSAGES
-- =============================================

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL DEFAULT '',
  content_type text DEFAULT 'text',
  language_code text,
  sequence_index integer NOT NULL DEFAULT 0,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_messages_session_id_sequence ON messages(session_id, sequence_index);
CREATE INDEX IF NOT EXISTS idx_messages_user_id_created_at ON messages(user_id, created_at DESC);

-- =============================================
-- MESSAGE EXPLAINABILITY
-- =============================================

CREATE TABLE IF NOT EXISTS message_explainability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  verse_reference text,
  source_label text,
  original_term text,
  original_term_language text,
  plain_meaning text,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE message_explainability ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own explainability entries"
  ON message_explainability FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = message_explainability.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own explainability entries"
  ON message_explainability FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = message_explainability.session_id
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own explainability entries"
  ON message_explainability FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sessions s
      WHERE s.id = message_explainability.session_id
      AND s.user_id = auth.uid()
    )
  );

-- =============================================
-- SCRIPTURE VAULT (shared reference data)
-- =============================================

CREATE TABLE IF NOT EXISTS scripture_vault (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term text NOT NULL,
  original_script text,
  language text NOT NULL,
  phonetic text,
  plain_meaning text,
  theological_note text,
  verse_reference text,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE scripture_vault ENABLE ROW LEVEL SECURITY;

-- Scripture vault is shared reference data: all authenticated users can read
CREATE POLICY "Authenticated users can read scripture vault"
  ON scripture_vault FOR SELECT
  TO authenticated
  USING (true);

DROP TRIGGER IF EXISTS update_scripture_vault_updated_at ON scripture_vault;
CREATE TRIGGER update_scripture_vault_updated_at
  BEFORE UPDATE ON scripture_vault
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_scripture_vault_term ON scripture_vault(term);
CREATE INDEX IF NOT EXISTS idx_scripture_vault_language ON scripture_vault(language);

-- =============================================
-- PRAYER LOGS
-- =============================================

CREATE TABLE IF NOT EXISTS prayer_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  title text,
  content text NOT NULL DEFAULT '',
  tags jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE prayer_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prayer logs"
  ON prayer_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own prayer logs"
  ON prayer_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own prayer logs"
  ON prayer_logs FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own prayer logs"
  ON prayer_logs FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- =============================================
-- SEED: Scripture vault sample entries
-- =============================================

INSERT INTO scripture_vault (term, original_script, language, phonetic, plain_meaning, theological_note, verse_reference)
VALUES
  ('Shalom', 'שָׁלוֹם', 'Hebrew', 'sha-LOME', 'Peace; wholeness; completeness', 'More than absence of conflict — fullness of flourishing', 'Numbers 6:24-26'),
  ('Hesed', 'חֶסֶד', 'Hebrew', 'HEH-sed', 'Loving-kindness; steadfast love; covenant faithfulness', 'The unwavering commitment of covenant love — deeper than emotion', 'Lamentations 3:22-23'),
  ('Logos', 'λόγος', 'Greek', 'LOH-gos', 'Word; reason; divine ordering principle', 'In John 1, the creative and relational Word through whom all things were made', 'John 1:1'),
  ('Agape', 'ἀγάπη', 'Greek', 'ah-GAH-pay', 'Unconditional love; self-giving love', 'Love that acts for the good of the other regardless of worthiness', '1 Corinthians 13:4-8'),
  ('Ruach', 'רוּחַ', 'Hebrew', 'ROO-akh', 'Spirit; breath; wind', 'The animating breath of God — life-giving presence', 'Genesis 1:2')
ON CONFLICT DO NOTHING;
