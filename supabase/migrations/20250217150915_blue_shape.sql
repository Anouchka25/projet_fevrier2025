-- Drop existing transfer conditions
TRUNCATE TABLE transfer_conditions;

-- Insert new transfer conditions with direction-specific limits
INSERT INTO transfer_conditions 
  (name, value, currency, description)
VALUES 
  -- Limit for transfers FROM Gabon (500€)
  (
    'MAX_AMOUNT_FROM_GABON',
    500,
    'EUR',
    'Montant maximum autorisé pour les transferts depuis le Gabon'
  ),
  -- Limit for transfers TO Gabon (2000€)
  (
    'MAX_AMOUNT_TO_GABON',
    2000,
    'EUR',
    'Montant maximum autorisé pour les transferts vers le Gabon'
  );

-- Update the validate_transfer_amount function to check direction-specific limits
CREATE OR REPLACE FUNCTION validate_transfer_amount(
  amount numeric,
  direction text
) RETURNS TABLE (
  valid boolean,
  message text,
  max_amount numeric
) LANGUAGE plpgsql AS $$
BEGIN
  -- Get the appropriate limit based on direction
  IF direction LIKE 'GABON_TO_%' THEN
    -- Transfer FROM Gabon
    RETURN QUERY
    SELECT 
      amount <= value as valid,
      CASE 
        WHEN amount <= value THEN 'Montant valide'
        ELSE 'Le montant maximum autorisé pour les transferts depuis le Gabon est de ' || value || ' ' || currency
      END as message,
      value as max_amount
    FROM transfer_conditions
    WHERE name = 'MAX_AMOUNT_FROM_GABON';
  ELSE
    -- Transfer TO Gabon
    RETURN QUERY
    SELECT 
      amount <= value as valid,
      CASE 
        WHEN amount <= value THEN 'Montant valide'
        ELSE 'Le montant maximum autorisé pour les transferts vers le Gabon est de ' || value || ' ' || currency
      END as message,
      value as max_amount
    FROM transfer_conditions
    WHERE name = 'MAX_AMOUNT_TO_GABON';
  END IF;
END;
$$;