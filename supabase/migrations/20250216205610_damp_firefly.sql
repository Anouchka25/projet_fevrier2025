-- Ajouter la combinaison Airtel Money vers PayPal pour Gabon -> France
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
('GA', 'FR', 'AIRTEL_MONEY', 'PAYPAL', 0.052)  -- 5.2%
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
    AND receiving_method = 'PAYPAL'
    AND fee_percentage = 0.052
  ) THEN
    RAISE EXCEPTION 'Les frais de transfert Airtel Money -> PayPal n''ont pas été ajoutés correctement';
  END IF;
END $$;