-- Désactiver temporairement RLS
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "users_transfers_policy" ON transfers;
DROP POLICY IF EXISTS "admin_transfers_policy" ON transfers;
DROP POLICY IF EXISTS "users_beneficiaries_policy" ON beneficiaries;
DROP POLICY IF EXISTS "admin_beneficiaries_policy" ON beneficiaries;
DROP POLICY IF EXISTS "transfers_access_policy" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_access_policy" ON beneficiaries;
DROP POLICY IF EXISTS "users_transfers_policy_v2" ON transfers;
DROP POLICY IF EXISTS "admin_transfers_policy_v2" ON transfers;
DROP POLICY IF EXISTS "users_beneficiaries_policy_v2" ON beneficiaries;
DROP POLICY IF EXISTS "admin_beneficiaries_policy_v2" ON beneficiaries;

-- Réactiver RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Créer une politique unique pour les transferts
CREATE POLICY "transfers_policy"
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
);

-- Créer une politique unique pour les bénéficiaires
CREATE POLICY "beneficiaries_policy"
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
  admin_transfer_count integer;
BEGIN
  -- Compter tous les transferts
  SELECT COUNT(*) INTO transfer_count FROM transfers;
  
  -- Compter tous les bénéficiaires
  SELECT COUNT(*) INTO beneficiary_count FROM beneficiaries;
  
  -- Compter les transferts visibles par les admins
  SELECT COUNT(*) INTO admin_transfer_count 
  FROM transfers
  WHERE EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  );
  
  RAISE NOTICE 'Nombre total de transferts: %', transfer_count;
  RAISE NOTICE 'Nombre total de bénéficiaires: %', beneficiary_count;
  RAISE NOTICE 'Transferts visibles par les admins: %', admin_transfer_count;
END $$;