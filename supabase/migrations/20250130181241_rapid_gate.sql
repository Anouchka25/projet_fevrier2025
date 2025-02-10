/*
  # Add admin features and document management
  
  1. Changes
    - Add is_admin column to users table
    - Add profile_photo_url to users table
    - Create user_documents table for identity documents
    - Add validation fields to transfers table
    - Add email field to beneficiaries
    
  2. Security
    - Enable RLS on new tables
    - Add policies for document access
    - Set initial admin user
*/

-- Add new columns to users table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'profile_photo_url') THEN
    ALTER TABLE users ADD COLUMN profile_photo_url text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_admin') THEN
    ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create user_documents table
CREATE TABLE IF NOT EXISTS user_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) NOT NULL,
  document_type text NOT NULL,
  document_url text NOT NULL,
  side text NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to transfers table
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfers' AND column_name = 'validated_at') THEN
    ALTER TABLE transfers ADD COLUMN validated_at timestamptz;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfers' AND column_name = 'validated_by') THEN
    ALTER TABLE transfers ADD COLUMN validated_by uuid REFERENCES users(id);
  END IF;
END $$;

-- Add email column to beneficiaries
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'beneficiaries' AND column_name = 'email') THEN
    ALTER TABLE beneficiaries ADD COLUMN email text;
  END IF;
END $$;

-- Enable RLS on user_documents
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Policies for user_documents
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_documents' AND policyname = 'Users can view their own documents'
  ) THEN
    CREATE POLICY "Users can view their own documents"
      ON user_documents
      FOR SELECT
      TO authenticated
      USING (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_documents' AND policyname = 'Users can insert their own documents'
  ) THEN
    CREATE POLICY "Users can insert their own documents"
      ON user_documents
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_documents' AND policyname = 'Admins can view all documents'
  ) THEN
    CREATE POLICY "Admins can view all documents"
      ON user_documents
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.is_admin = true
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_documents' AND policyname = 'Admins can verify documents'
  ) THEN
    CREATE POLICY "Admins can verify documents"
      ON user_documents
      FOR UPDATE
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.is_admin = true
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.is_admin = true
        )
      );
  END IF;
END $$;

-- Set initial admin user
UPDATE users
SET is_admin = true
WHERE email = 'minkoueobamea@gmail.com';