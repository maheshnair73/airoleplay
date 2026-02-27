/*
  # Add Public Function to Check Demo Users

  1. New Functions
    - `check_demo_users_exist()` - Public function that returns whether demo users exist
      - Returns a boolean indicating if all 4 demo users are present
      - Can be called by anonymous users (no auth required)
      - Safe for public access as it only returns a true/false value
  
  2. Security
    - Function is marked as SECURITY DEFINER to bypass RLS
    - Only returns boolean, no sensitive data exposed
    - Grants execute permission to anonymous users
*/

-- Create a public function to check if demo users exist
CREATE OR REPLACE FUNCTION public.check_demo_users_exist()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  demo_count INTEGER;
BEGIN
  -- Count how many demo users exist
  SELECT COUNT(*) INTO demo_count
  FROM auth.users
  WHERE email IN (
    'admin@effysalespro.com',
    'manager@effysalespro.com',
    'agent1@effysalespro.com',
    'agent2@effysalespro.com'
  );
  
  -- Return true if all 4 demo users exist
  RETURN demo_count = 4;
END;
$$;

-- Grant execute permission to anonymous users
GRANT EXECUTE ON FUNCTION public.check_demo_users_exist() TO anon;
GRANT EXECUTE ON FUNCTION public.check_demo_users_exist() TO authenticated;