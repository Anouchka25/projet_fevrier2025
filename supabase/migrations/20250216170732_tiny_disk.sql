-- Ensure transfer fees exist for all directions
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
-- France -> Gabon (tous à 1%)
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.01),
('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.01),
('FR', 'GA', 'WERO', 'AIRTEL_MONEY', 0.01),
('FR', 'GA', 'WERO', 'CASH', 0.01),
('FR', 'GA', 'CARD', 'AIRTEL_MONEY', 0.01),
('FR', 'GA', 'CARD', 'CASH', 0.01),
('FR', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.01),
('FR', 'GA', 'PAYPAL', 'CASH', 0.01),

-- Gabon -> France
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.040),
('GA', 'FR', 'AIRTEL_MONEY', 'WERO', 0.050),
('GA', 'FR', 'CASH', 'WERO', 0.040),

-- Gabon -> Chine
('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
('GA', 'CN', 'CASH', 'ALIPAY', 0.075)

ON CONFLICT (from_country, to_country, payment_method, receiving_method) 
DO UPDATE SET 
  fee_percentage = EXCLUDED.fee_percentage,
  updated_at = CURRENT_TIMESTAMP;

-- Verify that the fees exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'FR' 
    AND to_country = 'GA'
  ) THEN
    RAISE EXCEPTION 'Transfer fees not properly inserted';
  END IF;
END $$;