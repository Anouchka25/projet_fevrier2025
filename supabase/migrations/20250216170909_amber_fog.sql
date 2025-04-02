-- Clear existing exchange rates
TRUNCATE TABLE exchange_rates;

-- Insert exchange rates with exact values
INSERT INTO exchange_rates (from_currency, to_currency, rate) VALUES
-- EUR <-> XAF (fixed rate)
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

-- Verify that the rates exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM exchange_rates 
    WHERE from_currency = 'EUR' 
    AND to_currency = 'XAF'
    AND rate = 655.96
  ) THEN
    RAISE EXCEPTION 'Exchange rates not properly inserted';
  END IF;
END $$;