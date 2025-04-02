-- Vérifier l'état des tables et des politiques
DO $$
DECLARE
  transfer_count integer;
  beneficiary_count integer;
  policy_count integer;
BEGIN
  -- Compter les transferts
  SELECT COUNT(*) INTO transfer_count FROM transfers;
  RAISE NOTICE 'Nombre de transferts: %', transfer_count;
  
  -- Compter les bénéficiaires
  SELECT COUNT(*) INTO beneficiary_count FROM beneficiaries;
  RAISE NOTICE 'Nombre de bénéficiaires: %', beneficiary_count;
  
  -- Vérifier les politiques
  SELECT COUNT(*) INTO policy_count 
  FROM pg_policies 
  WHERE tablename IN ('transfers', 'beneficiaries');
  RAISE NOTICE 'Nombre de politiques: %', policy_count;

  -- Vérifier les triggers
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_send_transfer_notification'
  ) THEN
    RAISE NOTICE 'Le trigger de notification est manquant!';
  END IF;

  -- Vérifier les index
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'transfers' AND indexname = 'idx_transfers_reference'
  ) THEN
    RAISE NOTICE 'L''index sur la référence des transferts est manquant!';
  END IF;
END $$;

-- Vérifier les permissions des admins
SELECT 
  u.email,
  u.is_admin,
  EXISTS (
    SELECT 1 FROM pg_roles r 
    WHERE r.rolname = u.email
  ) as has_role
FROM users u 
WHERE u.email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com');