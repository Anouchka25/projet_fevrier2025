-- Add direction column to transfers table
ALTER TABLE transfers 
ADD COLUMN IF NOT EXISTS direction text;

-- Update existing transfers with direction based on currencies
UPDATE transfers
SET direction = 
  CASE 
    WHEN sender_currency = 'EUR' AND receiver_currency = 'XAF' THEN 'FRANCE_TO_GABON'
    WHEN sender_currency = 'XAF' AND receiver_currency = 'EUR' THEN 'GABON_TO_FRANCE'
    WHEN sender_currency = 'XAF' AND receiver_currency = 'CNY' THEN 'GABON_TO_CHINA'
    WHEN sender_currency = 'USD' AND receiver_currency = 'XAF' THEN 'USA_TO_GABON'
    WHEN sender_currency = 'XAF' AND receiver_currency = 'USD' THEN 'GABON_TO_USA'
    WHEN sender_currency = 'CAD' AND receiver_currency = 'XAF' THEN 'CANADA_TO_GABON'
    WHEN sender_currency = 'XAF' AND receiver_currency = 'CAD' THEN 'GABON_TO_CANADA'
  END
WHERE direction IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN transfers.direction IS 'Direction of the transfer (e.g., FRANCE_TO_GABON, GABON_TO_FRANCE, etc.)';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_transfers_direction ON transfers(direction);