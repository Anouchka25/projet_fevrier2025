-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "users_access_policy" ON users;
DROP POLICY IF EXISTS "transfers_access_policy" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_access_policy" ON beneficiaries;

-- Politique simplifiée pour les taux de change
DROP POLICY IF EXISTS "Tout le monde peut lire les taux de change" ON exchange_rates;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les taux de change" ON exchange_rates;

CREATE POLICY "exchange_rates_read_policy"
ON exchange_rates FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "exchange_rates_write_policy"
ON exchange_rates FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.email = 'kundapay@gmail.com'
  )
);

-- Politique simplifiée pour les frais de transfert
DROP POLICY IF EXISTS "Tout le monde peut lire les frais de transfert" ON transfer_fees;
DROP POLICY IF EXISTS "Seuls les admins peuvent modifier les frais de transfert" ON transfer_fees;

CREATE POLICY "transfer_fees_read_policy"
ON transfer_fees FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "transfer_fees_write_policy"
ON transfer_fees FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.email = 'kundapay@gmail.com'
  )
);

-- Politique simplifiée pour les utilisateurs
CREATE POLICY "users_read_policy"
ON users FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_write_policy"
ON users FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_policy"
ON users FOR UPDATE
TO authenticated
USING (
  auth.uid() = id OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.email = 'kundapay@gmail.com'
  )
);

-- Politique simplifiée pour les transferts
CREATE POLICY "transfers_read_policy"
ON transfers FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.email = 'kundapay@gmail.com'
  )
);

CREATE POLICY "transfers_write_policy"
ON transfers FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "transfers_update_policy"
ON transfers FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.email = 'kundapay@gmail.com'
  )
);

-- Politique simplifiée pour les bénéficiaires
CREATE POLICY "beneficiaries_read_policy"
ON beneficiaries FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  ) OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.email = 'kundapay@gmail.com'
  )
);

CREATE POLICY "beneficiaries_write_policy"
ON beneficiaries FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  )
);

-- Définir l'administrateur
UPDATE users
SET is_admin = true
WHERE email = 'kundapay@gmail.com';