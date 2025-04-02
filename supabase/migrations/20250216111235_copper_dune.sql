-- Update all transfer fees from France to Gabon to 1%
UPDATE transfer_fees
SET 
  fee_percentage = 0.01, -- 1% (0.5% * 2)
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' 
AND to_country = 'GA';

-- Verify the update
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'FR' 
    AND to_country = 'GA'
    AND fee_percentage != 0.01
  ) THEN
    RAISE EXCEPTION 'Not all transfer fees were updated correctly';
  END IF;
END $$;