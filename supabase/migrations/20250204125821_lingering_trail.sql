-- Nettoyer les données existantes
TRUNCATE TABLE transfer_fees;

-- Insérer les frais de transfert avec toutes les combinaisons valides
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

-- Vérifier que toutes les données ont été insérées correctement
DO $$
DECLARE
  expected_count INTEGER := 6;
  actual_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO actual_count FROM transfer_fees;
  
  IF actual_count != expected_count THEN
    RAISE EXCEPTION 'Nombre incorrect de frais de transfert. Attendu: %, Actuel: %', expected_count, actual_count;
  END IF;
END $$;

-- Vérifier que les combinaisons spécifiques existent
DO $$
BEGIN
  -- Vérifier Gabon -> Chine avec Airtel Money -> Alipay
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'GA' 
    AND to_country = 'CN' 
    AND payment_method = 'AIRTEL_MONEY' 
    AND receiving_method = 'ALIPAY'
  ) THEN
    RAISE EXCEPTION 'Combinaison manquante: GA->CN AIRTEL_MONEY->ALIPAY';
  END IF;
  
  -- Vérifier les autres combinaisons critiques...
END $$;

-- Recréer l'index pour les performances
DROP INDEX IF EXISTS idx_transfer_fees_lookup;
CREATE INDEX idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);