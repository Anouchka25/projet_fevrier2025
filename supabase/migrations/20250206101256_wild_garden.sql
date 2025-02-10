-- Drop existing notifications table if it exists
DROP TABLE IF EXISTS notifications;

-- Create notifications table with correct structure
CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  transfer_id uuid REFERENCES transfers(id),
  recipient_id uuid,
  message text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view notifications for their transfers"
ON notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = notifications.transfer_id
    AND transfers.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all notifications"
ON notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Create function to create notification on transfer
CREATE OR REPLACE FUNCTION create_transfer_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    type,
    transfer_id,
    message
  ) VALUES (
    'new_transfer',
    NEW.id,
    'Nouveau transfert ' || NEW.reference || ' créé'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_create_transfer_notification ON transfers;
CREATE TRIGGER trigger_create_transfer_notification
  AFTER INSERT ON transfers
  FOR EACH ROW
  EXECUTE FUNCTION create_transfer_notification();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_notifications_transfer_id ON notifications(transfer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);