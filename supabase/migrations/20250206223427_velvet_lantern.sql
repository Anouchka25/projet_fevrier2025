-- Clear existing data
TRUNCATE TABLE transfer_conditions;

-- Create unique index if it doesn't exist
DROP INDEX IF EXISTS idx_transfer_conditions_name;
CREATE UNIQUE INDEX idx_transfer_conditions_name 
ON transfer_conditions(name);

-- Insert default transfer conditions
INSERT INTO transfer_conditions 
  (name, value, currency, description)
SELECT
  'MAX_AMOUNT_PER_TRANSFER',
  500,
  'EUR',
  'Montant maximum autorisé par transfert'
WHERE NOT EXISTS (
  SELECT 1 FROM transfer_conditions 
  WHERE name = 'MAX_AMOUNT_PER_TRANSFER'
);

INSERT INTO transfer_conditions 
  (name, value, currency, description)
SELECT
  'MAX_AMOUNT_PER_YEAR',
  5000,
  'EUR',
  'Montant maximum autorisé par année'
WHERE NOT EXISTS (
  SELECT 1 FROM transfer_conditions 
  WHERE name = 'MAX_AMOUNT_PER_YEAR'
);

INSERT INTO transfer_conditions 
  (name, value, currency, description)
SELECT
  'MAX_TRANSFERS_WITHOUT_ID',
  10,
  'COUNT',
  'Nombre maximum de transferts avant vérification d''identité requise'
WHERE NOT EXISTS (
  SELECT 1 FROM transfer_conditions 
  WHERE name = 'MAX_TRANSFERS_WITHOUT_ID'
);

-- Update timestamps for all records
UPDATE transfer_conditions 
SET 
  created_at = CURRENT_TIMESTAMP,
  updated_at = CURRENT_TIMESTAMP;