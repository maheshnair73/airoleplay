/*
  # Extend product_demo_sessions with buyer context fields

  1. Schema Changes
    - Add `company_size` column to `product_demo_sessions` table
    - Add `budget_range` column to `product_demo_sessions` table
    - Add `buying_timeline` column to `product_demo_sessions` table
    - Add `product_inquiry` column to store complete inquiry context as JSON

  2. Details
    - These fields capture buyer context during demo setup
    - Helps AI personalize the demo experience
    - Enables post-demo analytics on buyer needs
    - Supports better scoring and evaluation

  3. Important Notes
    - Fields are optional to support flexible demo scenarios
    - product_inquiry stores the complete inquiry data
    - Maintains backward compatibility with existing sessions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_demo_sessions' AND column_name = 'company_size'
  ) THEN
    ALTER TABLE product_demo_sessions ADD COLUMN company_size text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_demo_sessions' AND column_name = 'budget_range'
  ) THEN
    ALTER TABLE product_demo_sessions ADD COLUMN budget_range text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_demo_sessions' AND column_name = 'buying_timeline'
  ) THEN
    ALTER TABLE product_demo_sessions ADD COLUMN buying_timeline text;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_demo_sessions' AND column_name = 'product_inquiry'
  ) THEN
    ALTER TABLE product_demo_sessions ADD COLUMN product_inquiry jsonb;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_product_demo_sessions_company_size ON product_demo_sessions(company_size);
CREATE INDEX IF NOT EXISTS idx_product_demo_sessions_timeline ON product_demo_sessions(buying_timeline);
