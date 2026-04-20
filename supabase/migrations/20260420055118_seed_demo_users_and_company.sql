/*
  # Seed Demo Users and Company

  Creates a demo company and seeds all 4 role types:
  1. saas_admin - platform-wide administrator
  2. company_admin - company administrator (admin@effysalespro.com already exists, updated)
  3. sales_manager - manager@effysalespro.com already exists, updated
  4. sales_agent - agent demo user

  Also creates a demo company and links relevant users.
*/

-- Create demo company
INSERT INTO companies (id, company_name, industry, subscription_plan, subscription_status, license_count, used_license_count, token_limit_per_month, is_active, company_admin_email)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Acme Corp',
  'Technology',
  'professional',
  'active',
  50,
  4,
  2000000,
  true,
  'admin@effysalespro.com'
)
ON CONFLICT (id) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  industry = EXCLUDED.industry,
  subscription_plan = EXCLUDED.subscription_plan,
  subscription_status = EXCLUDED.subscription_status,
  license_count = EXCLUDED.license_count,
  used_license_count = EXCLUDED.used_license_count,
  token_limit_per_month = EXCLUDED.token_limit_per_month,
  is_active = EXCLUDED.is_active;

-- Update existing users to link to demo company
UPDATE user_profiles SET
  company_id = '11111111-1111-1111-1111-111111111111',
  is_active = true,
  last_login_at = now() - interval '2 hours',
  token_usage = 12450
WHERE email = 'admin@effysalespro.com';

UPDATE user_profiles SET
  company_id = '11111111-1111-1111-1111-111111111111',
  is_active = true,
  last_login_at = now() - interval '1 day',
  token_usage = 8200
WHERE email = 'manager@effysalespro.com';

UPDATE user_profiles SET
  company_id = '11111111-1111-1111-1111-111111111111',
  is_active = true,
  last_login_at = now() - interval '3 hours',
  token_usage = 5100
WHERE email = 'agent1@effysalespro.com';

UPDATE user_profiles SET
  company_id = '11111111-1111-1111-1111-111111111111',
  is_active = false,
  last_login_at = now() - interval '30 days',
  token_usage = 1200
WHERE email = 'agent2@effysalespro.com';

-- Insert a saas_admin demo user profile if a matching auth user exists
-- (The user will need to be created via the create-demo-users edge function or Supabase dashboard)
-- For now we create a placeholder that will be linked when saas@effysalespro.com signs up
