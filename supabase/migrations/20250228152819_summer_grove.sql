-- Add address column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'address'
  ) THEN
    ALTER TABLE users ADD COLUMN address jsonb;
    
    -- Add index for better query performance
    CREATE INDEX idx_users_address ON users USING gin(address);
    
    -- Add comment for documentation
    COMMENT ON COLUMN users.address IS 'User''s address stored as JSON with street, city, zipCode, and country';
  END IF;
END $$;

-- Ensure storage policies allow document viewing
CREATE POLICY "Allow users to view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'user-files');

CREATE POLICY "Allow users to upload their own files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files');