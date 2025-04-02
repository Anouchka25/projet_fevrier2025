-- Ensure admin users exist and have correct permissions
DO $$
BEGIN
  -- Try to insert kundapay@gmail.com if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'kundapay@gmail.com') THEN
    INSERT INTO users (email, first_name, last_name, country, is_admin)
    VALUES ('kundapay@gmail.com', 'Admin', 'KundaPay', 'FR', true);
  ELSE
    -- Update existing user to be admin
    UPDATE users 
    SET is_admin = true 
    WHERE email = 'kundapay@gmail.com';
  END IF;

  -- Try to insert minkoueobamea@gmail.com if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM users WHERE email = 'minkoueobamea@gmail.com') THEN
    INSERT INTO users (email, first_name, last_name, country, is_admin)
    VALUES ('minkoueobamea@gmail.com', 'Anouchka', 'MINKOUE OBAME', 'FR', true);
  ELSE
    -- Update existing user to be admin
    UPDATE users 
    SET is_admin = true 
    WHERE email = 'minkoueobamea@gmail.com';
  END IF;

  -- Verify admin status is set correctly
  IF NOT EXISTS (
    SELECT 1 FROM users 
    WHERE email IN ('kundapay@gmail.com', 'minkoueobamea@gmail.com')
    AND is_admin = true
  ) THEN
    RAISE EXCEPTION 'Failed to set admin status for required users';
  END IF;
END $$;