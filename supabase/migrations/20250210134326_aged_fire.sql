/*
  # Ajout du système de codes promo

  1. Nouvelle table
    - `promo_codes`
      - `id` (uuid, primary key)
      - `code` (text, unique)
      - `direction` (text)
      - `discount_type` (text) - 'PERCENTAGE' ou 'FIXED'
      - `discount_value` (numeric)
      - `start_date` (timestamptz)
      - `end_date` (timestamptz)
      - `max_uses` (integer)
      - `current_uses` (integer)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Sécurité
    - Enable RLS
    - Policies pour lecture publique et gestion admin
*/

-- Create promo_codes table
CREATE TABLE promo_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
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
  CONSTRAINT valid_uses CHECK (max_uses IS NULL OR (max_uses > 0 AND current_uses <= max_uses))
);

-- Add column to transfers table to track promo code usage
ALTER TABLE transfers 
ADD COLUMN promo_code_id uuid REFERENCES promo_codes(id);

-- Enable RLS
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access for active promo codes"
ON promo_codes
FOR SELECT
TO public
USING (
  active = true AND
  current_timestamp BETWEEN start_date AND end_date AND
  (max_uses IS NULL OR current_uses < max_uses)
);

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
  RETURN QUERY
  SELECT 
    true as valid,
    'Code promo valide' as message,
    pc.discount_type,
    pc.discount_value
  FROM promo_codes pc
  WHERE pc.code = code_text
    AND pc.direction = transfer_direction
    AND pc.active = true
    AND current_timestamp BETWEEN pc.start_date AND pc.end_date
    AND (pc.max_uses IS NULL OR pc.current_uses < pc.max_uses)
  UNION ALL
  SELECT 
    false as valid,
    CASE
      WHEN NOT EXISTS (SELECT 1 FROM promo_codes WHERE code = code_text)
        THEN 'Code promo invalide'
      WHEN EXISTS (SELECT 1 FROM promo_codes WHERE code = code_text AND NOT active)
        THEN 'Code promo désactivé'
      WHEN EXISTS (SELECT 1 FROM promo_codes WHERE code = code_text AND current_timestamp < start_date)
        THEN 'Code promo pas encore actif'
      WHEN EXISTS (SELECT 1 FROM promo_codes WHERE code = code_text AND current_timestamp > end_date)
        THEN 'Code promo expiré'
      WHEN EXISTS (SELECT 1 FROM promo_codes WHERE code = code_text AND current_uses >= max_uses)
        THEN 'Code promo épuisé'
      ELSE 'Code promo invalide pour cette direction'
    END as message,
    null as discount_type,
    null as discount_value
  WHERE NOT EXISTS (
    SELECT 1
    FROM promo_codes pc
    WHERE pc.code = code_text
      AND pc.direction = transfer_direction
      AND pc.active = true
      AND current_timestamp BETWEEN pc.start_date AND pc.end_date
      AND (pc.max_uses IS NULL OR pc.current_uses < pc.max_uses)
  )
  LIMIT 1;
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

-- Create trigger to increment usage
CREATE TRIGGER increment_promo_code_usage_trigger
AFTER INSERT ON transfers
FOR EACH ROW
EXECUTE FUNCTION increment_promo_code_usage();

-- Insert example promo code
INSERT INTO promo_codes (
  code,
  direction,
  discount_type,
  discount_value,
  start_date,
  end_date,
  max_uses
) VALUES (
  'GABONAIS_ET_FIER',
  'FRANCE_TO_GABON',
  'PERCENTAGE',
  100, -- 100% de réduction sur les frais
  '2024-02-09 00:00:00+00',
  '2024-12-31 23:59:59+00',
  1000
);