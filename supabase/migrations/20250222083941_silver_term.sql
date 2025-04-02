-- Drop and recreate the validate_transfer_amount function with proper amount validation
CREATE OR REPLACE FUNCTION validate_transfer_amount(
  amount numeric,
  direction text
) RETURNS TABLE (
  valid boolean,
  message text,
  max_amount numeric
) LANGUAGE plpgsql AS $$
DECLARE
  max_amount_xaf numeric := 86586.72; -- Exactly 132 EUR in XAF (132 * 655.96)
  max_amount_eur numeric := 2000; -- 2000 EUR for transfers to Gabon
BEGIN
  -- For transfers from Gabon, validate against XAF limit
  IF direction LIKE 'GABON_TO_%' THEN
    RETURN QUERY SELECT 
      amount <= max_amount_xaf as valid,
      CASE 
        WHEN amount <= max_amount_xaf THEN 'Montant valide'
        ELSE 'Le montant maximum autorisé pour les transferts depuis le Gabon est de 86 587 XAF (132 EUR)'
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

-- Update transfer conditions with new limit
UPDATE transfer_conditions
SET 
  value = 132,
  updated_at = CURRENT_TIMESTAMP
WHERE name = 'MAX_AMOUNT_FROM_GABON';

-- Verify the update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM transfer_conditions 
    WHERE name = 'MAX_AMOUNT_FROM_GABON'
    AND value = 132
  ) THEN
    RAISE EXCEPTION 'Failed to update transfer limit to 132 EUR';
  END IF;
END $$;