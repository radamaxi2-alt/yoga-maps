-- Create storage buckets for profile covers if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('teacher-covers', 'teacher-covers', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for teacher-covers
CREATE POLICY "Public Access for teacher-covers"
ON storage.objects FOR SELECT
USING (bucket_id = 'teacher-covers');

CREATE POLICY "Authenticated users can upload covers"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'teacher-covers' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own covers"
ON storage.objects FOR UPDATE
USING (bucket_id = 'teacher-covers' AND auth.uid()::text = (storage.foldername(name))[1]);
