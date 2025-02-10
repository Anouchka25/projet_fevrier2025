-- Add missing inverse exchange rates if they don't exist
INSERT INTO exchange_rates (from_currency, to_currency, rate)
SELECT 
  to_currency,
  from_currency,
  1 / rate
FROM exchange_rates
WHERE NOT EXISTS (
  SELECT 1 
  FROM exchange_rates e2 
  WHERE e2.from_currency = exchange_rates.to_currency 
  AND e2.to_currency = exchange_rates.from_currency
)
ON CONFLICT (from_currency, to_currency) DO UPDATE
SET rate = EXCLUDED.rate,
    updated_at = now();

-- Ensure all transfer fees exist for both directions
INSERT INTO transfer_fees (from_country, to_country, payment_method, receiving_method, fee_percentage)
SELECT 
  to_country,
  from_country,
  receiving_method,
  payment_method,
  fee_percentage
FROM transfer_fees
WHERE NOT EXISTS (
  SELECT 1 
  FROM transfer_fees t2 
  WHERE t2.from_country = transfer_fees.to_country 
  AND t2.to_country = transfer_fees.from_country
  AND t2.payment_method = transfer_fees.receiving_method
  AND t2.receiving_method = transfer_fees.payment_method
)
ON CONFLICT (from_country, to_country, payment_method, receiving_method) DO UPDATE
SET fee_percentage = EXCLUDED.fee_percentage,
    updated_at = now();