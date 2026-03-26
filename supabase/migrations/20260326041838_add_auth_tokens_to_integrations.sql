/*
  # Add auth_tokens column to integration_connections

  1. Changes
    - Add `auth_tokens` jsonb column to store complete OAuth response
    - This will store access_token, refresh_token, expires_at in one place
    - Keeps existing columns for backwards compatibility
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'integration_connections' AND column_name = 'auth_tokens'
  ) THEN
    ALTER TABLE integration_connections ADD COLUMN auth_tokens jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;
