-- Add payment tracking columns to transfers table
ALTER TABLE transfers 
ADD COLUMN IF NOT EXISTS payment_id text,
ADD COLUMN IF NOT EXISTS paid_at timestamptz;

-- Add index for payment_id
CREATE INDEX IF NOT EXISTS idx_transfers_payment_id ON transfers(payment_id);

-- Add comment for documentation
COMMENT ON COLUMN transfers.payment_id IS 'Stripe payment intent ID';
COMMENT ON COLUMN transfers.paid_at IS 'Timestamp when payment was confirmed';