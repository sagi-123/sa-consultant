-- ============================================================
-- Migration: business_candidate_assignments
-- Purpose: Allow admins to assign candidates from the ATS to
--          specific business dashboard users so they appear
--          in the Candidate Search tab.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.business_candidate_assignments (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  candidate_id  uuid NOT NULL REFERENCES public.candidates(id) ON DELETE CASCADE,
  business_user_id text NOT NULL,   -- auth.users.id or email of the business user
  assigned_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  note          text,               -- optional admin note for this assignment
  assigned_at   timestamptz DEFAULT now() NOT NULL
);

-- Index for fast lookups by business user
CREATE INDEX IF NOT EXISTS idx_bca_business_user
  ON public.business_candidate_assignments (business_user_id);

-- Index for fast lookups by candidate
CREATE INDEX IF NOT EXISTS idx_bca_candidate
  ON public.business_candidate_assignments (candidate_id);

-- Prevent duplicate assignments of the same candidate to the same business
CREATE UNIQUE INDEX IF NOT EXISTS idx_bca_unique
  ON public.business_candidate_assignments (candidate_id, business_user_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.business_candidate_assignments ENABLE ROW LEVEL SECURITY;

-- Admins can read/write all rows
CREATE POLICY "Admins can manage all assignments"
  ON public.business_candidate_assignments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Business users can only read rows assigned to them
CREATE POLICY "Business users can view their own assignments"
  ON public.business_candidate_assignments
  FOR SELECT
  USING (business_user_id = auth.uid()::text OR business_user_id = auth.email());

-- ============================================================
-- Grant permissions
-- ============================================================
GRANT SELECT, INSERT, UPDATE, DELETE
  ON public.business_candidate_assignments TO authenticated;
