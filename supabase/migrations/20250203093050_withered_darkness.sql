-- Nettoyer les données existantes
TRUNCATE TABLE exchange_rates CASCADE;
TRUNCATE TABLE transfer_fees CASCADE;

-- Insérer les taux de change avec tous les sens possibles
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
-- EUR <-> XAF
('EUR', 'XAF', 655.96),
('XAF', 'EUR', 0.001524),
-- EUR <-> CNY
('EUR', 'CNY', 7.5099),
('CNY', 'EUR', 0.133157),
-- XAF <-> CNY
('XAF', 'CNY', 0.011445),
('CNY', 'XAF', 87.34);

-- Insérer les frais de transfert avec tous les sens possibles
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage) VALUES
-- Gabon <-> Chine
('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
('GA', 'CN', 'CASH', 'ALIPAY', 0.075),
('CN', 'GA', 'ALIPAY', 'AIRTEL_MONEY', 0.085),
('CN', 'GA', 'ALIPAY', 'CASH', 0.075),

-- France <-> Gabon
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004),
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04),

-- France <-> Chine
('FR', 'CN', 'BANK_TRANSFER', 'ALIPAY', 0.045),
('CN', 'FR', 'ALIPAY', 'BANK_TRANSFER', 0.045);

-- Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_transfer_fees_countries ON transfer_fees(from_country, to_country, payment_method, receiving_method);