-- Drop and recreate promo_codes table with proper constraints
DROP TABLE IF EXISTS promo_codes CASCADE;

CREATE TABLE promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL,
  direction text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
  discount_value numeric NOT NULL CHECK (discount_value >= 0),
  start_date timestamptz NOT NULL,
  end_date timestamptz NOT NULL,
  max_uses integer,
  current_uses integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  CONSTRAINT valid_uses CHECK (max_uses IS NULL OR (max_uses > 0 AND current_uses <= max_uses)),
  CONSTRAINT unique_code_direction UNIQUE (code, direction)
);

-- Add column to transfers table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfers' AND column_name = 'promo_code_id'
  ) THEN
    ALTER TABLE transfers 
    ADD COLUMN promo_code_id uuid REFERENCES promo_codes(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access for active promo codes"
ON promo_codes
FOR SELECT
TO public
USING (true);

CREATE POLICY "Allow admin full access to promo codes"
ON promo_codes
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.is_admin = true
  )
);

-- Create function to validate and apply promo code
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

-- Create function to increment promo code usage
CREATE OR REPLACE FUNCTION increment_promo_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.promo_code_id IS NOT NULL THEN
    UPDATE promo_codes
    SET current_uses = current_uses + 1
    WHERE id = NEW.promo_code_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and recreate
DROP TRIGGER IF EXISTS increment_promo_code_usage_trigger ON transfers;

-- Create trigger
CREATE TRIGGER increment_promo_code_usage_trigger
AFTER INSERT ON transfers
FOR EACH ROW
EXECUTE FUNCTION increment_promo_code_usage();

-- Insert initial promo codes
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
-- Code WELCOME pour toutes les directions
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
),
(
  'WELCOME',
  'GABON_TO_CHINA',
  'PERCENTAGE',
  25,
  '2024-02-09 00:00:00+00',
  '2024-12-31 23:59:59+00',
  1000,
  0,
  true
),
(
  'WELCOME',
  'USA_TO_GABON',
  'PERCENTAGE',
  25,
  '2024-02-09 00:00:00+00',
  '2024-12-31 23:59:59+00',
  1000,
  0,
  true
),
(
  'WELCOME',
  'GABON_TO_USA',
  'PERCENTAGE',
  25,
  '2024-02-09 00:00:00+00',
  '2024-12-31 23:59:59+00',
  1000,
  0,
  true
),
(
  'WELCOME',
  'CANADA_TO_GABON',
  'PERCENTAGE',
  25,
  '2024-02-09 00:00:00+00',
  '2024-12-31 23:59:59+00',
  1000,
  0,
  true
),
(
  'WELCOME',
  'GABON_TO_CANADA',
  'PERCENTAGE',
  25,
  '2024-02-09 00:00:00+00',
  '2024-12-31 23:59:59+00',
  1000,
  0,
  true
);