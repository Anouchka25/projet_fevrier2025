-- Add address column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address jsonb;

-- Add comment for documentation
COMMENT ON COLUMN users.address IS 'User''s address stored as JSON with street, city, zipCode, and country';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_address ON users USING gin(address);