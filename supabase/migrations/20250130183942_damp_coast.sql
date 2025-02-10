/*
  # Mise à jour de l'email administrateur

  1. Modifications
    - Mise à jour de l'email administrateur vers kundapay@gmail.com
    - Nettoyage des anciens accès admin

  2. Sécurité
    - Maintien des politiques de sécurité existantes
*/

-- Révoquer les privilèges admin existants
UPDATE users
SET is_admin = false
WHERE is_admin = true;

-- Définir le nouvel administrateur
UPDATE users
SET is_admin = true
WHERE email = 'kundapay@gmail.com';