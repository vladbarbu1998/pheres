-- Create storage bucket for editor images
INSERT INTO storage.buckets (id, name, public)
VALUES ('editor-images', 'editor-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users (admins) to upload images
CREATE POLICY "Admins can upload editor images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'editor-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Allow public read access to editor images
CREATE POLICY "Anyone can view editor images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'editor-images');

-- Allow admins to delete editor images
CREATE POLICY "Admins can delete editor images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'editor-images'
  AND EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);