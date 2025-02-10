-- Drop and recreate transfer_conditions table with proper constraints
DROP TABLE IF EXISTS transfer_conditions CASCADE;

CREATE TABLE transfer_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  value numeric NOT NULL,
  currency text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT transfer_conditions_name_key UNIQUE (name)
);

-- Enable RLS
ALTER TABLE transfer_conditions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access for transfer conditions"
ON transfer_conditions
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow admin write access for transfer conditions"
ON transfer_conditions
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Insert default transfer conditions
INSERT INTO transfer_conditions 
  (name, value, currency, description)
VALUES 
  (
    'MAX_AMOUNT_PER_TRANSFER',
    500,
    'EUR',
    'Montant maximum autorisé par transfert'
  ),
  (
    'MAX_AMOUNT_PER_YEAR',
    5000,
    'EUR',
    'Montant maximum autorisé par année'
  ),
  (
    'MAX_TRANSFERS_WITHOUT_ID',
    10,
    'COUNT',
    'Nombre maximum de transferts avant vérification d''identité requise'
  );

-- Create index for better query performance
CREATE INDEX idx_transfer_conditions_name 
ON transfer_conditions(name);

-- Verify the insertion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_conditions 
    WHERE name = 'MAX_AMOUNT_PER_TRANSFER'
  ) THEN
    RAISE EXCEPTION 'Failed to insert transfer conditions';
  END IF;
END $$;