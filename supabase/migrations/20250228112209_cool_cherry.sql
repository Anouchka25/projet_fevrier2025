-- Add onesignal_id column to users table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'onesignal_id'
  ) THEN
    ALTER TABLE users ADD COLUMN onesignal_id text;
    
    -- Add index for better query performance
    CREATE INDEX idx_users_onesignal_id ON users(onesignal_id);
    
    -- Add comment for documentation
    COMMENT ON COLUMN users.onesignal_id IS 'OneSignal user ID for notifications';
  END IF;
END $$;