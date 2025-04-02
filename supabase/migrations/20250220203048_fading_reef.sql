-- Désactiver RLS
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "allow_all_transfers" ON transfers;
DROP POLICY IF EXISTS "allow_all_beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

-- Réactiver RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Créer des politiques simples qui permettent l'accès complet
CREATE POLICY "allow_all_access_transfers"
ON transfers
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_all_access_beneficiaries"
ON beneficiaries
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "allow_all_access_users"
ON users
FOR ALL
TO authenticated
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
  user_count integer;
BEGIN
  SELECT COUNT(*) INTO transfer_count FROM transfers;
  SELECT COUNT(*) INTO beneficiary_count FROM beneficiaries;
  SELECT COUNT(*) INTO user_count FROM users;
  
  RAISE NOTICE 'Nombre total de transferts: %', transfer_count;
  RAISE NOTICE 'Nombre total de bénéficiaires: %', beneficiary_count;
  RAISE NOTICE 'Nombre total d''utilisateurs: %', user_count;
  
  IF transfer_count = 0 THEN
    RAISE WARNING 'Aucun transfert trouvé dans la base de données';
  END IF;
END $$;