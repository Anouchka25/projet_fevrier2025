-- Vérifier si les tables sont vides
DO $$
DECLARE
  transfer_count integer;
  beneficiary_count integer;
BEGIN
  -- Compter les transferts
  SELECT COUNT(*) INTO transfer_count FROM transfers;
  
  -- Compter les bénéficiaires
  SELECT COUNT(*) INTO beneficiary_count FROM beneficiaries;
  
  -- Afficher les résultats
  RAISE NOTICE 'Nombre de transferts: %', transfer_count;
  RAISE NOTICE 'Nombre de bénéficiaires: %', beneficiary_count;
END $$;

-- Ajouter des politiques admin pour permettre la lecture complète
DROP POLICY IF EXISTS "Admins can view all transfers" ON transfers;
CREATE POLICY "Admins can view all transfers"
  ON transfers
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

DROP POLICY IF EXISTS "Admins can view all beneficiaries" ON beneficiaries;
CREATE POLICY "Admins can view all beneficiaries"
  ON beneficiaries
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

-- S'assurer que les admins sont correctement définis
UPDATE users
SET is_admin = true
WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com');