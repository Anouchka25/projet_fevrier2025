-- Nettoyer les données existantes
TRUNCATE TABLE exchange_rates CASCADE;
TRUNCATE TABLE transfer_fees CASCADE;

-- Insérer les taux de change avec les valeurs exactes
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
-- EUR <-> XAF (taux fixe)
('EUR', 'XAF', 655.96),
('XAF', 'EUR', 0.001524),  -- 1/655.96

-- EUR <-> CNY
('EUR', 'CNY', 7.5099),
('CNY', 'EUR', 0.133157),  -- 1/7.5099

-- XAF <-> CNY
('XAF', 'CNY', 0.011445),  -- 7.5099/655.96
('CNY', 'XAF', 87.34),     -- 655.96/7.5099

-- USD <-> XAF
('USD', 'XAF', 610.35),
('XAF', 'USD', 0.001638),  -- 1/610.35

-- CAD <-> XAF
('CAD', 'XAF', 452.78),
('XAF', 'CAD', 0.002209),  -- 1/452.78

-- USD <-> EUR
('USD', 'EUR', 0.93),
('EUR', 'USD', 1.075269),  -- 1/0.93

-- CAD <-> EUR
('CAD', 'EUR', 0.69),
('EUR', 'CAD', 1.449275);  -- 1/0.69

-- Insérer les frais de transfert
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage) VALUES
-- France -> Gabon (tous à 1%)
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.01),
('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.01),
('FR', 'GA', 'WERO', 'AIRTEL_MONEY', 0.01),
('FR', 'GA', 'WERO', 'CASH', 0.01),
('FR', 'GA', 'CARD', 'AIRTEL_MONEY', 0.01),
('FR', 'GA', 'CARD', 'CASH', 0.01),
('FR', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.01),
('FR', 'GA', 'PAYPAL', 'CASH', 0.01),

-- Gabon -> France
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.040),
('GA', 'FR', 'AIRTEL_MONEY', 'WERO', 0.050),
('GA', 'FR', 'CASH', 'WERO', 0.040),

-- Gabon -> Chine
('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
('GA', 'CN', 'CASH', 'ALIPAY', 0.075);

-- Vérifier que les données ont été insérées correctement
DO $$
BEGIN
  -- Vérifier les taux de change
  IF NOT EXISTS (
    SELECT 1 FROM exchange_rates 
    WHERE from_currency = 'EUR' 
    AND to_currency = 'XAF'
    AND rate = 655.96
  ) THEN
    RAISE EXCEPTION 'Les taux de change n''ont pas été insérés correctement';
  END IF;

  -- Vérifier les frais de transfert
  IF NOT EXISTS (
    SELECT 1 FROM transfer_fees 
    WHERE from_country = 'FR' 
    AND to_country = 'GA'
    AND fee_percentage = 0.01
  ) THEN
    RAISE EXCEPTION 'Les frais de transfert n''ont pas été insérés correctement';
  END IF;
END $$;