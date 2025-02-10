-- Ajouter Wero comme méthode de réception
INSERT INTO transfer_fees 
  (from_country, to_country, payment_method, receiving_method, fee_percentage)
VALUES 
  -- Gabon -> France avec Wero
  ('GA', 'FR', 'AIRTEL_MONEY', 'WERO', 0.05),
  ('GA', 'FR', 'CASH', 'WERO', 0.04)
ON CONFLICT (from_country, to_country, payment_method, receiving_method) 
DO UPDATE SET 
  fee_percentage = EXCLUDED.fee_percentage,
  updated_at = CURRENT_TIMESTAMP;

-- Mettre à jour l'index pour les performances
DROP INDEX IF EXISTS idx_transfer_fees_lookup;
CREATE UNIQUE INDEX idx_transfer_fees_lookup 
ON transfer_fees(from_country, to_country, payment_method, receiving_method);