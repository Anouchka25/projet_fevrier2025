-- Ensure admin users exist and have correct permissions
INSERT INTO users (email, first_name, last_name, country, is_admin)
VALUES 
  ('kundapay@gmail.com', 'Admin', 'KundaPay', 'FR', true),
  ('minkoueobamea@gmail.com', 'Anouchka', 'MINKOUE OBAME', 'FR', true)
ON CONFLICT (email) 
DO UPDATE SET 
  is_admin = true;

-- Ensure RLS policies allow admin access
DO $$
BEGIN
  -- Verify admin status is set correctly
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Failed to set admin status for required users';
  END IF;
END $$;