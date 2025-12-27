-- Create storage bucket for admin uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-uploads', 'admin-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow admins to upload files
CREATE POLICY "Admins can upload files"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'admin-uploads' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to update files
CREATE POLICY "Admins can update files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'admin-uploads' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'admin-uploads' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow admins to delete files
CREATE POLICY "Admins can delete files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'admin-uploads' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Allow public read access to uploaded files (for displaying on site)
CREATE POLICY "Public can view uploaded files"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'admin-uploads');