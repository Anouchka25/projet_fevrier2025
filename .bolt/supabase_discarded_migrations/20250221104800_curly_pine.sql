-- Add terms acceptance columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS terms_accepted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

-- Add comment for documentation
COMMENT ON COLUMN users.terms_accepted IS 'Whether the user has accepted the terms and conditions';
COMMENT ON COLUMN users.terms_accepted_at IS 'When the user accepted the terms and conditions';

-- Create function to update terms acceptance timestamp
CREATE OR REPLACE FUNCTION update_terms_accepted_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.terms_accepted = true AND OLD.terms_accepted = false THEN
    NEW.terms_accepted_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS update_terms_accepted_at_trigger ON users;
CREATE TRIGGER update_terms_accepted_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_terms_accepted_at();