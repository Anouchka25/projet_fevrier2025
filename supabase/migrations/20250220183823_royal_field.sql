-- Créer une fonction pour synchroniser les utilisateurs
CREATE OR REPLACE FUNCTION sync_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Vérifier si l'email existe déjà pour un autre utilisateur
  IF EXISTS (
    SELECT 1 FROM public.users 
    WHERE email = NEW.email AND id != NEW.id
  ) THEN
    -- Si l'email existe déjà, ajouter un suffixe unique
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      country,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email || '_' || NEW.id,  -- Ajouter l'ID comme suffixe pour rendre l'email unique
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'country', 'FR'),
      NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      country = EXCLUDED.country,
      updated_at = CURRENT_TIMESTAMP;
  ELSE
    -- Si l'email n'existe pas, insérer normalement
    INSERT INTO public.users (
      id,
      email,
      first_name,
      last_name,
      country,
      created_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'country', 'FR'),
      NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
      email = EXCLUDED.email,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      country = EXCLUDED.country,
      updated_at = CURRENT_TIMESTAMP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer le trigger pour les nouveaux utilisateurs
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION sync_auth_user();

-- Synchroniser les utilisateurs existants en gérant les doublons
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN (SELECT * FROM auth.users) LOOP
    -- Vérifier si l'email existe déjà pour un autre utilisateur
    IF EXISTS (
      SELECT 1 FROM public.users 
      WHERE email = auth_user.email AND id != auth_user.id
    ) THEN
      -- Si l'email existe déjà, ajouter un suffixe unique
      INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        country,
        created_at
      )
      VALUES (
        auth_user.id,
        auth_user.email || '_' || auth_user.id,
        COALESCE(auth_user.raw_user_meta_data->>'first_name', ''),
        COALESCE(auth_user.raw_user_meta_data->>'last_name', ''),
        COALESCE(auth_user.raw_user_meta_data->>'country', 'FR'),
        auth_user.created_at
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        country = EXCLUDED.country,
        updated_at = CURRENT_TIMESTAMP;
    ELSE
      -- Si l'email n'existe pas, insérer normalement
      INSERT INTO public.users (
        id,
        email,
        first_name,
        last_name,
        country,
        created_at
      )
      VALUES (
        auth_user.id,
        auth_user.email,
        COALESCE(auth_user.raw_user_meta_data->>'first_name', ''),
        COALESCE(auth_user.raw_user_meta_data->>'last_name', ''),
        COALESCE(auth_user.raw_user_meta_data->>'country', 'FR'),
        auth_user.created_at
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        country = EXCLUDED.country,
        updated_at = CURRENT_TIMESTAMP;
    END IF;
  END LOOP;
END $$;