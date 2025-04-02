-- Drop all existing policies for users table
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "Admin users have full access" ON users;
DROP POLICY IF EXISTS "users_read_policy" ON users;
DROP POLICY IF EXISTS "users_write_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;
DROP POLICY IF EXISTS "users_select_access_20250216" ON users;
DROP POLICY IF EXISTS "users_insert_access_20250216" ON users;
DROP POLICY IF EXISTS "users_update_access_20250216" ON users;

-- Create a single, simple policy for all operations
CREATE POLICY "users_access_policy_20250216"
ON users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);