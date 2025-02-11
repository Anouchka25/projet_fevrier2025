-- Update validate_promo_code function to be case-insensitive
CREATE OR REPLACE FUNCTION validate_promo_code(
  code_text text,
  transfer_direction text
) RETURNS TABLE (
  valid boolean,
  message text,
  discount_type text,
  discount_value numeric
) LANGUAGE plpgsql AS $$
BEGIN
  -- Return results directly from a SELECT query
  RETURN QUERY
  WITH promo AS (
    SELECT *
    FROM promo_codes
    WHERE UPPER(code) = UPPER(code_text)
      AND direction = transfer_direction
      AND active = true
      AND current_timestamp BETWEEN start_date AND end_date
      AND (max_uses IS NULL OR current_uses < max_uses)
    LIMIT 1
  )
  SELECT
    CASE WHEN EXISTS (SELECT 1 FROM promo) THEN true ELSE false END,
    CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM promo_codes 
        WHERE UPPER(code) = UPPER(code_text)
      ) THEN 'Code promo invalide'
      WHEN NOT EXISTS (
        SELECT 1 FROM promo_codes 
        WHERE UPPER(code) = UPPER(code_text)
        AND direction = transfer_direction
      ) THEN 'Code promo non valide pour cette direction'
      WHEN NOT EXISTS (
        SELECT 1 FROM promo_codes 
        WHERE UPPER(code) = UPPER(code_text)
        AND active = true
      ) THEN 'Code promo désactivé'
      WHEN NOT EXISTS (
        SELECT 1 FROM promo_codes 
        WHERE UPPER(code) = UPPER(code_text)
        AND current_timestamp BETWEEN start_date AND end_date
      ) THEN 'Code promo expiré'
      WHEN EXISTS (
        SELECT 1 FROM promo_codes 
        WHERE UPPER(code) = UPPER(code_text)
        AND max_uses IS NOT NULL 
        AND current_uses >= max_uses
      ) THEN 'Code promo épuisé'
      ELSE 'Code promo valide'
    END::text,
    (SELECT discount_type FROM promo),
    (SELECT discount_value FROM promo);
END;
$$;