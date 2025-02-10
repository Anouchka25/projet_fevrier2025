-- Clear existing data
TRUNCATE TABLE transfer_conditions;

-- Create unique index if it doesn't exist
DROP INDEX IF EXISTS idx_transfer_conditions_name;
CREATE UNIQUE INDEX idx_transfer_conditions_name 
ON transfer_conditions(name);

-- Insert default transfer conditions
INSERT INTO transfer_conditions 
  (name, value, currency, description, created_at, updated_at)
VALUES 
  (
    'MAX_AMOUNT_PER_TRANSFER',
    500,
    'EUR',
    'Montant maximum autorisé par transfert',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );

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