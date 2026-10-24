-- ====================================================================
-- COMIKS X STUDIO - REFERENCE MEDIA ASSETS & PRIVATE STORAGE BUCKET
-- Migration: 20261025000000_media_assets_and_references.sql
-- ====================================================================

-- 1. Create media_assets table
CREATE TABLE IF NOT EXISTS public.media_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  project_id UUID,
  type TEXT NOT NULL CHECK (type IN ('image', 'video', 'audio', 'document')),
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  size BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own media assets"
  ON public.media_assets FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own media assets"
  ON public.media_assets FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own media assets"
  ON public.media_assets FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own media assets"
  ON public.media_assets FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_media_assets_user_id ON public.media_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_media_assets_type ON public.media_assets(type);
CREATE INDEX IF NOT EXISTS idx_media_assets_created_at ON public.media_assets(created_at DESC);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER on_media_assets_updated
  BEFORE UPDATE ON public.media_assets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Configure Private Storage Bucket 'references'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'references',
  'references',
  false,
  209715200, -- 200MB limit
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'video/mp4', 'video/webm', 'video/quicktime',
    'audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg',
    'application/pdf', 'text/plain', 'text/markdown'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 209715200;

-- Storage RLS policies for 'references'
CREATE POLICY "Users can view own references files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'references' AND
    (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can upload own references files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'references' AND
    (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update own references files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'references' AND
    (auth.uid())::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own references files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'references' AND
    (auth.uid())::text = (storage.foldername(name))[1]
  );
