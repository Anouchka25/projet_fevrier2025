-- Désactiver RLS temporairement
ALTER TABLE transfers DISABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries DISABLE ROW LEVEL SECURITY;

-- Supprimer TOUTES les politiques existantes
DO $$ 
BEGIN
  -- Supprimer les politiques de la table transfers
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON transfers;', E'\n')
    FROM pg_policies 
    WHERE tablename = 'transfers'
  );
  
  -- Supprimer les politiques de la table beneficiaries
  EXECUTE (
    SELECT string_agg('DROP POLICY IF EXISTS ' || quote_ident(policyname) || ' ON beneficiaries;', E'\n')
    FROM pg_policies 
    WHERE tablename = 'beneficiaries'
  );
END $$;

-- Réactiver RLS
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;

-- Créer des politiques strictes pour les transferts
CREATE POLICY "transfers_select_policy_v4"
ON transfers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "transfers_insert_policy_v4"
ON transfers
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "transfers_admin_policy_v4"
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

-- Créer des politiques strictes pour les bénéficiaires
CREATE POLICY "beneficiaries_select_policy_v4"
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

CREATE POLICY "beneficiaries_insert_policy_v4"
ON beneficiaries
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  )
);

CREATE POLICY "beneficiaries_admin_policy_v4"
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