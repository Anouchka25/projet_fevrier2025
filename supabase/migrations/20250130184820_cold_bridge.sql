-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "users_access" ON users;
DROP POLICY IF EXISTS "transfers_access" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_access" ON beneficiaries;

-- Politique simplifiée pour les utilisateurs
CREATE POLICY "users_access"
  ON users
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique simplifiée pour les transferts
CREATE POLICY "transfers_access"
  ON transfers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Politique simplifiée pour les bénéficiaires
CREATE POLICY "beneficiaries_access"
  ON beneficiaries
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Réinitialiser et définir l'administrateur
UPDATE users
SET is_admin = false
WHERE is_admin = true;

UPDATE users
SET is_admin = true
WHERE email = 'minkoueobamea@gmail.com';