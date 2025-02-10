-- Clear existing data
TRUNCATE TABLE exchange_rates CASCADE;
TRUNCATE TABLE transfer_fees CASCADE;

-- Insert exchange rates with all possible combinations
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
-- EUR <-> XAF
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

-- Insert transfer fees with all possible combinations
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage) VALUES
-- Gabon -> Chine
('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
('GA', 'CN', 'CASH', 'ALIPAY', 0.075),

-- France -> Gabon
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004),

-- Gabon -> France
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04),

-- USA -> Gabon
('US', 'GA', 'CARD', 'AIRTEL_MONEY', 0.065),
('US', 'GA', 'CARD', 'CASH', 0.045),
('US', 'GA', 'ACH', 'AIRTEL_MONEY', 0.065),
('US', 'GA', 'ACH', 'CASH', 0.045),
('US', 'GA', 'APPLE_PAY', 'AIRTEL_MONEY', 0.065),
('US', 'GA', 'APPLE_PAY', 'CASH', 0.045),
('US', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.065),
('US', 'GA', 'PAYPAL', 'CASH', 0.045),

-- Gabon -> USA
('GA', 'US', 'AIRTEL_MONEY', 'ACH', 0.075),
('GA', 'US', 'AIRTEL_MONEY', 'VISA_DIRECT', 0.075),
('GA', 'US', 'AIRTEL_MONEY', 'MASTERCARD_SEND', 0.075),
('GA', 'US', 'CASH', 'ACH', 0.06),
('GA', 'US', 'CASH', 'VISA_DIRECT', 0.06),
('GA', 'US', 'CASH', 'MASTERCARD_SEND', 0.06),

-- Canada -> Gabon
('CA', 'GA', 'CARD', 'AIRTEL_MONEY', 0.065),
('CA', 'GA', 'CARD', 'CASH', 0.045),
('CA', 'GA', 'INTERAC', 'AIRTEL_MONEY', 0.065),
('CA', 'GA', 'INTERAC', 'CASH', 0.045),
('CA', 'GA', 'PAYPAL', 'AIRTEL_MONEY', 0.065),
('CA', 'GA', 'PAYPAL', 'CASH', 0.045),

-- Gabon -> Canada
('GA', 'CA', 'AIRTEL_MONEY', 'INTERAC', 0.075),
('GA', 'CA', 'AIRTEL_MONEY', 'VISA_DIRECT', 0.075),
('GA', 'CA', 'AIRTEL_MONEY', 'MASTERCARD_SEND', 0.075),
('GA', 'CA', 'CASH', 'INTERAC', 0.06),
('GA', 'CA', 'CASH', 'VISA_DIRECT', 0.06),
('GA', 'CA', 'CASH', 'MASTERCARD_SEND', 0.06);

-- Create indexes for better query performance
DROP INDEX IF EXISTS idx_exchange_rates_currencies;
DROP INDEX IF EXISTS idx_transfer_fees_lookup;

CREATE UNIQUE INDEX idx_exchange_rates_currencies 
ON exchange_rates(from_currency, to_currency);

CREATE UNIQUE INDEX idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);

-- Update timestamps
UPDATE exchange_rates SET updated_at = CURRENT_TIMESTAMP;
UPDATE transfer_fees SET updated_at = CURRENT_TIMESTAMP;