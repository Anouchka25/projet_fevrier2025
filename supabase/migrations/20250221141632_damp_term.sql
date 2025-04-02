-- Désactiver RLS temporairement
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "transfers_full_access" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_full_access" ON beneficiaries;
DROP POLICY IF EXISTS "users_full_access" ON users;

-- Réactiver RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Créer une politique simple pour les utilisateurs
CREATE POLICY "users_basic_access"
ON users
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "users_modify_own"
ON users
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Créer des politiques pour les transferts
CREATE POLICY "transfers_basic_access"
ON transfers
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
    AND users.id = auth.uid()
  )
);

CREATE POLICY "transfers_modify_own"
ON transfers
FOR ALL
TO authenticated
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
    AND users.id = auth.uid()
  )
)
WITH CHECK (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM users
    WHERE users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
    AND users.id = auth.uid()
  )
);

-- Créer des politiques pour les bénéficiaires
CREATE POLICY "beneficiaries_basic_access"
ON beneficiaries
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND (
      transfers.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
        AND users.id = auth.uid()
      )
    )
  )
);

CREATE POLICY "beneficiaries_modify_own"
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
        WHERE users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
        AND users.id = auth.uid()
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
        WHERE users.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
        AND users.id = auth.uid()
      )
    )
  )
);

-- S'assurer que les admins ont les bons droits
UPDATE users
SET is_admin = true
WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com');