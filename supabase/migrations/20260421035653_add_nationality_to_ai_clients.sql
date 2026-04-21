/*
  # Add nationality field to ai_clients table

  1. Changes
    - Adds `nationality` (text) column to `ai_clients` table
      - Stores the persona's nationality/region for accent-accurate voice selection
      - Examples: 'US', 'UK', 'Indian', 'Australian', 'Nigerian', 'Arabic', 'South African', etc.

  2. Notes
    - Nullable: existing rows default to NULL (will fall back to gender+personality voice selection)
    - No RLS changes needed: inherits existing ai_clients policies
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_clients' AND column_name = 'nationality'
  ) THEN
    ALTER TABLE ai_clients ADD COLUMN nationality text;
  END IF;
END $$;
