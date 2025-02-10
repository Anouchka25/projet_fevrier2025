-- Nettoyer les données existantes
TRUNCATE TABLE transfer_fees;

-- Insérer les frais de transfert
INSERT INTO transfer_fees 
  (from_country, to_country, payment_method, receiving_method, fee_percentage, updated_at)
VALUES 
  -- Gabon vers Chine
  ('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085, CURRENT_TIMESTAMP),
  ('GA', 'CN', 'CASH', 'ALIPAY', 0.075, CURRENT_TIMESTAMP),
  
  -- France vers Gabon
  ('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005, CURRENT_TIMESTAMP),
  ('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004, CURRENT_TIMESTAMP),
  
  -- Gabon vers France
  ('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055, CURRENT_TIMESTAMP),
  ('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04, CURRENT_TIMESTAMP);

-- Vérifier l'insertion des données
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'GA' 
    AND to_country = 'CN' 
    AND payment_method = 'AIRTEL_MONEY' 
    AND receiving_method = 'ALIPAY'
  ) THEN
    RAISE EXCEPTION 'Données de frais manquantes pour GA->CN AIRTEL_MONEY->ALIPAY';
  END IF;
END $$;

-- Optimiser les requêtes avec un index
DROP INDEX IF EXISTS idx_transfer_fees_lookup;
CREATE UNIQUE INDEX idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);