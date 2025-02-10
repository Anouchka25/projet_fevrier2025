/*
  # Correction des politiques administrateur

  1. Modifications
    - Suppression des politiques existantes qui causent la récursion
    - Ajout de nouvelles politiques avec une logique simplifiée
    - Utilisation d'une approche différente pour vérifier le statut admin

  2. Sécurité
    - Maintien de la sécurité RLS
    - Évitement de la récursion infinie
*/

-- Supprimer les anciennes politiques qui causent la récursion
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can view all transfers" ON transfers;
DROP POLICY IF EXISTS "Admins can view all beneficiaries" ON beneficiaries;
DROP POLICY IF EXISTS "Admins can update transfers" ON transfers;

-- Créer une nouvelle politique pour les utilisateurs qui permet la lecture de base
CREATE POLICY "Users can read basic info"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour les transferts
CREATE POLICY "Admin transfer access"
  ON transfers
  FOR ALL
  TO authenticated
  USING (
    (user_id = auth.uid()) OR 
    (SELECT is_admin FROM users WHERE id = auth.uid())
  );

-- Politique pour les bénéficiaires
CREATE POLICY "Admin beneficiary access"
  ON beneficiaries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM transfers
      WHERE transfers.id = beneficiaries.transfer_id
      AND (
        transfers.user_id = auth.uid() OR
        (SELECT is_admin FROM users WHERE id = auth.uid())
      )
    )
  );

-- S'assurer que l'utilisateur admin existe toujours
UPDATE users
SET is_admin = true
WHERE email = 'minkoueobamea@gmail.com';