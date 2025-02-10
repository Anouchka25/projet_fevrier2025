-- Nettoyer les données existantes
TRUNCATE TABLE transfer_conditions;

-- Insérer les conditions de transfert
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

-- Vérifier que les données ont été insérées
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_conditions 
    WHERE name = 'MAX_AMOUNT_PER_TRANSFER'
  ) THEN
    RAISE EXCEPTION 'Données des conditions de transfert non insérées correctement';
  END IF;
END $$;