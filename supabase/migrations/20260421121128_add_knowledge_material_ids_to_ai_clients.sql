/*
  # Add knowledge_material_ids to ai_clients

  Stores an array of roleplay_knowledge_materials IDs on each AI client bot,
  so when a call starts the correct training context is automatically loaded.

  1. Changes
    - `ai_clients`: adds `knowledge_material_ids` uuid[] column (default empty array)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_clients' AND column_name = 'knowledge_material_ids'
  ) THEN
    ALTER TABLE ai_clients ADD COLUMN knowledge_material_ids uuid[] DEFAULT '{}';
  END IF;
END $$;
