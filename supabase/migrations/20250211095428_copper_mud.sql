-- Drop and recreate the validate_promo_code function with fixed column references
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
    SELECT p.* 
    FROM promo_codes p
    WHERE UPPER(p.code) = UPPER(code_text)
      AND p.direction = transfer_direction
      AND p.active = true
      AND current_timestamp BETWEEN p.start_date AND p.end_date
      AND (p.max_uses IS NULL OR p.current_uses < p.max_uses)
    LIMIT 1
  )
  SELECT
    CASE WHEN EXISTS (SELECT 1 FROM promo) THEN true ELSE false END,
    CASE
      WHEN NOT EXISTS (
        SELECT 1 FROM promo_codes p
        WHERE UPPER(p.code) = UPPER(code_text)
      ) THEN 'Code promo invalide'
      WHEN NOT EXISTS (
        SELECT 1 FROM promo_codes p
        WHERE UPPER(p.code) = UPPER(code_text)
        AND p.direction = transfer_direction
      ) THEN 'Code promo non valide pour cette direction'
      WHEN NOT EXISTS (
        SELECT 1 FROM promo_codes p
        WHERE UPPER(p.code) = UPPER(code_text)
        AND p.active = true
      ) THEN 'Code promo désactivé'
      WHEN NOT EXISTS (
        SELECT 1 FROM promo_codes p
        WHERE UPPER(p.code) = UPPER(code_text)
        AND current_timestamp BETWEEN p.start_date AND p.end_date
      ) THEN 'Code promo expiré'
      WHEN EXISTS (
        SELECT 1 FROM promo_codes p
        WHERE UPPER(p.code) = UPPER(code_text)
        AND p.max_uses IS NOT NULL 
        AND p.current_uses >= p.max_uses
      ) THEN 'Code promo épuisé'
      ELSE 'Code promo valide'
    END::text,
    (SELECT p.discount_type FROM promo p),
    (SELECT p.discount_value FROM promo p);
END;
$$;