-- Clear existing data
TRUNCATE TABLE transfer_fees;

-- Insert transfer fees with all possible combinations
INSERT INTO transfer_fees 
  (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
  -- Gabon -> Chine
  ('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
  ('GA', 'CN', 'CASH', 'ALIPAY', 0.075),
  
  -- France -> Gabon
  ('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
  ('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004),
  
  -- Gabon -> France
  ('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
  ('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04),
  ('GA', 'FR', 'AIRTEL_MONEY', 'WERO', 0.05),
  ('GA', 'FR', 'CASH', 'WERO', 0.04),

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

-- Create unique index for better query performance
DROP INDEX IF EXISTS idx_transfer_fees_lookup;
CREATE UNIQUE INDEX idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);

-- Update timestamps
UPDATE transfer_fees SET updated_at = CURRENT_TIMESTAMP;