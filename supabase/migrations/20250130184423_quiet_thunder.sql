-- Supprimer toutes les politiques existantes qui peuvent causer des conflits
DROP POLICY IF EXISTS "Users can read basic info" ON users;
DROP POLICY IF EXISTS "Admin transfer access" ON transfers;
DROP POLICY IF EXISTS "Admin beneficiary access" ON beneficiaries;

-- Politique simplifiée pour les utilisateurs
CREATE POLICY "Users and admins access"
  ON users
  FOR ALL
  TO authenticated
  USING (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.email = 'kundapay@gmail.com'
    )
  )
  WITH CHECK (
    id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.email = 'kundapay@gmail.com'
    )
  );

-- Politique simplifiée pour les transferts
CREATE POLICY "Transfers access"
  ON transfers
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.email = 'kundapay@gmail.com'
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() 
      AND u.email = 'kundapay@gmail.com'
    )
  );

-- Politique simplifiée pour les bénéficiaires
CREATE POLICY "Beneficiaries access"
  ON beneficiaries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transfers t
      WHERE t.id = transfer_id
      AND (
        t.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.email = 'kundapay@gmail.com'
        )
      )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transfers t
      WHERE t.id = transfer_id
      AND (
        t.user_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM users u 
          WHERE u.id = auth.uid() 
          AND u.email = 'kundapay@gmail.com'
        )
      )
    )
  );

-- S'assurer que l'administrateur est correctement défini
UPDATE users
SET is_admin = false
WHERE is_admin = true;

UPDATE users
SET is_admin = true
WHERE email = 'kundapay@gmail.com';