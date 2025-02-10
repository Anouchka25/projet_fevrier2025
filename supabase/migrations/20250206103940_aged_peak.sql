-- Drop existing policies
DROP POLICY IF EXISTS "Users can view notifications for their transfers" ON notifications;
DROP POLICY IF EXISTS "Admins can view all notifications" ON notifications;

-- Create comprehensive policies for notifications
CREATE POLICY "notifications_select_policy"
ON notifications
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = notifications.transfer_id
    AND (
      transfers.user_id = auth.uid() OR
      EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.is_admin = true
      )
    )
  )
);

CREATE POLICY "notifications_insert_policy"
ON notifications
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "notifications_update_policy"
ON notifications
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Modify the notification trigger to include more details
CREATE OR REPLACE FUNCTION create_transfer_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notifications (
    type,
    transfer_id,
    message,
    status
  ) VALUES (
    'new_transfer',
    NEW.id,
    'Nouveau transfert ' || NEW.reference || ' créé pour un montant de ' || 
    NEW.amount_sent || ' ' || NEW.sender_currency || ' vers ' || 
    NEW.amount_received || ' ' || NEW.receiver_currency,
    'pending'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;