-- Mettre à jour le taux de change EUR/XAF
UPDATE exchange_rates
SET 
  rate = 655.96,
  updated_at = CURRENT_TIMESTAMP
WHERE from_currency = 'EUR' 
AND to_currency = 'XAF';

-- Mettre à jour le taux inverse XAF/EUR
UPDATE exchange_rates
SET 
  rate = 0.001524,  -- 1/655.96
  updated_at = CURRENT_TIMESTAMP
WHERE from_currency = 'XAF' 
AND to_currency = 'EUR';

-- Vérifier que les taux ont été mis à jour correctement
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM exchange_rates 
    WHERE from_currency = 'EUR' 
    AND to_currency = 'XAF'
    AND rate = 655.96
  ) THEN
    RAISE EXCEPTION 'Le taux de change EUR/XAF n''a pas été mis à jour correctement';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM exchange_rates 
    WHERE from_currency = 'XAF' 
    AND to_currency = 'EUR'
    AND rate = 0.001524
  ) THEN
    RAISE EXCEPTION 'Le taux de change XAF/EUR n''a pas été mis à jour correctement';
  END IF;
END $$;