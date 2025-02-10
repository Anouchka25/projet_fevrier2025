-- Create transfer_conditions table
CREATE TABLE transfer_conditions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  value numeric NOT NULL,
  currency text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE transfer_conditions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Tout le monde peut lire les conditions de transfert"
  ON transfer_conditions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les conditions de transfert"
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

-- Insert initial conditions
INSERT INTO transfer_conditions (name, value, currency, description) VALUES
('MAX_AMOUNT_PER_TRANSFER', 500, 'EUR', 'Montant maximum autorisé par transfert'),
('MAX_AMOUNT_PER_YEAR', 5000, 'EUR', 'Montant maximum autorisé par année'),
('MAX_TRANSFERS_WITHOUT_ID', 10, 'COUNT', 'Nombre maximum de transferts avant vérification d''identité requise');