-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users and admins access" ON users;
DROP POLICY IF EXISTS "Transfers access" ON transfers;
DROP POLICY IF EXISTS "Beneficiaries access" ON beneficiaries;

-- Politique pour les utilisateurs
CREATE POLICY "Users basic access"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR 
    email = 'kundapay@gmail.com'
  );

CREATE POLICY "Users write access"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = auth.uid()
  );

CREATE POLICY "Admin users access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    email = 'kundapay@gmail.com'
  )
  WITH CHECK (
    email = 'kundapay@gmail.com'
  );

-- Politique pour les transferts
CREATE POLICY "Users transfers access"
  ON transfers
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email = 'kundapay@gmail.com'
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.email = 'kundapay@gmail.com'
    )
  );

-- Politique pour les bénéficiaires
CREATE POLICY "Users beneficiaries access"
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
          AND users.email = 'kundapay@gmail.com'
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
          AND users.email = 'kundapay@gmail.com'
        )
      )
    )
  );

-- Réinitialiser et définir l'administrateur
UPDATE users
SET is_admin = false
WHERE is_admin = true;

UPDATE users
SET is_admin = true
WHERE email = 'kundapay@gmail.com';