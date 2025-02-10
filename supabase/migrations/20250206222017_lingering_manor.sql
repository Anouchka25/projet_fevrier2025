-- Clear existing data
TRUNCATE TABLE transfer_conditions;

-- Create unique index if it doesn't exist
CREATE UNIQUE INDEX IF NOT EXISTS idx_transfer_conditions_name 
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
  ),
  (
    'MAX_AMOUNT_PER_YEAR',
    5000,
    'EUR',
    'Montant maximum autorisé par année',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  ),
  (
    'MAX_TRANSFERS_WITHOUT_ID',
    10,
    'COUNT',
    'Nombre maximum de transferts avant vérification d''identité requise',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
  );