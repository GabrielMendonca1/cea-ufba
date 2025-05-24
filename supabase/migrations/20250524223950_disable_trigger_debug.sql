-- Temporarily disable the trigger to debug the signup issue

-- Drop the trigger but keep the function for later
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Log that trigger was disabled
DO $$
BEGIN
  RAISE LOG 'Trigger disabled for debugging - users can now be created without automatic profile creation';
END $$;

-- Check if user_profiles table has any issues
-- Let's also check the RLS policies
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  -- Count RLS policies on user_profiles
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies 
  WHERE tablename = 'user_profiles';
  
  RAISE LOG 'user_profiles table has % RLS policies', policy_count;
  
  -- Check if RLS is enabled
  IF EXISTS (
    SELECT 1 FROM pg_class c 
    JOIN pg_namespace n ON n.oid = c.relnamespace 
    WHERE c.relname = 'user_profiles' 
    AND n.nspname = 'public' 
    AND c.relrowsecurity = true
  ) THEN
    RAISE LOG 'RLS is ENABLED on user_profiles table';
  ELSE
    RAISE LOG 'RLS is DISABLED on user_profiles table';
  END IF;
END $$; 