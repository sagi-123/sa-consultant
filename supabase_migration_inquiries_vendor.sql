-- ==========================================================
-- SQL MIGRATION: Add vendor fields to inquiries table
-- ----------------------------------------------------------
-- This script adds vendor_name, vendor_email, vendor_phone columns
-- to the public.inquiries table and ensures the INSERT policy allows them.
-- Run this in the Supabase SQL editor or via the CLI.
-- ==========================================================

-- 1. Add columns if they don't already exist
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS vendor_name TEXT,
  ADD COLUMN IF NOT EXISTS vendor_email TEXT,
  ADD COLUMN IF NOT EXISTS vendor_phone TEXT;

-- 2. Ensure INSERT policy allows these fields (optional explicit policy)
-- The generic INSERT policy "Anyone can insert inquiries" may already exist.
-- We'll create/replace a permissive INSERT policy for completeness.
CREATE POLICY "Allow vendor inserts" ON public.inquiries
  FOR INSERT
  USING (true)
  WITH CHECK (true);

-- 3. Grant INSERT privileges to the anon and authenticated roles
GRANT INSERT ON public.inquiries TO anon;
GRANT INSERT ON public.inquiries TO authenticated;

-- 4. (Optional) Refresh RLS policies – no action needed if policies already enabled.

-- End of migration
