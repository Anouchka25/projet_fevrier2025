-- Disable RLS temporarily
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for beneficiaries
DO $$ 
BEGIN
  -- Delete all policies for the beneficiaries table
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON beneficiaries;', E'\n')
    FROM pg_policies 
    WHERE tablename = 'beneficiaries'
  );
END $$;

-- Re-enable RLS
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Create strict policies for beneficiaries
-- Users can only see beneficiaries for their own transfers
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

-- Users can only insert beneficiaries for their own transfers
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

-- Users can only update beneficiaries for their own transfers
CREATE POLICY "beneficiaries_update_policy"
ON beneficiaries
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  )
);

-- Users can only delete beneficiaries for their own transfers
CREATE POLICY "beneficiaries_delete_policy"
ON beneficiaries
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  )
);

-- Admin policy to allow full access for admins only
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

-- Create index for better query performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_beneficiaries_transfer_id ON beneficiaries(transfer_id);

-- Verify that the policies were created correctly
DO $$
DECLARE
  policy_count integer;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'beneficiaries';
  
  IF policy_count < 5 THEN
    RAISE WARNING 'Expected at least 5 policies for beneficiaries table, but found %', policy_count;
  END IF;
END $$;