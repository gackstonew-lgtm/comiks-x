-- ====================================================================
-- COMIKS X STUDIO - INITIAL DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- Migration: 20261024120000_init_comiks_schema.sql
-- ====================================================================

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Profiles Table (Auto-created on user registration)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (id = (SELECT auth.uid()));

CREATE OR REPLACE TRIGGER on_profile_updated
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger to auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Studio Creator'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Series Table (Franchise projects)
CREATE TABLE IF NOT EXISTS public.series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  description TEXT,
  genre TEXT,
  art_style TEXT NOT NULL DEFAULT 'African Comic',
  is_style_locked BOOLEAN NOT NULL DEFAULT true,
  world_rules JSONB NOT NULL DEFAULT '[]'::jsonb,
  brand_identity JSONB NOT NULL DEFAULT '{}'::jsonb,
  visual_references JSONB NOT NULL DEFAULT '[]'::jsonb,
  episode_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own series"
  ON public.series FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own series"
  ON public.series FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own series"
  ON public.series FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own series"
  ON public.series FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_series_user_id ON public.series(user_id);
CREATE INDEX IF NOT EXISTS idx_series_created_at ON public.series(created_at DESC);

CREATE OR REPLACE TRIGGER on_series_updated
  BEFORE UPDATE ON public.series
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Characters Table (Character Bible with 5D DNA)
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  age INTEGER,
  personality TEXT,
  appearance TEXT,
  clothing TEXT,
  hairstyle TEXT,
  skin_tone TEXT,
  body_type TEXT,
  accent TEXT,
  speech_style TEXT,
  character_description TEXT,
  is_locked BOOLEAN NOT NULL DEFAULT true,
  voice JSONB NOT NULL DEFAULT '{}'::jsonb,
  character_dna JSONB NOT NULL DEFAULT '{}'::jsonb,
  references_pack JSONB NOT NULL DEFAULT '[]'::jsonb,
  memories JSONB NOT NULL DEFAULT '[]'::jsonb,
  lock_overrides JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own characters"
  ON public.characters FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own characters"
  ON public.characters FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own characters"
  ON public.characters FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own characters"
  ON public.characters FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_characters_user_id ON public.characters(user_id);
CREATE INDEX IF NOT EXISTS idx_characters_series_id ON public.characters(series_id);

CREATE OR REPLACE TRIGGER on_characters_updated
  BEFORE UPDATE ON public.characters
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  category TEXT NOT NULL DEFAULT 'cbd',
  description TEXT,
  visual_prompt TEXT,
  reference_images JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own locations"
  ON public.locations FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own locations"
  ON public.locations FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own locations"
  ON public.locations FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own locations"
  ON public.locations FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_locations_user_id ON public.locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_series_id ON public.locations(series_id);

CREATE OR REPLACE TRIGGER on_locations_updated
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Episodes Table
CREATE TABLE IF NOT EXISTS public.episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  series_id UUID REFERENCES public.series(id) ON DELETE CASCADE,
  episode_number INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL CHECK (char_length(title) > 0),
  logline TEXT,
  target_duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'draft',
  three_act_structure JSONB NOT NULL DEFAULT '{}'::jsonb,
  chapters JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own episodes"
  ON public.episodes FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own episodes"
  ON public.episodes FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own episodes"
  ON public.episodes FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own episodes"
  ON public.episodes FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_episodes_user_id ON public.episodes(user_id);
CREATE INDEX IF NOT EXISTS idx_episodes_series_id ON public.episodes(series_id);

CREATE OR REPLACE TRIGGER on_episodes_updated
  BEFORE UPDATE ON public.episodes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Scenes Table
CREATE TABLE IF NOT EXISTS public.scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL,
  act_number INTEGER NOT NULL DEFAULT 1,
  title TEXT,
  duration INTEGER NOT NULL DEFAULT 12,
  location TEXT,
  camera_angle TEXT,
  visual_prompt TEXT,
  negative_prompt TEXT,
  dialogue JSONB NOT NULL DEFAULT '[]'::jsonb,
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.scenes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scenes"
  ON public.scenes FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own scenes"
  ON public.scenes FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own scenes"
  ON public.scenes FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own scenes"
  ON public.scenes FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_scenes_user_id ON public.scenes(user_id);
CREATE INDEX IF NOT EXISTS idx_scenes_episode_id ON public.scenes(episode_id);

CREATE OR REPLACE TRIGGER on_scenes_updated
  BEFORE UPDATE ON public.scenes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Social Clips Table (9:16 Vertical Shorts)
CREATE TABLE IF NOT EXISTS public.social_clips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  episode_id UUID REFERENCES public.episodes(id) ON DELETE CASCADE,
  clip_number INTEGER,
  title TEXT,
  duration INTEGER NOT NULL DEFAULT 30,
  hook_type TEXT,
  hook_text TEXT,
  video_url TEXT,
  captions TEXT,
  tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.social_clips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own social clips"
  ON public.social_clips FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own social clips"
  ON public.social_clips FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own social clips"
  ON public.social_clips FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own social clips"
  ON public.social_clips FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_social_clips_user_id ON public.social_clips(user_id);
CREATE INDEX IF NOT EXISTS idx_social_clips_episode_id ON public.social_clips(episode_id);

CREATE OR REPLACE TRIGGER on_social_clips_updated
  BEFORE UPDATE ON public.social_clips
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
