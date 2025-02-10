-- Add PayPal payment method for France -> Gabon transfers
INSERT INTO transfer_fees 
  (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
  -- France -> Gabon avec PayPal
  ('FR', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.065),
  ('FR', 'GA', 'PAYPAL', 'CASH', 0.045)
ON CONFLICT (from_country, to_country, payment_method, receiving_method) 
DO UPDATE SET 
  fee_percentage = EXCLUDED.fee_percentage,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the insertion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'FR' 
    AND to_country = 'GA'
    AND payment_method = 'PAYPAL'
  ) THEN
    RAISE EXCEPTION 'Failed to insert PayPal transfer fees';
  END IF;
END $$;