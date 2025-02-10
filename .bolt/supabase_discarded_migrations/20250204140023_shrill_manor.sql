-- Clear existing data
TRUNCATE TABLE transfer_fees;

-- Insert transfer fees with all possible combinations
INSERT INTO transfer_fees 
  (from_country, to_country, payment_method, receiving_method, fee_percentage, updated_at)
VALUES 
  -- Gabon -> China
  ('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085, CURRENT_TIMESTAMP),
  ('GA', 'CN', 'CASH', 'ALIPAY', 0.075, CURRENT_TIMESTAMP),
  
  -- France -> Gabon
  ('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005, CURRENT_TIMESTAMP),
  ('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004, CURRENT_TIMESTAMP),
  
  -- Gabon -> France
  ('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055, CURRENT_TIMESTAMP),
  ('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04, CURRENT_TIMESTAMP);

-- Create unique index for better query performance
DROP INDEX IF EXISTS idx_transfer_fees_lookup;
CREATE UNIQUE INDEX idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);

-- Update timestamps
UPDATE transfer_fees SET updated_at = CURRENT_TIMESTAMP;