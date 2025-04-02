-- Mettre à jour le code promo GABONAIS-DE-ROUEN pour avoir 50% de réduction
UPDATE promo_codes
SET 
  discount_value = 50,  -- 50% de réduction sur les frais
  updated_at = CURRENT_TIMESTAMP
WHERE code = 'GABONAIS-DE-ROUEN'
AND direction = 'FRANCE_TO_GABON';

-- Vérifier que la mise à jour a été appliquée
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM promo_codes 
    WHERE code = 'GABONAIS-DE-ROUEN'
    AND direction = 'FRANCE_TO_GABON'
    AND discount_value = 50
  ) THEN
    RAISE EXCEPTION 'La mise à jour du code promo a échoué';
  END IF;
END $$;