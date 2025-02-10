-- Supprimer les anciennes politiques de stockage
DROP POLICY IF EXISTS "Users can upload their own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own files" ON storage.objects;

-- Créer de nouvelles politiques plus permissives pour le stockage
CREATE POLICY "Enable read access for authenticated users"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'user-files');

CREATE POLICY "Enable insert access for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'user-files');

CREATE POLICY "Enable update access for authenticated users"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'user-files');

CREATE POLICY "Enable delete access for authenticated users"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'user-files');

-- S'assurer que le bucket existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', true)
ON CONFLICT (id) DO NOTHING;