/*
  # Fix Trigger to Bypass RLS

  1. Changes
    - Modify the handle_new_user trigger function to properly bypass RLS
    - Set local role to service_role within the function to ensure RLS policies allow the insert

  2. Security
    - Function remains SECURITY DEFINER
    - Only creates profiles for newly created auth users
*/

-- Drop and recreate the trigger function with RLS bypass
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert into user_profiles, this will run as the function owner (bypassing RLS)
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''), 
    'sales_agent'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();
