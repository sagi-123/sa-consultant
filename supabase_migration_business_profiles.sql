-- ============================================================
-- Migration: business_profiles
-- Purpose: Persist business onboarding profile per auth user
--          so data survives logout/login cycles.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.business_profiles (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name    text NOT NULL,
  location         text,
  business_type    text,
  hiring_group     text,
  business_size    text,
  hiring_frequency text,
  logo_url         text,       -- base64 data-url or storage URL
  created_at       timestamptz DEFAULT now() NOT NULL,
  updated_at       timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id)             -- one profile per user
);

-- Auto-update updated_at on every update
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER business_profiles_updated_at
  BEFORE UPDATE ON public.business_profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own profile
CREATE POLICY "Users manage their own business profile"
  ON public.business_profiles
  FOR ALL
  USING (user_id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "Admins can read all business profiles"
  ON public.business_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.business_profiles TO authenticated;

-- ============================================================
-- Fix: business_candidate_assignments RLS
-- Allow authenticated users to read 'all' global assignments
-- ============================================================

-- Drop the old restrictive select policy
DROP POLICY IF EXISTS "Business users can view their own assignments"
  ON public.business_candidate_assignments;

-- New policy: authenticated users can read rows assigned to them OR global 'all' rows
CREATE POLICY "Business users can view their assignments"
  ON public.business_candidate_assignments
  FOR SELECT
  USING (
    business_user_id = 'all'
    OR business_user_id = auth.uid()::text
    OR business_user_id = auth.email()
  );
