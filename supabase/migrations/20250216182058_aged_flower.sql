-- Clear existing data
TRUNCATE TABLE transfer_fees CASCADE;

-- Insert ALL possible transfer fee combinations
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
('GA', 'CN', 'CASH', 'ALIPAY', 0.075),

-- USA -> Gabon
('US', 'GA', 'CARD', 'AIRTEL_MONEY', 0.065),
('US', 'GA', 'CARD', 'CASH', 0.045),
('US', 'GA', 'ACH', 'AIRTEL_MONEY', 0.065),
('US', 'GA', 'ACH', 'CASH', 0.045),
('US', 'GA', 'APPLE_PAY', 'AIRTEL_MONEY', 0.065),
('US', 'GA', 'APPLE_PAY', 'CASH', 0.045),
('US', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.065),
('US', 'GA', 'PAYPAL', 'CASH', 0.045),

-- Gabon -> USA
('GA', 'US', 'AIRTEL_MONEY', 'ACH', 0.075),
('GA', 'US', 'AIRTEL_MONEY', 'VISA_DIRECT', 0.075),
('GA', 'US', 'AIRTEL_MONEY', 'MASTERCARD_SEND', 0.075),
('GA', 'US', 'CASH', 'ACH', 0.06),
('GA', 'US', 'CASH', 'VISA_DIRECT', 0.06),
('GA', 'US', 'CASH', 'MASTERCARD_SEND', 0.06),

-- Canada -> Gabon
('CA', 'GA', 'CARD', 'AIRTEL_MONEY', 0.065),
('CA', 'GA', 'CARD', 'CASH', 0.045),
('CA', 'GA', 'INTERAC', 'AIRTEL_MONEY', 0.065),
('CA', 'GA', 'INTERAC', 'CASH', 0.045),
('CA', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.065),
('CA', 'GA', 'PAYPAL', 'CASH', 0.045),

-- Gabon -> Canada
('GA', 'CA', 'AIRTEL_MONEY', 'INTERAC', 0.075),
('GA', 'CA', 'AIRTEL_MONEY', 'VISA_DIRECT', 0.075),
('GA', 'CA', 'AIRTEL_MONEY', 'MASTERCARD_SEND', 0.075),
('GA', 'CA', 'CASH', 'INTERAC', 0.06),
('GA', 'CA', 'CASH', 'VISA_DIRECT', 0.06),
('GA', 'CA', 'CASH', 'MASTERCARD_SEND', 0.06);

-- Verify that all necessary combinations exist
DO $$
BEGIN
  -- Check France -> Gabon
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'FR' 
    AND to_country = 'GA'
  ) THEN
    RAISE EXCEPTION 'Missing France -> Gabon transfer fees';
  END IF;

  -- Check Gabon -> France
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'GA' 
    AND to_country = 'FR'
  ) THEN
    RAISE EXCEPTION 'Missing Gabon -> France transfer fees';
  END IF;

  -- Check Gabon -> China
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'GA' 
    AND to_country = 'CN'
  ) THEN
    RAISE EXCEPTION 'Missing Gabon -> China transfer fees';
  END IF;
END $$;