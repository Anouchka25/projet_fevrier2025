-- Add terms acceptance tracking to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- Add transfer terms acceptance to transfers table
ALTER TABLE transfers 
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- Add comment for documentation
COMMENT ON COLUMN users.terms_accepted IS 'Whether the user has accepted the terms during registration';
COMMENT ON COLUMN users.terms_accepted_at IS 'When the user accepted the terms during registration';
COMMENT ON COLUMN transfers.terms_accepted IS 'Whether the user has accepted the terms for this transfer';
COMMENT ON COLUMN transfers.terms_accepted_at IS 'When the user accepted the terms for this transfer';

-- Disable RLS temporarily
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "beneficiaries_access_policy" ON beneficiaries;
DROP POLICY IF EXISTS "allow_all_beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiaries_policy" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiaries_select_policy" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiaries_insert_policy" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiaries_admin_policy" ON beneficiaries;

-- Re-enable RLS
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Create new unified policy for beneficiaries
CREATE POLICY "beneficiaries_unified_policy"
ON beneficiaries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND (
      transfers.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND (
      transfers.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
      )
    )
  )
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_beneficiaries_transfer_id ON beneficiaries(transfer_id);