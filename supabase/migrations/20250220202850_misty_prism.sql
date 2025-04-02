-- Désactiver RLS
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "transfers_access_policy_v3" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_access_policy_v3" ON beneficiaries;

-- Réactiver RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple pour les transferts
CREATE POLICY "allow_all_transfers"
ON transfers
FOR ALL
TO public
USING (true)
WITH CHECK (true);

-- Créer une politique simple pour les bénéficiaires
CREATE POLICY "allow_all_beneficiaries"
ON beneficiaries
FOR ALL
TO public
USING (true)
WITH CHECK (true);

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
  
  IF transfer_count = 0 THEN
    RAISE WARNING 'Aucun transfert trouvé dans la base de données';
  END IF;
END $$;