-- Désactiver temporairement RLS
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes avec des noms spécifiques
DROP POLICY IF EXISTS "users_transfers_policy" ON transfers;
DROP POLICY IF EXISTS "admin_transfers_policy" ON transfers;
DROP POLICY IF EXISTS "users_beneficiaries_policy" ON beneficiaries;
DROP POLICY IF EXISTS "admin_beneficiaries_policy" ON beneficiaries;
DROP POLICY IF EXISTS "transfers_access_policy" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_access_policy" ON beneficiaries;

-- Réactiver RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Créer des politiques séparées pour les utilisateurs et les admins avec des noms uniques
CREATE POLICY "users_transfers_policy_v2"
ON transfers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "admin_transfers_policy_v2"
ON transfers
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

CREATE POLICY "users_beneficiaries_policy_v2"
ON beneficiaries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  )
);

CREATE POLICY "admin_beneficiaries_policy_v2"
ON beneficiaries
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
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