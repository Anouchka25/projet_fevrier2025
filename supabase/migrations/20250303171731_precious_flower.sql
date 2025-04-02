-- Add new promo codes for high-value transfers
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
-- WELCOME75: 75% discount for transfers >= 1000€
(
  'WELCOME75',
  'FRANCE_TO_GABON',
  'PERCENTAGE',
  75,
  CURRENT_TIMESTAMP,
  '2025-12-31 23:59:59+00',
  1000,
  0,
  true
),
-- WELCOME50: 50% discount for transfers >= 500€
(
  'WELCOME50',
  'FRANCE_TO_GABON',
  'PERCENTAGE',
  50,
  CURRENT_TIMESTAMP,
  '2025-12-31 23:59:59+00',
  1000,
  0,
  true
)
ON CONFLICT (code, direction) 
DO UPDATE SET 
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  max_uses = EXCLUDED.max_uses,
  active = EXCLUDED.active;

-- Verify the insertion
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM promo_codes 
    WHERE code IN ('WELCOME75', 'WELCOME50')
    AND direction = 'FRANCE_TO_GABON'
  ) THEN
    RAISE EXCEPTION 'Failed to insert promo codes';
  END IF;
END $$;