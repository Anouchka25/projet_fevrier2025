/*
  # Ajout des politiques administrateur

  1. Nouvelles politiques
    - Permettre aux administrateurs de voir tous les utilisateurs
    - Permettre aux administrateurs de voir tous les transferts
    - Permettre aux administrateurs de voir tous les bénéficiaires
    - Permettre aux administrateurs de mettre à jour les transferts

  2. Sécurité
    - Les politiques sont limitées aux utilisateurs ayant is_admin = true
*/

-- Politiques pour la table users
CREATE POLICY "Admins can view all users"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.is_admin = true
    )
  );

-- Politiques pour la table transfers
CREATE POLICY "Admins can view all transfers"
  ON transfers
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

CREATE POLICY "Admins can update transfers"
  ON transfers
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );

-- Politiques pour la table beneficiaries
CREATE POLICY "Admins can view all beneficiaries"
  ON beneficiaries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.is_admin = true
    )
  );