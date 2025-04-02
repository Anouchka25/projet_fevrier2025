/*
  # Set up admin users
  
  1. Changes
    - Creates or updates admin users
    - Sets proper permissions
    - Creates RLS policy for admin access
*/

-- Create or update kundapay@gmail.com user
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    country,
    is_admin,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    'kundapay@gmail.com',
    'Admin',
    'KundaPay',
    'FR',
    true,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (email) 
  DO UPDATE SET 
    is_admin = true,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    country = EXCLUDED.country;

-- Create or update minkoueobamea@gmail.com user
INSERT INTO users (
    id,
    email,
    first_name,
    last_name,
    country,
    is_admin,
    created_at
  )
  VALUES (
    gen_random_uuid(),
    'minkoueobamea@gmail.com',
    'Anouchka',
    'MINKOUE OBAME',
    'FR',
    true,
    CURRENT_TIMESTAMP
  )
  ON CONFLICT (email) 
  DO UPDATE SET 
    is_admin = true,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    country = EXCLUDED.country;

-- Verify admin status is set correctly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Failed to set admin status for required users';
  END IF;
END $$;

-- Create RLS policy to allow admin users to access everything
DROP POLICY IF EXISTS "Admin users have full access" ON users;
CREATE POLICY "Admin users have full access"
ON users
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users u
    WHERE u.id = auth.uid()
    AND u.is_admin = true
  )
);