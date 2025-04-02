-- Désactiver RLS temporairement
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DROP POLICY IF EXISTS "transfers_select_policy_v4" ON transfers;
DROP POLICY IF EXISTS "transfers_insert_policy_v4" ON transfers;
DROP POLICY IF EXISTS "transfers_admin_policy_v4" ON transfers;
DROP POLICY IF EXISTS "beneficiaries_select_policy_v4" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiaries_insert_policy_v4" ON beneficiaries;
DROP POLICY IF EXISTS "beneficiaries_admin_policy_v4" ON beneficiaries;

-- Réactiver RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Créer une politique unique pour les transferts
CREATE POLICY "transfers_unified_policy"
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

-- Créer une politique unique pour les bénéficiaires
CREATE POLICY "beneficiaries_unified_policy"
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