-- Drop and recreate the validate_promo_code function with improved validation
CREATE OR REPLACE FUNCTION validate_promo_code(
  code_text text,
  transfer_direction text
) RETURNS TABLE (
  valid boolean,
  message text,
  discount_type text,
  discount_value numeric
) LANGUAGE plpgsql AS $$
DECLARE
  promo_record RECORD;
BEGIN
  -- Get the promo code record for the specific direction
  SELECT *
  INTO promo_record
  FROM promo_codes
  WHERE UPPER(code) = UPPER(code_text)
    AND direction = transfer_direction
  LIMIT 1;

  -- Handle not found case
  IF promo_record IS NULL THEN
    -- Check if code exists for other directions
    IF EXISTS (
      SELECT 1 FROM promo_codes 
      WHERE UPPER(code) = UPPER(code_text)
    ) THEN
      RETURN QUERY SELECT 
        false,
        'Code promo non valide pour cette direction'::text,
        null::text,
        null::numeric;
    ELSE
      RETURN QUERY SELECT 
        false,
        'Code promo invalide'::text,
        null::text,
        null::numeric;
    END IF;
    RETURN;
  END IF;

  -- Check if promo code is active
  IF NOT promo_record.active THEN
    RETURN QUERY SELECT 
      false,
      'Code promo désactivé'::text,
      null::text,
      null::numeric;
    RETURN;
  END IF;

  -- Check validity period
  IF current_timestamp < promo_record.start_date THEN
    RETURN QUERY SELECT 
      false,
      'Code promo pas encore actif'::text,
      null::text,
      null::numeric;
    RETURN;
  END IF;

  IF current_timestamp > promo_record.end_date THEN
    RETURN QUERY SELECT 
      false,
      'Code promo expiré'::text,
      null::text,
      null::numeric;
    RETURN;
  END IF;

  -- Check usage limit
  IF promo_record.max_uses IS NOT NULL AND promo_record.current_uses >= promo_record.max_uses THEN
    RETURN QUERY SELECT 
      false,
      'Code promo épuisé'::text,
      null::text,
      null::numeric;
    RETURN;
  END IF;

  -- Code is valid, return discount information
  RETURN QUERY SELECT 
    true,
    'Code promo valide'::text,
    promo_record.discount_type,
    promo_record.discount_value;
END;
$$;