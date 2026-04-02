/*
  # Add selling_context and related fields to ai_clients

  1. New Columns
    - `selling_context` (text): Description of what you're selling to this AI client
    - `call_goal` (text): The specific goal for practicing with this client
    - `buyer_awareness_level` (text): How aware the prospect is of their problem/solution

  2. Notes
    - These fields enhance the AI client details for better practice sessions
    - All fields are optional to maintain backwards compatibility
    - No data loss occurs with this migration
*/

-- Add selling_context field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_clients' AND column_name = 'selling_context'
  ) THEN
    ALTER TABLE ai_clients ADD COLUMN selling_context text;
  END IF;
END $$;

-- Add call_goal field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_clients' AND column_name = 'call_goal'
  ) THEN
    ALTER TABLE ai_clients ADD COLUMN call_goal text;
  END IF;
END $$;

-- Add buyer_awareness_level field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ai_clients' AND column_name = 'buyer_awareness_level'
  ) THEN
    ALTER TABLE ai_clients ADD COLUMN buyer_awareness_level text;
  END IF;
END $$;
