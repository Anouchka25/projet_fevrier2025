-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "Users can view own transfers" ON transfers;
DROP POLICY IF EXISTS "Users can insert own transfers" ON transfers;
DROP POLICY IF EXISTS "Admins can view all transfers" ON transfers;
DROP POLICY IF EXISTS "Users can view beneficiaries of own transfers" ON beneficiaries;
DROP POLICY IF EXISTS "Users can insert beneficiaries for own transfers" ON beneficiaries;
DROP POLICY IF EXISTS "Admins can view all beneficiaries" ON beneficiaries;

-- Créer des politiques plus permissives pour les transferts
CREATE POLICY "transfers_access_policy"
ON transfers
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
  )
);

-- Créer des politiques plus permissives pour les bénéficiaires
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
        AND users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
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
        AND users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
      )
    )
  )
);

-- Vérifier que les admins ont les bons droits
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
  
  -- Vérifier les transferts accessibles par les admins
  SELECT COUNT(*) INTO transfer_count 
  FROM transfers 
  WHERE EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
  );
  
  RAISE NOTICE 'Transferts accessibles aux admins: %', transfer_count;
END $$;