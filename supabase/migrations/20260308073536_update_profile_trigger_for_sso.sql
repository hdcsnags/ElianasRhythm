/*
  # Update profile trigger to capture display name from SSO

  ## Summary
  Updates the auto-profile-creation trigger to extract display_name
  from user metadata when signing up via Google SSO or email signup.

  ## Changes
  - Modified `handle_new_user()` function to read `display_name` or
    `full_name` from `raw_user_meta_data`
  - Supports both email signup (display_name) and Google SSO (full_name)

  ## Important Notes
  1. Uses ON CONFLICT DO NOTHING to avoid overwriting existing profiles
  2. Falls back gracefully if no name metadata is present
*/

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _display_name text;
BEGIN
  _display_name := COALESCE(
    NEW.raw_user_meta_data ->> 'display_name',
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.raw_user_meta_data ->> 'name'
  );

  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, _display_name)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
