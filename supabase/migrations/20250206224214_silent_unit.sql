-- Clear existing data
TRUNCATE TABLE transfer_conditions;

-- Insert default transfer conditions
INSERT INTO transfer_conditions 
  (name, value, currency, description)
VALUES 
  (
    'MAX_AMOUNT_PER_TRANSFER',
    500,
    'EUR',
    'Montant maximum autorisé par transfert'
  )
ON CONFLICT (name) 
DO UPDATE SET 
  value = EXCLUDED.value,
  currency = EXCLUDED.currency,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;

-- Verify the insertion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_conditions 
    WHERE name = 'MAX_AMOUNT_PER_TRANSFER'
  ) THEN
    RAISE EXCEPTION 'Failed to insert transfer conditions';
  END IF;
END $$;