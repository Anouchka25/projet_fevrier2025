/*
  # Add admin features and document management

  1. User Updates
    - Add profile photo URL column
    - Add admin flag column
    - Add storage for user files

  2. Document Management
    - Create user_documents table for identity documents
    - Add document verification status

  3. Transfer Updates
    - Add validation fields
    - Add beneficiary email field
    - Add policies for admin access

  4. Storage
    - Create buckets for user files
    - Set up storage policies
*/

-- Add new columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo_url text;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

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
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS validated_at timestamptz;
ALTER TABLE transfers ADD COLUMN IF NOT EXISTS validated_by uuid REFERENCES users(id);

-- Add email column to beneficiaries
ALTER TABLE beneficiaries ADD COLUMN IF NOT EXISTS email text;

-- Enable RLS on user_documents
ALTER TABLE user_documents ENABLE ROW LEVEL SECURITY;

-- Create storage buckets
INSERT INTO storage.buckets (id, name)
VALUES ('user-files', 'user-files')
ON CONFLICT DO NOTHING;

-- Set up storage policies
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-files' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Policies for user_documents
CREATE POLICY "Users can view their own documents"
ON user_documents
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own documents"
ON user_documents
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

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

-- Set initial admin user
UPDATE users
SET is_admin = true
WHERE email = 'minkoueobamea@gmail.com';