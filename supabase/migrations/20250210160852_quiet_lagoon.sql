-- Drop unique constraint on code
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS promo_codes_code_key;

-- Ensure unique constraint on code + direction combination
ALTER TABLE promo_codes DROP CONSTRAINT IF EXISTS unique_code_direction;
ALTER TABLE promo_codes ADD CONSTRAINT unique_code_direction UNIQUE (code, direction);

-- Update validate_promo_code function to handle multiple codes
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
  WHERE code = code_text
    AND direction = transfer_direction
    AND active = true
  LIMIT 1;

  -- If no promo code found for this direction
  IF promo_record IS NULL THEN
    -- Check if code exists for other directions
    IF EXISTS (
      SELECT 1 
      FROM promo_codes 
      WHERE code = code_text 
      AND active = true
      AND current_timestamp BETWEEN start_date AND end_date
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

  -- Check if promo code has started
  IF current_timestamp < promo_record.start_date THEN
    RETURN QUERY SELECT 
      false,
      'Code promo pas encore actif'::text,
      null::text,
      null::numeric;
    RETURN;
  END IF;

  -- Check if promo code has expired
  IF current_timestamp > promo_record.end_date THEN
    RETURN QUERY SELECT 
      false,
      'Code promo expiré'::text,
      null::text,
      null::numeric;
    RETURN;
  END IF;

  -- Check if promo code has reached max uses
  IF promo_record.max_uses IS NOT NULL AND promo_record.current_uses >= promo_record.max_uses THEN
    RETURN QUERY SELECT 
      false,
      'Code promo épuisé'::text,
      null::text,
      null::numeric;
    RETURN;
  END IF;

  -- If we get here, the promo code is valid
  RETURN QUERY SELECT 
    true,
    'Code promo valide'::text,
    promo_record.discount_type,
    promo_record.discount_value;
END;
$$;

-- Insert additional promo codes for testing
INSERT INTO promo_codes (
  code,
  direction,
  discount_type,
  discount_value,
  start_date,
  end_date,
  max_uses,
  current_uses,
  active
) VALUES 
-- Code WELCOME pour France -> Gabon
(
  'WELCOME',
  'FRANCE_TO_GABON',
  'PERCENTAGE',
  25,
  '2024-02-09 00:00:00+00',
  '2024-12-31 23:59:59+00',
  1000,
  0,
  true
),
-- Code WELCOME pour Gabon -> France
(
  'WELCOME',
  'GABON_TO_FRANCE',
  'PERCENTAGE',
  25,
  '2024-02-09 00:00:00+00',
  '2024-12-31 23:59:59+00',
  1000,
  0,
  true
)
ON CONFLICT (code, direction) DO UPDATE SET
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  max_uses = EXCLUDED.max_uses,
  active = EXCLUDED.active;