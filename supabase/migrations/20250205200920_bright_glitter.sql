-- Create payment_intents table
CREATE TABLE payment_intents (
  id text PRIMARY KEY,
  user_id uuid REFERENCES users(id) NOT NULL,
  amount bigint NOT NULL,
  currency text NOT NULL,
  status text NOT NULL,
  transfer_reference text NOT NULL,
  recipient_id text NOT NULL,
  payment_method text NOT NULL,
  direction text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payment_intents ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own payment intents"
ON payment_intents
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payment intents"
ON payment_intents
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all payment intents"
ON payment_intents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Create indexes
CREATE INDEX idx_payment_intents_user_id ON payment_intents(user_id);
CREATE INDEX idx_payment_intents_transfer_reference ON payment_intents(transfer_reference);
CREATE INDEX idx_payment_intents_status ON payment_intents(status);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_payment_intent_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_payment_intent_timestamp
  BEFORE UPDATE ON payment_intents
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_intent_timestamp();