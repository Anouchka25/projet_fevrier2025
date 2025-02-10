-- Ensure transfer conditions exist
INSERT INTO transfer_conditions 
  (name, value, currency, description)
VALUES 
  (
    'MAX_AMOUNT_PER_TRANSFER',
    500,
    'EUR',
    'Montant maximum autorisé par transfert'
  ),
  (
    'MAX_AMOUNT_PER_YEAR',
    5000,
    'EUR',
    'Montant maximum autorisé par année'
  ),
  (
    'MAX_TRANSFERS_WITHOUT_ID',
    10,
    'COUNT',
    'Nombre maximum de transferts avant vérification d''identité requise'
  )
ON CONFLICT (name) 
DO UPDATE SET 
  value = EXCLUDED.value,
  currency = EXCLUDED.currency,
  description = EXCLUDED.description,
  updated_at = CURRENT_TIMESTAMP;