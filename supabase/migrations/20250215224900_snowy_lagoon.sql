-- Double les frais de transfert de la France vers le Gabon
UPDATE transfer_fees
SET 
  fee_percentage = fee_percentage * 2,
  updated_at = CURRENT_TIMESTAMP
WHERE from_country = 'FR' 
AND to_country = 'GA';

-- Ajouter le code promo WELCOME50 avec 50% de réduction
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
  'WELCOME50',
  'FRANCE_TO_GABON',
  'PERCENTAGE',
  50,  -- 50% de réduction sur les frais
  CURRENT_TIMESTAMP,
  '2025-12-31 23:59:59+00',  -- Changé pour 2025 au lieu de 2024
  1000,
  0,
  true
);

-- Vérifier que les mises à jour ont été appliquées
DO $$
BEGIN
  -- Vérifier que les frais ont été doublés
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'FR' 
    AND to_country = 'GA'
    AND fee_percentage >= 0.04  -- Les frais doivent être au moins doublés
  ) THEN
    RAISE EXCEPTION 'La mise à jour des frais de transfert a échoué';
  END IF;

  -- Vérifier que le code promo a été créé
  IF NOT EXISTS (
    SELECT 1 FROM promo_codes 
    WHERE code = 'WELCOME50'
    AND direction = 'FRANCE_TO_GABON'
    AND discount_value = 50
  ) THEN
    RAISE EXCEPTION 'La création du code promo a échoué';
  END IF;
END $$;