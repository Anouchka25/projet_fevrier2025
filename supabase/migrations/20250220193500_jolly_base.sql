-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "transfers_access_policy" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_access_policy" ON beneficiaries;

-- Créer une politique pour les transferts qui permet aux admins de tout voir
CREATE POLICY "transfers_access_policy"
ON transfers
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Créer une politique pour les bénéficiaires qui permet aux admins de tout voir
CREATE POLICY "beneficiaries_access_policy"
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
        AND users.is_admin = true
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
        AND users.is_admin = true
      )
    )
  )
);

-- S'assurer que les admins ont les bons droits
UPDATE users
SET is_admin = true
WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com');

-- Vérifier l'état des tables
DO $$
DECLARE
  transfer_count integer;
  beneficiary_count integer;
BEGIN
  SELECT COUNT(*) INTO transfer_count FROM transfers;
  SELECT COUNT(*) INTO beneficiary_count FROM beneficiaries;
  
  RAISE NOTICE 'Nombre total de transferts: %', transfer_count;
  RAISE NOTICE 'Nombre total de bénéficiaires: %', beneficiary_count;
END $$;