-- Add onesignal_id column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS onesignal_id text;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_onesignal_id ON users(onesignal_id);

-- Add comment for documentation
COMMENT ON COLUMN users.onesignal_id IS 'OneSignal user ID for notifications';