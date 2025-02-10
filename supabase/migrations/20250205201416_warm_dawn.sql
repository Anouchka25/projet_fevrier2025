-- Drop the old trigger and function if they exist
DROP TRIGGER IF EXISTS trigger_notify_admin_new_transfer ON transfers;
DROP FUNCTION IF EXISTS notify_admin_new_transfer();

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  transfer_id uuid REFERENCES transfers(id),
  data jsonb,
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
    data
  ) VALUES (
    'new_transfer',
    NEW.id,
    jsonb_build_object(
      'reference', NEW.reference,
      'amount_sent', NEW.amount_sent,
      'amount_received', NEW.amount_received,
      'sender_currency', NEW.sender_currency,
      'receiver_currency', NEW.receiver_currency,
      'status', NEW.status
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER trigger_create_transfer_notification
  AFTER INSERT ON transfers
  FOR EACH ROW
  EXECUTE FUNCTION create_transfer_notification();

-- Create indexes
CREATE INDEX idx_notifications_transfer_id ON notifications(transfer_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_type ON notifications(type);