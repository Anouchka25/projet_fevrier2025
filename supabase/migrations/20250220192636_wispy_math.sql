-- Supprimer toutes les politiques existantes
DROP POLICY IF EXISTS "transfers_access_policy" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_access_policy" ON beneficiaries;
DROP POLICY IF EXISTS "Users can view own transfers" ON transfers;
DROP POLICY IF EXISTS "Users can insert own transfers" ON transfers;
DROP POLICY IF EXISTS "Admins can view all transfers" ON transfers;
DROP POLICY IF EXISTS "Users can view beneficiaries of own transfers" ON beneficiaries;
DROP POLICY IF EXISTS "Users can insert beneficiaries for own transfers" ON beneficiaries;
DROP POLICY IF EXISTS "Admins can view all beneficiaries" ON beneficiaries;

-- Créer une politique simple pour les transferts
CREATE POLICY "transfers_access_policy"
ON transfers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Créer une politique simple pour les bénéficiaires
CREATE POLICY "beneficiaries_access_policy"
ON beneficiaries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- S'assurer que les admins ont les bons droits
UPDATE users
SET is_admin = true
WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com');

-- Vérifier l'état des tables
SELECT COUNT(*) as transfer_count FROM transfers;
SELECT COUNT(*) as beneficiary_count FROM beneficiaries;