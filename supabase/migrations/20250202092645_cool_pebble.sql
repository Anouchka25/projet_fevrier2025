/*
  # Fix Admin Access

  1. Changes
    - Reset admin status for all users
    - Set admin status for kundapay@gmail.com
    - Add policy for admin access
*/

-- Reset admin status
UPDATE users
SET is_admin = false
WHERE is_admin = true;

-- Set new admin
UPDATE users
SET is_admin = true
WHERE email = 'kundapay@gmail.com';

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "transfers_access" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_access" ON beneficiaries;

-- Create new policies
CREATE POLICY "users_basic_access"
ON users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_admin_access"
ON users
FOR ALL
TO authenticated
USING (
  is_admin = true
)
WITH CHECK (
  is_admin = true
);

CREATE POLICY "transfers_basic_access"
ON transfers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "transfers_admin_access"
ON transfers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "beneficiaries_basic_access"
ON beneficiaries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  )
);

CREATE POLICY "beneficiaries_admin_access"
ON beneficiaries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);