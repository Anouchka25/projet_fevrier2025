-- Drop existing policies
DROP POLICY IF EXISTS "users_basic_access" ON users;
DROP POLICY IF EXISTS "users_admin_access" ON users;
DROP POLICY IF EXISTS "transfers_basic_access" ON users;
DROP POLICY IF EXISTS "transfers_admin_access" ON users;
DROP POLICY IF EXISTS "beneficiaries_basic_access" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiaries_admin_access" ON beneficiaries;

-- Create new policies for users table
CREATE POLICY "users_access_policy"
ON users
FOR ALL
TO authenticated
USING (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.is_admin = true
  )
)
WITH CHECK (
  id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.is_admin = true
  )
);

-- Create new policies for transfers table
CREATE POLICY "transfers_access_policy"
ON transfers
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.is_admin = true
  )
)
WITH CHECK (
  user_id = auth.uid() OR 
  EXISTS (
    SELECT 1 FROM users u 
    WHERE u.id = auth.uid() 
    AND u.is_admin = true
  )
);

-- Create new policies for beneficiaries table
CREATE POLICY "beneficiaries_access_policy"
ON beneficiaries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers t
    WHERE t.id = transfer_id
    AND (
      t.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.is_admin = true
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM transfers t
    WHERE t.id = transfer_id
    AND (
      t.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.is_admin = true
      )
    )
  )
);

-- Ensure admin user is set correctly
UPDATE users
SET is_admin = true
WHERE email = 'kundapay@gmail.com';