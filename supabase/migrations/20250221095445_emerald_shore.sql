-- Drop and recreate transfer_conditions table
DROP TABLE IF EXISTS transfer_conditions CASCADE;

CREATE TABLE transfer_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  value numeric NOT NULL,
  currency text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
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

-- Insert default conditions
INSERT INTO transfer_conditions (name, value, currency, description)
VALUES 
  (
    'MAX_AMOUNT_FROM_GABON',
    500,
    'EUR',
    'Montant maximum autorisé pour les transferts depuis le Gabon'
  ),
  (
    'MAX_AMOUNT_TO_GABON',
    2000,
    'EUR',
    'Montant maximum autorisé pour les transferts vers le Gabon'
  );