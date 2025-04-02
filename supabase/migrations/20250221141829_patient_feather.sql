-- Désactiver RLS temporairement
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "users_basic_access" ON users;
DROP POLICY IF EXISTS "users_modify_own" ON users;
DROP POLICY IF EXISTS "transfers_basic_access" ON transfers;
DROP POLICY IF EXISTS "transfers_modify_own" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_basic_access" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiaries_modify_own" ON beneficiaries;

-- Réactiver RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple pour les utilisateurs
CREATE POLICY "users_access"
ON users
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Créer une politique simple pour les transferts
CREATE POLICY "transfers_access"
ON transfers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Créer une politique simple pour les bénéficiaires
CREATE POLICY "beneficiaries_access"
ON beneficiaries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- S'assurer que les admins ont les bons droits
UPDATE users
SET is_admin = true
WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com');