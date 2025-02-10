-- Clear existing data
TRUNCATE TABLE exchange_rates CASCADE;
TRUNCATE TABLE transfer_fees CASCADE;

-- Insert exchange rates with correct currency codes
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
-- EUR <-> XAF
('EUR', 'XAF', 655.96),
('XAF', 'EUR', 0.001524),  -- 1/655.96
-- EUR <-> CNY
('EUR', 'CNY', 7.5099),
('CNY', 'EUR', 0.133157),  -- 1/7.5099
-- XAF <-> CNY
('XAF', 'CNY', 0.011445),  -- 7.5099/655.96
('CNY', 'XAF', 87.34);     -- 655.96/7.5099

-- Insert transfer fees with correct country codes
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage) VALUES
-- GA <-> CN (Gabon <-> China)
('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
('GA', 'CN', 'CASH', 'ALIPAY', 0.075),
('CN', 'GA', 'ALIPAY', 'AIRTEL_MONEY', 0.085),
('CN', 'GA', 'ALIPAY', 'CASH', 0.075),

-- FR <-> GA (France <-> Gabon)
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004),
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04),

-- FR <-> CN (France <-> China)
('FR', 'CN', 'BANK_TRANSFER', 'ALIPAY', 0.045),
('CN', 'FR', 'ALIPAY', 'BANK_TRANSFER', 0.045);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_exchange_rates_currencies ON exchange_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_transfer_fees_countries ON transfer_fees(from_country, to_country, payment_method, receiving_method);

-- Update timestamps
UPDATE exchange_rates SET updated_at = now();
UPDATE transfer_fees SET updated_at = now();