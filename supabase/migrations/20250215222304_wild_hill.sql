-- Insert new promo code for FR -> GA
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
) VALUES (
  'GABONAIS-DE-ROUEN',
  'FRANCE_TO_GABON',
  'PERCENTAGE',
  100,  -- 100% de réduction sur les frais
  CURRENT_TIMESTAMP,
  '2025-02-23 23:59:59+00',
  1000,
  0,
  true
);