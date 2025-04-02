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
  max_amount_xaf numeric := 327980; -- Exactly 500 EUR in XAF
  max_amount_eur numeric := 2000; -- 2000 EUR for transfers to Gabon
BEGIN
  -- For transfers from Gabon, validate against XAF limit
  IF direction LIKE 'GABON_TO_%' THEN
    RETURN QUERY SELECT 
      amount <= max_amount_xaf as valid,
      CASE 
        WHEN amount <= max_amount_xaf THEN 'Montant valide'
        ELSE 'Le montant maximum autorisé pour les transferts depuis le Gabon est de 327 980 XAF (500 EUR)'
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