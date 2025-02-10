-- Créer une fonction pour envoyer les emails
CREATE OR REPLACE FUNCTION notify_admin_new_transfer()
RETURNS TRIGGER AS $$
BEGIN
  -- Envoyer une notification à l'administrateur
  PERFORM net.http_post(
    'https://api.emailjs.com/api/v1.0/email/send',
    '{"service_id":"service_3x87tsg","template_id":"template_1lu86mp","user_id":"OkSsdAcVb0auKpjI-","template_params":{"to_email":"kundapay@gmail.com","to_name":"Admin KundaPay","transfer_reference":"' || NEW.reference || '","amount_sent":"' || NEW.amount_sent || ' ' || NEW.sender_currency || '","amount_received":"' || NEW.amount_received || ' ' || NEW.receiver_currency || '","date":"' || to_char(NEW.created_at, 'DD/MM/YYYY HH24:MI:SS') || '"}}',
    '{Content-Type: application/json}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_notify_admin_new_transfer ON transfers;
CREATE TRIGGER trigger_notify_admin_new_transfer
  AFTER INSERT ON transfers
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_new_transfer();