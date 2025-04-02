-- Disable RLS temporarily
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "transfers_access_policy" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_access_policy" ON beneficiaries;

-- Re-enable RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Create strict policies for transfers
CREATE POLICY "transfers_select_policy"
ON transfers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "transfers_insert_policy"
ON transfers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "transfers_admin_policy"
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

-- Create strict policies for beneficiaries
CREATE POLICY "beneficiaries_select_policy"
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

CREATE POLICY "beneficiaries_insert_policy"
ON beneficiaries
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  )
);

CREATE POLICY "beneficiaries_admin_policy"
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

-- Update transfer conditions
UPDATE transfer_conditions
SET value = 500
WHERE name = 'MAX_AMOUNT_FROM_GABON';

UPDATE transfer_conditions
SET value = 2000
WHERE name = 'MAX_AMOUNT_TO_GABON';