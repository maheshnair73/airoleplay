/*
  # Create Attendee Profiles Table

  1. New Table - attendee_profiles
    - `id` (uuid, primary key) - Unique identifier
    - `name` (text, required) - Attendee's full name
    - `gender` (text, required) - Gender: Male, Female, Non-binary
    - `role` (text, required) - Job title/role
    - `persona_type` (text) - Type of buyer persona (Technical Buyer, Business Buyer, Executive, End User, Champion, Influencer, etc.)
    - `background` (text) - Additional context about the attendee
    - `traits` (jsonb) - Array of personality traits
    - `pain_points` (jsonb) - Array of pain points
    - `company_context` (text) - Information about attendee's company
    - `company_id` (uuid) - Links to company for organization-level management
    - `created_by` (uuid) - User who created this profile
    - `is_active` (boolean) - Soft deletion flag
    - `visibility` (text) - Who can see: 'all_users', 'specific_users', 'creator_only'
    - `shared_with_user_ids` (jsonb) - Array of user IDs with access when visibility='specific_users'
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp

  2. Security
    - Enable RLS
    - Users can view attendee profiles based on visibility settings
    - Admins can create profiles for all users
    - Regular users can only create creator_only profiles
    - Users can update and delete their own profiles

  3. Indexes
    - Index on company_id for company-level queries
    - Index on created_by for user-level queries
    - Index on visibility for filtering
    - Index on persona_type for categorization
*/

-- Create attendee_profiles table
CREATE TABLE IF NOT EXISTS attendee_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  gender text NOT NULL,
  role text NOT NULL,
  persona_type text,
  background text,
  traits jsonb DEFAULT '[]'::jsonb,
  pain_points jsonb DEFAULT '[]'::jsonb,
  company_context text,
  company_id uuid REFERENCES companies(id),
  created_by uuid REFERENCES auth.users(id),
  is_active boolean DEFAULT true,
  visibility text DEFAULT 'all_users',
  shared_with_user_ids jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add check constraint for gender values
ALTER TABLE attendee_profiles
ADD CONSTRAINT attendee_profiles_gender_check
CHECK (gender IN ('Male', 'Female', 'Non-binary'));

-- Add check constraint for visibility values
ALTER TABLE attendee_profiles
ADD CONSTRAINT attendee_profiles_visibility_check
CHECK (visibility IN ('all_users', 'specific_users', 'creator_only'));

-- Enable RLS
ALTER TABLE attendee_profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies with visibility controls
CREATE POLICY "Users can view accessible attendee profiles"
  ON attendee_profiles FOR SELECT
  TO authenticated
  USING (
    is_active = true AND (
      visibility = 'all_users'
      OR auth.uid() = created_by
      OR (
        visibility = 'specific_users'
        AND shared_with_user_ids ? auth.uid()::text
      )
    )
  );

CREATE POLICY "Authenticated users can create attendee profiles"
  ON attendee_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = created_by AND
    (
      -- Regular users can only create creator_only profiles
      (visibility = 'creator_only' AND get_my_role() NOT IN ('super_admin', 'company_admin'))
      OR
      -- Admins can create any visibility type
      (get_my_role() IN ('super_admin', 'company_admin'))
    )
  );

CREATE POLICY "Users can update accessible profiles"
  ON attendee_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    get_my_role() IN ('super_admin', 'company_admin')
  )
  WITH CHECK (
    auth.uid() = created_by OR
    get_my_role() IN ('super_admin', 'company_admin')
  );

CREATE POLICY "Users can delete own profiles"
  ON attendee_profiles FOR DELETE
  TO authenticated
  USING (
    auth.uid() = created_by OR
    get_my_role() IN ('super_admin', 'company_admin')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attendee_profiles_company_id ON attendee_profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_attendee_profiles_created_by ON attendee_profiles(created_by);
CREATE INDEX IF NOT EXISTS idx_attendee_profiles_visibility ON attendee_profiles(visibility);
CREATE INDEX IF NOT EXISTS idx_attendee_profiles_persona_type ON attendee_profiles(persona_type);
CREATE INDEX IF NOT EXISTS idx_attendee_profiles_is_active ON attendee_profiles(is_active);