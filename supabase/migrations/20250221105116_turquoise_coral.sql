-- Add transfer terms acceptance to transfers table
ALTER TABLE transfers 
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- Add comment for documentation
COMMENT ON COLUMN transfers.terms_accepted IS 'Whether the user has accepted the terms for this transfer';
COMMENT ON COLUMN transfers.terms_accepted_at IS 'When the user accepted the terms for this transfer';