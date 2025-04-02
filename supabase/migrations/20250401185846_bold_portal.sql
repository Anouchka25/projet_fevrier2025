/*
  # Fix beneficiary privacy issues
  
  1. Changes
    - Update beneficiaries policy to ensure users can only see their own beneficiaries
    - Remove any overly permissive policies
    
  2. Security
    - Ensure proper RLS policies for beneficiaries table
    - Restrict access to only the user's own beneficiaries
*/

-- Disable RLS temporarily
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies for beneficiaries
DO $$ 
BEGIN
  -- Supprimer les politiques de la table beneficiaries
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON beneficiaries;', E'\n')
    FROM pg_policies 
    WHERE tablename = 'beneficiaries'
  );
END $$;

-- Re-enable RLS
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

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

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_beneficiaries_transfer_id ON beneficiaries(transfer_id);