-- Drop existing function
DROP FUNCTION IF EXISTS validate_transfer_amount;

-- Recreate function with updated limits
CREATE OR REPLACE FUNCTION validate_transfer_amount(
  amount numeric,
  direction text
) RETURNS TABLE (
  valid boolean,
  message text,
  max_amount numeric
) LANGUAGE plpgsql AS $$
DECLARE
  max_amount_xaf numeric := 196788; -- Exactly 300 EUR in XAF (300 * 655.96)
  max_amount_eur numeric := 2000; -- 2000 EUR for transfers to Gabon
BEGIN
  -- For transfers from Gabon, validate against XAF limit
  IF direction LIKE 'GABON_TO_%' THEN
    RETURN QUERY SELECT 
      amount <= max_amount_xaf as valid,
      CASE 
        WHEN amount <= max_amount_xaf THEN 'Montant valide'
        ELSE 'Le montant maximum autorisé pour les transferts depuis le Gabon est de 196 788 XAF (300 EUR)'
      END as message,
      max_amount_xaf;
  ELSE
    -- For transfers to Gabon, validate against EUR limit
    RETURN QUERY SELECT 
      amount <= max_amount_eur as valid,
      CASE 
        WHEN amount <= max_amount_eur THEN 'Montant valide'
        ELSE 'Le montant maximum autorisé pour les transferts vers le Gabon est de 2000 EUR'
      END as message,
      max_amount_eur;
  END IF;
END;
$$;

-- Clear existing transfer conditions
TRUNCATE TABLE transfer_conditions;

-- Insert updated conditions
INSERT INTO transfer_conditions 
  (name, value, currency, description)
VALUES 
  (
    'MAX_AMOUNT_FROM_GABON',
    300,
    'EUR',
    'Montant maximum autorisé pour les transferts depuis le Gabon'
  ),
  (
    'MAX_AMOUNT_TO_GABON',
    2000,
    'EUR',
    'Montant maximum autorisé pour les transferts vers le Gabon'
  );

-- Verify the conditions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_conditions 
    WHERE name = 'MAX_AMOUNT_FROM_GABON'
    AND value = 300
  ) THEN
    RAISE EXCEPTION 'Failed to update transfer limit to 300 EUR';
  END IF;
END $$;