-- Créer la table des bénéficiaires si elle n'existe pas
CREATE TABLE IF NOT EXISTS beneficiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transfer_id uuid REFERENCES transfers(id) NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  payment_details jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Créer la table des transferts si elle n'existe pas
CREATE TABLE IF NOT EXISTS transfers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text UNIQUE NOT NULL,
  user_id uuid REFERENCES users(id) NOT NULL,
  amount_sent numeric NOT NULL,
  fees numeric NOT NULL,
  amount_received numeric NOT NULL,
  sender_currency text NOT NULL,
  receiver_currency text NOT NULL,
  payment_method text NOT NULL,
  receiving_method text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  funds_origin text DEFAULT 'Non spécifié',
  transfer_reason text DEFAULT 'Non spécifié',
  created_at timestamptz DEFAULT now(),
  validated_at timestamptz,
  validated_by uuid REFERENCES users(id),
  payment_id text,
  paid_at timestamptz,
  promo_code_id uuid REFERENCES promo_codes(id)
);

-- Enable RLS
ALTER TABLE beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view beneficiaries of own transfers" ON beneficiaries;
DROP POLICY IF EXISTS "Users can insert beneficiaries for own transfers" ON beneficiaries;
DROP POLICY IF EXISTS "Users can view own transfers" ON transfers;
DROP POLICY IF EXISTS "Users can insert own transfers" ON transfers;

-- Create policies for beneficiaries
CREATE POLICY "Users can view beneficiaries of own transfers"
  ON beneficiaries
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = beneficiaries.transfer_id
    AND transfers.user_id = auth.uid()
  ));

CREATE POLICY "Users can insert beneficiaries for own transfers"
  ON beneficiaries
  FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM transfers
    WHERE transfers.id = transfer_id
    AND transfers.user_id = auth.uid()
  ));

-- Create policies for transfers
CREATE POLICY "Users can view own transfers"
  ON transfers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transfers"
  ON transfers
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Mettre à jour la fonction de notification par email
CREATE OR REPLACE FUNCTION send_transfer_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer une notification
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
    NEW.amount_received || ' ' || NEW.receiver_currency || 
    ' (Origine des fonds : ' || COALESCE(NEW.funds_origin, 'Non spécifié') || 
    ', Raison : ' || COALESCE(NEW.transfer_reason, 'Non spécifié') || ')',
    'pending'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour les notifications
DROP TRIGGER IF EXISTS trigger_send_transfer_notification ON transfers;
CREATE TRIGGER trigger_send_transfer_notification
  AFTER INSERT ON transfers
  FOR EACH ROW
  EXECUTE FUNCTION send_transfer_notification();

-- Créer des index pour améliorer les performances
DROP INDEX IF EXISTS idx_transfers_user_id;
DROP INDEX IF EXISTS idx_transfers_reference;
DROP INDEX IF EXISTS idx_transfers_status;
DROP INDEX IF EXISTS idx_beneficiaries_transfer_id;
DROP INDEX IF EXISTS idx_beneficiaries_email;

CREATE INDEX idx_transfers_user_id ON transfers(user_id);
CREATE INDEX idx_transfers_reference ON transfers(reference);
CREATE INDEX idx_transfers_status ON transfers(status);
CREATE INDEX idx_beneficiaries_transfer_id ON beneficiaries(transfer_id);
CREATE INDEX idx_beneficiaries_email ON beneficiaries(email);