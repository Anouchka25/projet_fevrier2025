-- Drop and recreate the validate_transfer_amount function with proper amount conversion
CREATE OR REPLACE FUNCTION validate_transfer_amount(
  amount numeric,
  direction text
) RETURNS TABLE (
  valid boolean,
  message text,
  max_amount numeric
) LANGUAGE plpgsql AS $$
DECLARE
  amount_in_eur numeric;
  max_amount numeric;
  max_amount_xaf numeric := 327980; -- Exactly 500 EUR in XAF
BEGIN
  -- Convert amount to EUR if needed based on direction
  IF direction LIKE 'GABON_TO_%' THEN
    -- Amount is in XAF, check against XAF limit directly
    RETURN QUERY SELECT 
      amount <= max_amount_xaf as valid,
      CASE 
        WHEN amount <= max_amount_xaf THEN 'Montant valide'
        ELSE 'Le montant maximum autorisé pour les transferts depuis le Gabon est de ' || max_amount_xaf || ' XAF (500 EUR)'
      END as message,
      max_amount_xaf;
  ELSE
    -- Amount is already in EUR for transfers to Gabon
    max_amount := 2000; -- 2000 EUR limit for transfers to Gabon
    
    RETURN QUERY SELECT 
      amount <= max_amount as valid,
      CASE 
        WHEN amount <= max_amount THEN 'Montant valide'
        ELSE 'Le montant maximum autorisé pour les transferts vers le Gabon est de ' || max_amount || ' EUR'
      END as message,
      max_amount;
  END IF;
END;
$$;