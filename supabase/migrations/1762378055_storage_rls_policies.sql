-- Migration: storage_rls_policies
-- Created at: 1762378055

-- Enable RLS on storage.objects table (it should already be enabled, but ensuring)
-- Note: storage.objects is a system table that already has RLS enabled by default

-- Storage bucket policies for medical-documents
CREATE POLICY "Allow public read access to medical documents"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'medical-documents');

CREATE POLICY "Allow authenticated users to upload medical documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'medical-documents');

CREATE POLICY "Allow anon users to upload medical documents"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'medical-documents');

CREATE POLICY "Allow service role full access to medical documents"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'medical-documents')
WITH CHECK (bucket_id = 'medical-documents');

CREATE POLICY "Allow users to update their own medical documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own medical documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'medical-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage bucket policies for profile-photos
CREATE POLICY "Allow public read access to profile photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'profile-photos');

CREATE POLICY "Allow authenticated users to upload profile photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Allow anon users to upload profile photos"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Allow service role full access to profile photos"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'profile-photos')
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Allow users to update their own profile photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own profile photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'profile-photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage bucket policies for prescription-images
CREATE POLICY "Allow public read access to prescription images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'prescription-images');

CREATE POLICY "Allow authenticated users to upload prescription images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'prescription-images');

CREATE POLICY "Allow anon users to upload prescription images"
ON storage.objects FOR INSERT
TO anon
WITH CHECK (bucket_id = 'prescription-images');

CREATE POLICY "Allow service role full access to prescription images"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'prescription-images')
WITH CHECK (bucket_id = 'prescription-images');

CREATE POLICY "Allow users to update their own prescription images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'prescription-images' AND auth.uid()::text = (storage.foldername(name))[1])
WITH CHECK (bucket_id = 'prescription-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Allow users to delete their own prescription images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'prescription-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create indexes on storage.objects for better performance
CREATE INDEX IF NOT EXISTS idx_storage_objects_bucket_id ON storage.objects(bucket_id);
CREATE INDEX IF NOT EXISTS idx_storage_objects_name ON storage.objects(name);;