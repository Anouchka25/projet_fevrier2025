-- Désactiver RLS temporairement
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "transfers_unified_policy" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_unified_policy" ON beneficiaries;

-- Réactiver RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple pour les transferts
CREATE POLICY "allow_transfers_access"
ON transfers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Créer une politique simple pour les bénéficiaires
CREATE POLICY "allow_beneficiaries_access"
ON beneficiaries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- S'assurer que les admins ont les bons droits
UPDATE users
SET is_admin = true
WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com');