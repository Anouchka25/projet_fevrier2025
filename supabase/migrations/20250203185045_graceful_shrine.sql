-- Ensure transfer fees exist for all combinations
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005)
ON CONFLICT (from_country, to_country, payment_method, receiving_method) 
DO UPDATE SET fee_percentage = EXCLUDED.fee_percentage;

-- Create index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);