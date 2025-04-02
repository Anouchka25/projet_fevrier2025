-- Add phone column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;

-- Create index for phone column
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Add comment for documentation
COMMENT ON COLUMN users.phone IS 'User''s phone number';

-- Drop and recreate sync_auth_user function with better error handling
CREATE OR REPLACE FUNCTION sync_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user profile
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    country,
    phone,
    created_at,
    terms_accepted,
    terms_accepted_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', 'FR'),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    NEW.created_at,
    COALESCE((NEW.raw_user_meta_data->>'terms_accepted')::boolean, false),
    CASE 
      WHEN (NEW.raw_user_meta_data->>'terms_accepted')::boolean = true 
      THEN COALESCE(
        (NEW.raw_user_meta_data->>'terms_accepted_at')::timestamptz,
        NEW.created_at
      )
      ELSE null
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    country = EXCLUDED.country,
    phone = EXCLUDED.phone,
    terms_accepted = EXCLUDED.terms_accepted,
    terms_accepted_at = EXCLUDED.terms_accepted_at,
    updated_at = CURRENT_TIMESTAMP;

  -- Set admin status for specific users
  UPDATE public.users
  SET is_admin = true
  WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
    AND id = NEW.id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error details
    RAISE WARNING 'Error in sync_auth_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_auth_user();

-- Ensure RLS policies are correct
DROP POLICY IF EXISTS "users_access" ON users;
CREATE POLICY "users_access"
  ON users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Allow users to upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to view their own files" ON storage.objects;

-- Create new storage policies with unique names
CREATE POLICY "storage_objects_upload_policy"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files');

CREATE POLICY "storage_objects_select_policy"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-files');

-- Ensure admin users exist
INSERT INTO users (email, first_name, last_name, country, is_admin)
VALUES 
  ('kundapay@gmail.com', 'Admin', 'KundaPay', 'FR', true),
  ('minkoueobamea@gmail.com', 'Anouchka', 'MINKOUE OBAME', 'FR', true)
ON CONFLICT (email) 
DO UPDATE SET 
  is_admin = true,
  updated_at = CURRENT_TIMESTAMP;