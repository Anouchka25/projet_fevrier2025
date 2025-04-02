-- Clear existing transfer fees to ensure clean state
TRUNCATE TABLE transfer_fees;

-- Insert transfer fees with correct percentages
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
-- France/Belgium/Germany -> Gabon (0.5%)
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
('FR', 'GA', 'BANK_TRANSFER', 'MOOV_MONEY', 0.005),
('FR', 'GA', 'WERO', 'AIRTEL_MONEY', 0.005),
('FR', 'GA', 'WERO', 'MOOV_MONEY', 0.005),
('FR', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.005),
('FR', 'GA', 'PAYPAL', 'MOOV_MONEY', 0.005),

('BE', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
('BE', 'GA', 'BANK_TRANSFER', 'MOOV_MONEY', 0.005),
('BE', 'GA', 'WERO', 'AIRTEL_MONEY', 0.005),
('BE', 'GA', 'WERO', 'MOOV_MONEY', 0.005),
('BE', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.005),
('BE', 'GA', 'PAYPAL', 'MOOV_MONEY', 0.005),

('DE', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
('DE', 'GA', 'BANK_TRANSFER', 'MOOV_MONEY', 0.005),
('DE', 'GA', 'WERO', 'AIRTEL_MONEY', 0.005),
('DE', 'GA', 'WERO', 'MOOV_MONEY', 0.005),
('DE', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.005),
('DE', 'GA', 'PAYPAL', 'MOOV_MONEY', 0.005),

-- Gabon -> France/Belgium/Germany (7%)
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.07),
('GA', 'FR', 'AIRTEL_MONEY', 'WERO', 0.07),
('GA', 'FR', 'AIRTEL_MONEY', 'PAYPAL', 0.07),
('GA', 'FR', 'MOOV_MONEY', 'BANK_TRANSFER', 0.07),
('GA', 'FR', 'MOOV_MONEY', 'WERO', 0.07),
('GA', 'FR', 'MOOV_MONEY', 'PAYPAL', 0.07),

('GA', 'BE', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.07),
('GA', 'BE', 'AIRTEL_MONEY', 'WERO', 0.07),
('GA', 'BE', 'AIRTEL_MONEY', 'PAYPAL', 0.07),
('GA', 'BE', 'MOOV_MONEY', 'BANK_TRANSFER', 0.07),
('GA', 'BE', 'MOOV_MONEY', 'WERO', 0.07),
('GA', 'BE', 'MOOV_MONEY', 'PAYPAL', 0.07),

('GA', 'DE', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.07),
('GA', 'DE', 'AIRTEL_MONEY', 'WERO', 0.07),
('GA', 'DE', 'AIRTEL_MONEY', 'PAYPAL', 0.07),
('GA', 'DE', 'MOOV_MONEY', 'BANK_TRANSFER', 0.07),
('GA', 'DE', 'MOOV_MONEY', 'WERO', 0.07),
('GA', 'DE', 'MOOV_MONEY', 'PAYPAL', 0.07),

-- Gabon -> China (8.5%)
('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
('GA', 'CN', 'MOOV_MONEY', 'ALIPAY', 0.085),

-- USA -> Gabon (0.5%)
('US', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.005),
('US', 'GA', 'PAYPAL', 'MOOV_MONEY', 0.005),

-- Gabon -> USA (7.5%)
('GA', 'US', 'AIRTEL_MONEY', 'PAYPAL', 0.075),
('GA', 'US', 'MOOV_MONEY', 'PAYPAL', 0.075),

-- Canada -> Gabon (0.5%)
('CA', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.005),
('CA', 'GA', 'PAYPAL', 'MOOV_MONEY', 0.005),

-- Gabon -> Canada (7.5%)
('GA', 'CA', 'AIRTEL_MONEY', 'PAYPAL', 0.075),
('GA', 'CA', 'MOOV_MONEY', 'PAYPAL', 0.075);

-- Create index for better query performance
DROP INDEX IF EXISTS idx_transfer_fees_lookup;
CREATE UNIQUE INDEX idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);

-- Verify that the fees were added correctly
DO $$
DECLARE
  incorrect_fees RECORD;
BEGIN
  -- Check EU -> Gabon fees (should be 0.5%)
  SELECT * INTO incorrect_fees
  FROM transfer_fees
  WHERE from_country IN ('FR', 'BE', 'DE')
    AND to_country = 'GA'
    AND fee_percentage != 0.005
  LIMIT 1;
  
  IF FOUND THEN
    RAISE EXCEPTION 'Incorrect fee for % -> GA: %', incorrect_fees.from_country, incorrect_fees.fee_percentage;
  END IF;

  -- Check Gabon -> EU fees (should be 7%)
  SELECT * INTO incorrect_fees
  FROM transfer_fees
  WHERE from_country = 'GA'
    AND to_country IN ('FR', 'BE', 'DE')
    AND fee_percentage != 0.07
  LIMIT 1;
  
  IF FOUND THEN
    RAISE EXCEPTION 'Incorrect fee for GA -> %: %', incorrect_fees.to_country, incorrect_fees.fee_percentage;
  END IF;

  -- Check Gabon -> China fees (should be 8.5%)
  SELECT * INTO incorrect_fees
  FROM transfer_fees
  WHERE from_country = 'GA'
    AND to_country = 'CN'
    AND fee_percentage != 0.085
  LIMIT 1;
  
  IF FOUND THEN
    RAISE EXCEPTION 'Incorrect fee for GA -> CN: %', incorrect_fees.fee_percentage;
  END IF;

  -- Check Gabon -> USA/Canada fees (should be 7.5%)
  SELECT * INTO incorrect_fees
  FROM transfer_fees
  WHERE from_country = 'GA'
    AND to_country IN ('US', 'CA')
    AND fee_percentage != 0.075
  LIMIT 1;
  
  IF FOUND THEN
    RAISE EXCEPTION 'Incorrect fee for GA -> %: %', incorrect_fees.to_country, incorrect_fees.fee_percentage;
  END IF;
END $$;