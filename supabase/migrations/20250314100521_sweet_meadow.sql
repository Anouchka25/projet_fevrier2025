-- Clear existing transfer fees for BE/DE to ensure clean state
DELETE FROM transfer_fees 
WHERE from_country IN ('BE', 'DE') 
OR to_country IN ('BE', 'DE');

-- Add transfer fees for Belgium/Germany <-> Gabon
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
-- Belgium -> Gabon (same fees as France -> Gabon)
('BE', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.01),
('BE', 'GA', 'BANK_TRANSFER', 'CASH', 0.01),
('BE', 'GA', 'BANK_TRANSFER', 'MOOV_MONEY', 0.01),
('BE', 'GA', 'WERO', 'AIRTEL_MONEY', 0.01),
('BE', 'GA', 'WERO', 'CASH', 0.01),
('BE', 'GA', 'WERO', 'MOOV_MONEY', 0.01),
('BE', 'GA', 'CARD', 'AIRTEL_MONEY', 0.01),
('BE', 'GA', 'CARD', 'CASH', 0.01),
('BE', 'GA', 'CARD', 'MOOV_MONEY', 0.01),
('BE', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.01),
('BE', 'GA', 'PAYPAL', 'CASH', 0.01),
('BE', 'GA', 'PAYPAL', 'MOOV_MONEY', 0.01),

-- Gabon -> Belgium (same fees as Gabon -> France)
('GA', 'BE', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'BE', 'AIRTEL_MONEY', 'WERO', 0.050),
('GA', 'BE', 'AIRTEL_MONEY', 'PAYPAL', 0.052),
('GA', 'BE', 'MOOV_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'BE', 'MOOV_MONEY', 'WERO', 0.050),
('GA', 'BE', 'MOOV_MONEY', 'PAYPAL', 0.052),
('GA', 'BE', 'CASH', 'BANK_TRANSFER', 0.040),
('GA', 'BE', 'CASH', 'WERO', 0.040),

-- Germany -> Gabon (same fees as France -> Gabon)
('DE', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.01),
('DE', 'GA', 'BANK_TRANSFER', 'CASH', 0.01),
('DE', 'GA', 'BANK_TRANSFER', 'MOOV_MONEY', 0.01),
('DE', 'GA', 'WERO', 'AIRTEL_MONEY', 0.01),
('DE', 'GA', 'WERO', 'CASH', 0.01),
('DE', 'GA', 'WERO', 'MOOV_MONEY', 0.01),
('DE', 'GA', 'CARD', 'AIRTEL_MONEY', 0.01),
('DE', 'GA', 'CARD', 'CASH', 0.01),
('DE', 'GA', 'CARD', 'MOOV_MONEY', 0.01),
('DE', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.01),
('DE', 'GA', 'PAYPAL', 'CASH', 0.01),
('DE', 'GA', 'PAYPAL', 'MOOV_MONEY', 0.01),

-- Gabon -> Germany (same fees as Gabon -> France)
('GA', 'DE', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'DE', 'AIRTEL_MONEY', 'WERO', 0.050),
('GA', 'DE', 'AIRTEL_MONEY', 'PAYPAL', 0.052),
('GA', 'DE', 'MOOV_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'DE', 'MOOV_MONEY', 'WERO', 0.050),
('GA', 'DE', 'MOOV_MONEY', 'PAYPAL', 0.052),
('GA', 'DE', 'CASH', 'BANK_TRANSFER', 0.040),
('GA', 'DE', 'CASH', 'WERO', 0.040)

ON CONFLICT (from_country, to_country, payment_method, receiving_method) 
DO UPDATE SET 
  fee_percentage = EXCLUDED.fee_percentage,
  updated_at = CURRENT_TIMESTAMP;

-- Create index for better query performance
DROP INDEX IF EXISTS idx_transfer_fees_lookup;
CREATE UNIQUE INDEX idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);

-- Verify that the fees were added correctly
DO $$
BEGIN
  -- Check Belgium -> Gabon fees
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'BE' 
    AND to_country = 'GA'
  ) THEN
    RAISE EXCEPTION 'Missing Belgium -> Gabon transfer fees';
  END IF;

  -- Check Gabon -> Belgium fees
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'GA' 
    AND to_country = 'BE'
  ) THEN
    RAISE EXCEPTION 'Missing Gabon -> Belgium transfer fees';
  END IF;

  -- Check Germany -> Gabon fees
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'DE' 
    AND to_country = 'GA'
  ) THEN
    RAISE EXCEPTION 'Missing Germany -> Gabon transfer fees';
  END IF;

  -- Check Gabon -> Germany fees
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'GA' 
    AND to_country = 'DE'
  ) THEN
    RAISE EXCEPTION 'Missing Gabon -> Germany transfer fees';
  END IF;
END $$;