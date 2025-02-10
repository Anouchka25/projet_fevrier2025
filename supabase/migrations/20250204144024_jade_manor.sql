-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "exchange_rates_read_policy" ON exchange_rates;
DROP POLICY IF EXISTS "exchange_rates_write_policy" ON exchange_rates;
DROP POLICY IF EXISTS "transfer_fees_read_policy" ON transfer_fees;
DROP POLICY IF EXISTS "transfer_fees_write_policy" ON transfer_fees;

-- Créer une politique pour permettre la lecture publique des taux de change
CREATE POLICY "Allow public read access for exchange rates"
ON exchange_rates
FOR SELECT
TO anon, authenticated
USING (true);

-- Créer une politique pour permettre la lecture publique des frais de transfert
CREATE POLICY "Allow public read access for transfer fees"
ON transfer_fees
FOR SELECT
TO anon, authenticated
USING (true);

-- Créer une politique pour permettre la modification des taux de change par les admins
CREATE POLICY "Allow admin write access for exchange rates"
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

-- Créer une politique pour permettre la modification des frais de transfert par les admins
CREATE POLICY "Allow admin write access for transfer fees"
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