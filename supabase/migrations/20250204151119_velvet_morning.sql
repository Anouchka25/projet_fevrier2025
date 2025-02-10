-- Activer l'extension http si elle n'est pas déjà activée
CREATE EXTENSION IF NOT EXISTS http;

-- Créer une table pour stocker les notifications
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid REFERENCES transfers(id),
  type text NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Créer une fonction pour envoyer les emails via Edge Functions
CREATE OR REPLACE FUNCTION notify_admin_new_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer une notification
  INSERT INTO notifications (transfer_id, type)
  VALUES (NEW.id, 'new_transfer');
  
  -- Appeler l'Edge Function pour envoyer l'email
  PERFORM
    net.http_post(
      url := current_setting('app.settings.webhook_url'),
      body := json_build_object(
        'type', 'new_transfer',
        'transfer', json_build_object(
          'id', NEW.id,
          'reference', NEW.reference,
          'amount_sent', NEW.amount_sent,
          'amount_received', NEW.amount_received,
          'sender_currency', NEW.sender_currency,
          'receiver_currency', NEW.receiver_currency,
          'created_at', NEW.created_at
        )
      )::text,
      headers := '{"Content-Type": "application/json"}'
    );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
DROP TRIGGER IF EXISTS trigger_notify_admin_new_transfer ON transfers;
CREATE TRIGGER trigger_notify_admin_new_transfer
  AFTER INSERT ON transfers
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_transfer();