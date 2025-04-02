-- Mise à jour des frais de transfert
UPDATE transfer_fees
SET 
  fee_percentage = 0.022,
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' AND to_country = 'GA' AND payment_method = 'BANK_TRANSFER' AND receiving_method = 'AIRTEL_MONEY';

UPDATE transfer_fees
SET 
  fee_percentage = 0.020,
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' AND to_country = 'GA' AND payment_method = 'BANK_TRANSFER' AND receiving_method = 'CASH';

UPDATE transfer_fees
SET 
  fee_percentage = 0.020,
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' AND to_country = 'GA' AND payment_method = 'WERO' AND receiving_method = 'AIRTEL_MONEY';

UPDATE transfer_fees
SET 
  fee_percentage = 0.040,
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' AND to_country = 'GA' AND payment_method = 'WERO' AND receiving_method = 'CASH';

UPDATE transfer_fees
SET 
  fee_percentage = 0.020,
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' AND to_country = 'GA' AND payment_method = 'CARD' AND receiving_method = 'AIRTEL_MONEY';

UPDATE transfer_fees
SET 
  fee_percentage = 0.020,
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' AND to_country = 'GA' AND payment_method = 'CARD' AND receiving_method = 'CASH';

UPDATE transfer_fees
SET 
  fee_percentage = 0.035,
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' AND to_country = 'GA' AND payment_method = 'PAYPAL' AND receiving_method = 'AIRTEL_MONEY';

UPDATE transfer_fees
SET 
  fee_percentage = 0.020,
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' AND to_country = 'GA' AND payment_method = 'PAYPAL' AND receiving_method = 'CASH';

-- Vérifier que les mises à jour ont été appliquées
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'FR' 
    AND to_country = 'GA'
    AND fee_percentage IN (0.020, 0.022, 0.035, 0.040)
  ) THEN
    RAISE EXCEPTION 'La mise à jour des frais de transfert a échoué';
  END IF;
END $$;