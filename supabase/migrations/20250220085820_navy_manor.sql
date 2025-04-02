-- Add transfer fees for Moov Money with same rates as Airtel Money
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
-- France -> Gabon
('FR', 'GA', 'MOOV_MONEY', 'AIRTEL_MONEY', 0.01),
('FR', 'GA', 'MOOV_MONEY', 'CASH', 0.01),
('FR', 'GA', 'MOOV_MONEY', 'MOOV_MONEY', 0.01),

-- Gabon -> France
('GA', 'FR', 'MOOV_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'MOOV_MONEY', 'WERO', 0.050),
('GA', 'FR', 'MOOV_MONEY', 'PAYPAL', 0.052),

-- Gabon -> China
('GA', 'CN', 'MOOV_MONEY', 'ALIPAY', 0.085),

-- Gabon -> USA
('GA', 'US', 'MOOV_MONEY', 'ACH', 0.075),
('GA', 'US', 'MOOV_MONEY', 'VISA_DIRECT', 0.075),
('GA', 'US', 'MOOV_MONEY', 'MASTERCARD_SEND', 0.075),

-- Gabon -> Canada  
('GA', 'CA', 'MOOV_MONEY', 'INTERAC', 0.075),
('GA', 'CA', 'MOOV_MONEY', 'VISA_DIRECT', 0.075),
('GA', 'CA', 'MOOV_MONEY', 'MASTERCARD_SEND', 0.075)

ON CONFLICT (from_country, to_country, payment_method, receiving_method) 
DO UPDATE SET 
  fee_percentage = EXCLUDED.fee_percentage,
  updated_at = CURRENT_TIMESTAMP;

-- Add Moov Money as receiving method for existing payment methods
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES
-- France -> Gabon
('FR', 'GA', 'BANK_TRANSFER', 'MOOV_MONEY', 0.01),
('FR', 'GA', 'WERO', 'MOOV_MONEY', 0.01),
('FR', 'GA', 'CARD', 'MOOV_MONEY', 0.01),
('FR', 'GA', 'PAYPAL', 'MOOV_MONEY', 0.01)

ON CONFLICT (from_country, to_country, payment_method, receiving_method) 
DO UPDATE SET 
  fee_percentage = EXCLUDED.fee_percentage,
  updated_at = CURRENT_TIMESTAMP;

-- Verify that the fees were added correctly
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE payment_method = 'MOOV_MONEY'
    OR receiving_method = 'MOOV_MONEY'
  ) THEN
    RAISE EXCEPTION 'Moov Money transfer fees were not added correctly';
  END IF;
END $$;