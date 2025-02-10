/*
  # Add transfer rates and fees data

  1. New Data
    - Exchange rates between EUR, XAF, and CNY
    - Transfer fees for all supported combinations
  2. Changes
    - Clear existing data to avoid duplicates
    - Insert new data with correct values
*/

-- Clear existing data
TRUNCATE TABLE exchange_rates;
TRUNCATE TABLE transfer_fees;

-- Insert exchange rates
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
('EUR', 'XAF', 655.96),
('XAF', 'EUR', 0.001524),  -- 1/655.96
('EUR', 'CNY', 7.5099),
('CNY', 'EUR', 0.133157),  -- 1/7.5099
('XAF', 'CNY', 0.011445),  -- 7.5099/655.96
('CNY', 'XAF', 87.34);     -- 655.96/7.5099

-- Insert transfer fees
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage) VALUES
-- Gabon vers Chine
('GA', 'CN', 'AIRTEL_MONEY', 'ALIPAY', 0.085),
('GA', 'CN', 'CASH', 'ALIPAY', 0.075),

-- France vers Gabon
('FR', 'GA', 'BANK_TRANSFER', 'AIRTEL_MONEY', 0.005),
('FR', 'GA', 'BANK_TRANSFER', 'CASH', 0.004),

-- Gabon vers France
('GA', 'FR', 'AIRTEL_MONEY', 'BANK_TRANSFER', 0.055),
('GA', 'FR', 'CASH', 'BANK_TRANSFER', 0.04);