/*
  # Create call-recordings storage bucket

  Creates a private storage bucket for roleplay call recordings (WebM/OGG audio files).
  RLS policy allows authenticated users to upload and read their own recordings only.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'call-recordings',
  'call-recordings',
  false,
  104857600, -- 100MB
  ARRAY['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav']
)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own recordings
CREATE POLICY "Users can upload own recordings"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'call-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own recordings
CREATE POLICY "Users can read own recordings"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'call-recordings' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
