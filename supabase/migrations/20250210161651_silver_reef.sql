-- Drop existing table and related objects
DROP TABLE IF EXISTS promo_codes CASCADE;

-- Create promo_codes table with proper constraints
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
  -- Validate dates
  CONSTRAINT valid_dates CHECK (end_date > start_date),
  -- Validate uses
  CONSTRAINT valid_uses CHECK (max_uses IS NULL OR (max_uses > 0 AND current_uses <= max_uses)),
  -- Make code+direction unique together instead of just code
  UNIQUE (code, direction)
);

-- Add promo_code_id to transfers if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfers' AND column_name = 'promo_code_id'
  ) THEN
    ALTER TABLE transfers ADD COLUMN promo_code_id uuid REFERENCES promo_codes(id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Public can read active promo codes"
ON promo_codes FOR SELECT
TO public
USING (
  active = true AND
  current_timestamp BETWEEN start_date AND end_date AND
  (max_uses IS NULL OR current_uses < max_uses)
);

CREATE POLICY "Admins have full access"
ON promo_codes FOR ALL
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

-- Create validation function
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
  -- Get promo code for specific direction
  SELECT *
  INTO promo_record
  FROM promo_codes
  WHERE code = code_text
    AND direction = transfer_direction
    AND active = true
  LIMIT 1;

  -- Handle not found case
  IF promo_record IS NULL THEN
    -- Check if code exists for other directions
    IF EXISTS (
      SELECT 1 FROM promo_codes 
      WHERE code = code_text 
      AND active = true
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

  -- Code is valid
  RETURN QUERY SELECT 
    true,
    'Code promo valide'::text,
    promo_record.discount_type,
    promo_record.discount_value;
END;
$$;

-- Create usage tracking function
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

-- Create usage tracking trigger
DROP TRIGGER IF EXISTS increment_promo_code_usage_trigger ON transfers;
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
-- WELCOME: 25% discount for multiple directions
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
);