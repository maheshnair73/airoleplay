/*
  # Create app_settings table for storing API keys

  Stores global application settings like API keys.
  Only super admins / company admins can write; the service role reads them
  from edge functions.

  1. New Tables
    - `app_settings` — key/value store for sensitive config
      - `key` (text, primary key)
      - `value` (text)
      - `updated_at` (timestamptz)

  2. Security
    - RLS enabled
    - Authenticated users can SELECT (so the frontend can check if a key is set)
    - Authenticated users can INSERT/UPDATE (admin-only enforcement at app level)
    - Service role bypasses RLS so edge functions can read freely
*/

CREATE TABLE IF NOT EXISTS app_settings (
  key text PRIMARY KEY,
  value text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert settings"
  ON app_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
