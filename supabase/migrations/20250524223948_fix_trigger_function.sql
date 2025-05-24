-- Fix the trigger function that's causing signup failures

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create a safer trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type_value user_type;
  full_name_value text;
BEGIN
  -- Safely extract user_type with fallback to 'student'
  BEGIN
    user_type_value := COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')::user_type;
  EXCEPTION WHEN invalid_text_representation THEN
    user_type_value := 'student'::user_type;
  END;
  
  -- Safely extract full_name
  full_name_value := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  
  -- Insert user profile
  INSERT INTO user_profiles (
    id,
    email,
    user_type,
    full_name,
    has_completed_onboarding,
    is_profile_complete
  )
  VALUES (
    NEW.id,
    NEW.email,
    user_type_value,
    full_name_value,
    false,
    false
  );
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't prevent user creation
  RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 