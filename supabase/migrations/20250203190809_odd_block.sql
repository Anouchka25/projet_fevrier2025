-- Ensure all necessary transfer fees exist
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
-- France -> Gabon
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004),

-- Gabon -> France
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04),

-- Gabon -> Chine
('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
('GA', 'CN', 'CASH', 'ALIPAY', 0.075)

ON CONFLICT (from_country, to_country, payment_method, receiving_method) 
DO UPDATE SET 
  fee_percentage = EXCLUDED.fee_percentage,
  updated_at = now();

-- Ensure index exists for better query performance
CREATE INDEX IF NOT EXISTS idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);