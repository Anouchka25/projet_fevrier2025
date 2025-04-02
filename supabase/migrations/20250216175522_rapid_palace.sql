-- Ajouter les frais de transfert manquants pour Gabon -> France
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
-- Gabon -> France
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.040),
('GA', 'FR', 'AIRTEL_MONEY', 'WERO', 0.050),
('GA', 'FR', 'CASH', 'WERO', 0.040)
ON CONFLICT (from_country, to_country, payment_method, receiving_method) 
DO UPDATE SET 
  fee_percentage = EXCLUDED.fee_percentage,
  updated_at = CURRENT_TIMESTAMP;

-- Vérifier que les frais ont été ajoutés
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'GA' 
    AND to_country = 'FR'
    AND payment_method = 'AIRTEL_MONEY'
    AND receiving_method = 'BANK_TRANSFER'
  ) THEN
    RAISE EXCEPTION 'Les frais de transfert Gabon -> France n''ont pas été ajoutés correctement';
  END IF;
END $$;