/*
  # Correction des frais de transfert
  
  Cette migration met à jour les frais de transfert pour toutes les combinaisons valides.
*/

-- Nettoyer les données existantes
TRUNCATE TABLE transfer_fees;

-- Insérer les frais de transfert
INSERT INTO transfer_fees 
  (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
  -- Gabon vers Chine
  ('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
  ('GA', 'CN', 'CASH', 'ALIPAY', 0.075),
  
  -- France vers Gabon
  ('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
  ('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004),
  
  -- Gabon vers France
  ('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
  ('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04);

-- Créer l'index pour les performances
CREATE INDEX IF NOT EXISTS idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);

-- Mettre à jour les timestamps
UPDATE transfer_fees 
SET updated_at = CURRENT_TIMESTAMP;