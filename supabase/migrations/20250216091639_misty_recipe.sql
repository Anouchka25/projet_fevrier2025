-- Drop ALL existing policies for users table
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "Admin users have full access" ON users;
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_select_access_20250216" ON users;
DROP POLICY IF EXISTS "users_insert_access_20250216" ON users;
DROP POLICY IF EXISTS "users_update_access_20250216" ON users;
DROP POLICY IF EXISTS "users_access_policy_20250216" ON users;
DROP POLICY IF EXISTS "users_select_policy_v2" ON users;
DROP POLICY IF EXISTS "users_insert_policy_v2" ON users;
DROP POLICY IF EXISTS "users_update_policy_v2" ON users;

-- Disable RLS temporarily to ensure clean state
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create new simplified policies
CREATE POLICY "users_select_policy"
ON users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_insert_policy"
ON users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy"
ON users
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  is_admin = true
)
WITH CHECK (
  auth.uid() = id OR
  is_admin = true
);

-- Ensure admin users exist
UPDATE users
SET is_admin = true
WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com');