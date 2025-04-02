/*
  # Add updated_at column and trigger
  
  1. Changes
    - Adds updated_at column to users table
    - Creates trigger to automatically update timestamp
    - Backfills existing rows
*/

-- Create trigger function
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users 
    ADD COLUMN updated_at timestamptz DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- Update existing rows to have updated_at equal to created_at
UPDATE users 
SET updated_at = created_at 
WHERE updated_at IS NULL;

-- Create trigger
DROP TRIGGER IF EXISTS users_updated_at_trigger ON users;
CREATE TRIGGER users_updated_at_trigger
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();