-- Ensure transfer conditions exist
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
  updated_at = CURRENT_TIMESTAMP
RETURNING *;