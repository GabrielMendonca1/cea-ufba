-- Migration to update user types and add automatic profile creation trigger

-- First, temporarily make user_type nullable and convert to text
ALTER TABLE user_profiles ALTER COLUMN user_type DROP NOT NULL;
ALTER TABLE user_profiles ALTER COLUMN user_type TYPE text;

-- Update existing records to use 'professor' instead of 'teacher'
UPDATE user_profiles SET user_type = 'professor' WHERE user_type = 'teacher';

-- Drop the old enum
DROP TYPE user_type;

-- Create new enum with 'professor' instead of 'teacher'
CREATE TYPE user_type AS ENUM ('student', 'professor');

-- Update the user_profiles table to use the new enum
ALTER TABLE user_profiles ALTER COLUMN user_type TYPE user_type USING user_type::user_type;
ALTER TABLE user_profiles ALTER COLUMN user_type SET NOT NULL;

-- Create function to automatically create user profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'student')::user_type,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    false,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Add role column (this is the same as user_type, but adding for clarity if needed)
-- The role will be handled by the user_type column, so this comment documents the mapping:
-- user_type enum values: 'student', 'professor'
-- These map to roles: 'student', 'professor' 