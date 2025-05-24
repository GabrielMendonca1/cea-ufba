-- Enhanced logging for debugging signup issues

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create enhanced trigger function with detailed logging
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_type_value user_type;
  full_name_value text;
  raw_metadata jsonb;
BEGIN
  -- Log the start of the function
  RAISE LOG 'handle_new_user: Starting profile creation for user %', NEW.id;
  
  -- Log the raw metadata received
  raw_metadata := NEW.raw_user_meta_data;
  RAISE LOG 'handle_new_user: Raw metadata for user %: %', NEW.id, raw_metadata;
  
  -- Safely extract user_type with fallback to 'student'
  BEGIN
    user_type_value := COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')::user_type;
    RAISE LOG 'handle_new_user: Successfully extracted user_type % for user %', user_type_value, NEW.id;
  EXCEPTION WHEN invalid_text_representation THEN
    user_type_value := 'student'::user_type;
    RAISE WARNING 'handle_new_user: Invalid user_type in metadata for user %, defaulting to student. Raw value: %', 
      NEW.id, NEW.raw_user_meta_data->>'user_type';
  END;
  
  -- Safely extract full_name
  full_name_value := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  RAISE LOG 'handle_new_user: Extracted full_name "%" for user %', full_name_value, NEW.id;
  
  -- Log before profile insertion
  RAISE LOG 'handle_new_user: Attempting to insert profile for user % with email %', NEW.id, NEW.email;
  
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
  
  RAISE LOG 'handle_new_user: Successfully created profile for user % with type %', NEW.id, user_type_value;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Detailed error logging
  RAISE WARNING 'handle_new_user: FAILED to create user profile for user %', NEW.id;
  RAISE WARNING 'handle_new_user: Error code: %, Error message: %', SQLSTATE, SQLERRM;
  RAISE WARNING 'handle_new_user: User email: %, Metadata: %', NEW.email, NEW.raw_user_meta_data;
  RAISE WARNING 'handle_new_user: Extracted user_type: %, full_name: %', user_type_value, full_name_value;
  
  -- Still return NEW to allow user creation to continue
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Log that the trigger was created
DO $$
BEGIN
  RAISE LOG 'Enhanced trigger function and trigger created successfully';
END $$; 