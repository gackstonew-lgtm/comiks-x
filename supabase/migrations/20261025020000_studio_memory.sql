-- ====================================================================
-- COMIKS X STUDIO - STUDIO MEMORY, GUIDELINES & LEARNED RULES
-- Migration: 20261025020000_studio_memory.sql
-- ====================================================================

-- 1. Studio Guidelines Table
CREATE TABLE IF NOT EXISTS public.studio_guidelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid() UNIQUE,
  brand_voice TEXT NOT NULL DEFAULT 'Vibrant, authentic, witty, high-energy Nairobi comic tone',
  visual_style TEXT NOT NULL DEFAULT 'African comic animation on-twos with rich cel shading, sharp ink linework, saturated tropical palettes',
  do_rules TEXT[] NOT NULL DEFAULT ARRAY[
    'Keep character outfits strictly consistent with character sheet',
    'Frame subjects dynamically with wide comic angles',
    'Incorporate authentic urban Nairobi street textures'
  ]::text[],
  dont_rules TEXT[] NOT NULL DEFAULT ARRAY[
    'No photorealistic 3D rendering',
    'No western comic speech bubbles',
    'No distorted anatomy or extra limbs'
  ]::text[],
  camera_preferences TEXT NOT NULL DEFAULT '24mm-35mm dynamic comic angles, subtle dutch tilts, dramatic push-ins',
  banned_content TEXT[] NOT NULL DEFAULT ARRAY['NSFW', 'Graphic violence', 'Hate speech']::text[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.studio_guidelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own guidelines"
  ON public.studio_guidelines FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own guidelines"
  ON public.studio_guidelines FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own guidelines"
  ON public.studio_guidelines FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

-- 2. Character & Style Profiles Table
CREATE TABLE IF NOT EXISTS public.character_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  description TEXT NOT NULL,
  wardrobe_anchor TEXT,
  visual_anchors TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  reference_image_urls TEXT[] NOT NULL DEFAULT ARRAY[]::text[],
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.character_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own character profiles"
  ON public.character_profiles FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own character profiles"
  ON public.character_profiles FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own character profiles"
  ON public.character_profiles FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own character profiles"
  ON public.character_profiles FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_character_profiles_user_id ON public.character_profiles(user_id);

-- 3. Generation Feedback Table
CREATE TABLE IF NOT EXISTS public.generation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  generation_id TEXT,
  rating TEXT NOT NULL CHECK (rating IN ('thumbs_up', 'thumbs_down')),
  note TEXT,
  error_tags TEXT[] NOT NULL DEFAULT ARRAY[]::text[], -- 'face', 'motion', 'style', 'pacing'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.generation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.generation_feedback FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own feedback"
  ON public.generation_feedback FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_generation_feedback_user_id ON public.generation_feedback(user_id);

-- 4. Learned Rules Table (Distilled from feedback & guidelines)
CREATE TABLE IF NOT EXISTS public.learned_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  rule_text TEXT NOT NULL CHECK (char_length(rule_text) > 0),
  category TEXT NOT NULL CHECK (category IN ('face', 'motion', 'style', 'pacing', 'general')),
  status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pinned', 'dismissed')),
  source TEXT NOT NULL DEFAULT 'distilled_feedback',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.learned_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own learned rules"
  ON public.learned_rules FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own learned rules"
  ON public.learned_rules FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own learned rules"
  ON public.learned_rules FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own learned rules"
  ON public.learned_rules FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_learned_rules_user_id ON public.learned_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_learned_rules_status ON public.learned_rules(status);
