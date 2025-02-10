/*
  # Ajout des tables pour les frais et taux de change

  1. Nouvelles Tables
    - `exchange_rates`
      - `id` (uuid, primary key)
      - `from_currency` (text)
      - `to_currency` (text)
      - `rate` (numeric)
      - `updated_at` (timestamp)
    
    - `transfer_fees`
      - `id` (uuid, primary key)
      - `from_country` (text)
      - `to_country` (text)
      - `payment_method` (text)
      - `receiving_method` (text)
      - `fee_percentage` (numeric)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for read access to all authenticated users
    - Add policies for write access to admin users only
*/

-- Table des taux de change
CREATE TABLE exchange_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency text NOT NULL,
  to_currency text NOT NULL,
  rate numeric NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Table des frais de transfert
CREATE TABLE transfer_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_country text NOT NULL,
  to_country text NOT NULL,
  payment_method text NOT NULL,
  receiving_method text NOT NULL,
  fee_percentage numeric NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(from_country, to_country, payment_method, receiving_method)
);

-- Enable RLS
ALTER TABLE exchange_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_fees ENABLE ROW LEVEL SECURITY;

-- Policies pour les taux de change
CREATE POLICY "Tout le monde peut lire les taux de change"
  ON exchange_rates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les taux de change"
  ON exchange_rates
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

-- Policies pour les frais de transfert
CREATE POLICY "Tout le monde peut lire les frais de transfert"
  ON transfer_fees
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les frais de transfert"
  ON transfer_fees
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

-- Insertion des données initiales pour les taux de change
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
('EUR', 'XAF', 655.96),
('EUR', 'CNY', 7.5099),
('CNY', 'XAF', 87.34);

-- Insertion des données initiales pour les frais de transfert
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage) VALUES
-- Gabon vers Chine
('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
('GA', 'CN', 'CASH', 'ALIPAY', 0.075),
-- France vers Gabon
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004),
-- Gabon vers France
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04);