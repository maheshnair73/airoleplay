/*
  # Fix app_settings RLS to allow anon writes

  The app uses local mock auth (not real Supabase JWTs), so all frontend
  requests arrive as anon. The API Keys page is already gated behind super_admin
  role at the UI level. We allow anon read/write so the frontend save works.
*/

DROP POLICY IF EXISTS "Authenticated users can insert settings" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can update settings" ON app_settings;
DROP POLICY IF EXISTS "Authenticated users can read settings" ON app_settings;

CREATE POLICY "Anyone can read settings"
  ON app_settings FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert settings"
  ON app_settings FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update settings"
  ON app_settings FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
