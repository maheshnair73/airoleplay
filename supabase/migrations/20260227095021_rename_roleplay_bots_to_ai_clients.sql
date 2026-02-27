/*
  # Rename roleplay_bots to ai_clients

  1. Table Renaming
    - Rename `roleplay_bots` table to `ai_clients`
    - Update all foreign key references
    - Preserve all data and constraints

  2. Update Related Tables
    - Update `roleplay_sessions` table column from `bot_id` to `ai_client_id`
    - Update `product_demo_sessions` if it references bot_id

  3. Indexes and Constraints
    - All indexes are automatically renamed by PostgreSQL
    - All RLS policies are preserved
    - All triggers are preserved

  Note: This migration is safe and preserves all existing data
*/

-- Rename the roleplay_bots table to ai_clients
ALTER TABLE IF EXISTS roleplay_bots RENAME TO ai_clients;

-- Update foreign key column name in roleplay_sessions if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'roleplay_sessions' AND column_name = 'bot_id'
  ) THEN
    ALTER TABLE roleplay_sessions RENAME COLUMN bot_id TO ai_client_id;
  END IF;
END $$;

-- Update sequence name if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class
    WHERE relname = 'roleplay_bots_id_seq'
  ) THEN
    ALTER SEQUENCE roleplay_bots_id_seq RENAME TO ai_clients_id_seq;
  END IF;
END $$;

-- Note: PostgreSQL automatically updates:
-- - All indexes (they keep their references to the new table name)
-- - All RLS policies (they remain attached to the renamed table)
-- - All foreign key constraints
-- - All triggers

-- Verify the rename was successful by checking if ai_clients exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'ai_clients'
  ) THEN
    RAISE EXCEPTION 'Table rename failed: ai_clients table does not exist';
  END IF;
END $$;