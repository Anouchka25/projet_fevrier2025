-- Insérer le transfert manquant
WITH transfer_insert AS (
  INSERT INTO transfers (
    reference,
    user_id,
    amount_sent,
    fees,
    amount_received,
    sender_currency,
    receiver_currency,
    payment_method,
    receiving_method,
    status,
    funds_origin,
    transfer_reason,
    created_at
  )
  SELECT 
    'KPM7DJ3VEJ7OT7',
    users.id,
    20,
    0.2,
    12985,
    'EUR',
    'XAF',
    'WERO',
    'AIRTEL_MONEY',
    'completed',
    'Non spécifié',
    'Non spécifié',
    '2025-02-20 17:00:00+00'
  FROM users 
  WHERE email LIKE 'gemaine.obone%'
  RETURNING id
)
INSERT INTO beneficiaries (
  transfer_id,
  first_name,
  last_name,
  email,
  payment_details,
  created_at
)
SELECT 
  transfer_insert.id,
  'Joel',
  'Ekang',
  'joel.ekang@example.com',
  jsonb_build_object(
    'phone', '074000000'  -- Numéro fictif car non fourni dans l'email
  ),
  '2025-02-20 17:00:00+00'
FROM transfer_insert;

-- Vérifier que le transfert a été inséré
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfers 
    WHERE reference = 'KPM7DJ3VEJ7OT7'
  ) THEN
    RAISE EXCEPTION 'Le transfert n''a pas été inséré correctement';
  END IF;
END $$;