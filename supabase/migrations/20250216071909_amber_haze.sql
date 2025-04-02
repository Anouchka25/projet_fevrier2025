-- Drop all existing policies for users table
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "Admin users have full access" ON users;
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

-- Create new policies with unique names
CREATE POLICY "users_select_access_20250216"
ON users
FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR
  email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
);

CREATE POLICY "users_insert_access_20250216"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_access_20250216"
ON users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
)
WITH CHECK (
  auth.uid() = id OR
  email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
);