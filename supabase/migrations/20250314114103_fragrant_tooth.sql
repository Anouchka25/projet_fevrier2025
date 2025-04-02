-- Add phone column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone text;

-- Drop and recreate sync_auth_user function with proper error handling
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

-- Create index for phone column
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);