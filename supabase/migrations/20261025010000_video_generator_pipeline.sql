-- ====================================================================
-- COMIKS X STUDIO - VIDEO GENERATOR PIPELINE & GENERATIONS TRACKING
-- Migration: 20261025010000_video_generator_pipeline.sql
-- ====================================================================

-- 1. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  name TEXT NOT NULL CHECK (char_length(name) > 0),
  description TEXT,
  aspect_ratio TEXT NOT NULL DEFAULT '9:16' CHECK (aspect_ratio IN ('9:16', '16:9', '1:1')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'ready', 'exported')),
  timeline_data JSONB NOT NULL DEFAULT '{"clips":[],"tracks":[]}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own projects"
  ON public.projects FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated_at ON public.projects(updated_at DESC);

-- Trigger for projects updated_at
CREATE OR REPLACE TRIGGER on_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 2. Scenes Table (5-second atomic generation scenes)
CREATE TABLE IF NOT EXISTS public.scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  scene_number INTEGER NOT NULL DEFAULT 1,
  prompt TEXT NOT NULL,
  negative_prompt TEXT,
  duration INTEGER NOT NULL DEFAULT 5 CHECK (duration >= 3 AND duration <= 30),
  keyframe_url TEXT,
  keyframe_status TEXT NOT NULL DEFAULT 'pending' CHECK (keyframe_status IN ('pending', 'generating', 'generated', 'approved', 'rejected')),
  video_url TEXT,
  video_status TEXT NOT NULL DEFAULT 'pending' CHECK (video_status IN ('pending', 'queued', 'generating', 'completed', 'failed')),
  cost_estimate NUMERIC(8,2) NOT NULL DEFAULT 1.00,
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

CREATE INDEX IF NOT EXISTS idx_scenes_project_id ON public.scenes(project_id);
CREATE INDEX IF NOT EXISTS idx_scenes_user_id ON public.scenes(user_id);

-- 3. Generations Table (Background jobs & provider status tracking)
CREATE TABLE IF NOT EXISTS public.generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  scene_id UUID REFERENCES public.scenes(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'fal',
  model TEXT,
  type TEXT NOT NULL DEFAULT 'video' CHECK (type IN ('keyframe', 'video', 'audio')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'queued', 'processing', 'completed', 'failed')),
  cost NUMERIC(8,2) NOT NULL DEFAULT 1.00,
  output_url TEXT,
  retries INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  provider_job_id TEXT,
  webhook_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own generations"
  ON public.generations FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own generations"
  ON public.generations FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_generations_scene_id ON public.generations(scene_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_status ON public.generations(status);

-- 4. Renders Table (Timeline export jobs)
CREATE TABLE IF NOT EXISTS public.renders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  timeline_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  resolution TEXT NOT NULL DEFAULT '1080p' CHECK (resolution IN ('720p', '1080p')),
  aspect_ratio TEXT NOT NULL DEFAULT '9:16' CHECK (aspect_ratio IN ('9:16', '16:9', '1:1')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'rendering', 'completed', 'failed')),
  cost NUMERIC(8,2) NOT NULL DEFAULT 5.00,
  output_url TEXT,
  download_url TEXT,
  render_worker_job_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.renders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own renders"
  ON public.renders FOR SELECT
  USING (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can insert own renders"
  ON public.renders FOR INSERT
  WITH CHECK (user_id = (SELECT auth.uid()));

CREATE POLICY "Users can update own renders"
  ON public.renders FOR UPDATE
  USING (user_id = (SELECT auth.uid()));

CREATE INDEX IF NOT EXISTS idx_renders_project_id ON public.renders(project_id);
CREATE INDEX IF NOT EXISTS idx_renders_user_id ON public.renders(user_id);
