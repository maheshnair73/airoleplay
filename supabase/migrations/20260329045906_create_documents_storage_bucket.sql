/*
  # Create Documents Storage Bucket

  1. Storage Setup
    - Creates 'documents' bucket for file uploads
    - Enables public access for uploaded files
    - Sets up RLS policies for secure access
  
  2. Security
    - Authenticated users can upload files
    - Anyone can view files (public bucket)
    - Users can delete their own files
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  true,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'video/mp4',
    'audio/mpeg',
    'audio/wav',
    'audio/mp3'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Anyone can view documents"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'documents');

CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'documents' AND owner = auth.uid());