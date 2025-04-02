-- Update transfer fees for all directions
UPDATE transfer_fees
SET 
  fee_percentage = 
    CASE
      -- From France/Belgium/Germany to Gabon: 0.5%
      WHEN from_country IN ('FR', 'BE', 'DE') AND to_country = 'GA' THEN 0.005
      
      -- From Gabon to France/Belgium/Germany: 7%
      WHEN from_country = 'GA' AND to_country IN ('FR', 'BE', 'DE') THEN 0.07
      
      -- From Gabon to China: 8.5%
      WHEN from_country = 'GA' AND to_country = 'CN' THEN 0.085
      
      -- From Gabon to USA/Canada: 7.5%
      WHEN from_country = 'GA' AND to_country IN ('US', 'CA') THEN 0.075
      
      -- Keep other fees unchanged
      ELSE fee_percentage
    END,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the updates
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