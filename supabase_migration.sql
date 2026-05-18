-- ==========================================================
-- SQL MIGRATION FOR APPOINTMENT BOOKING TABLE
-- Copy and paste this script into the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hqonpbkoutnkffjtshxw/sql/new
-- ==========================================================

-- 1. Create the appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  slot_1 TEXT NOT NULL,
  slot_2 TEXT NOT NULL,
  slot_3 TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  selected_slot TEXT, -- Slot selected/confirmed by the admin
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 3. Policy: Allow anyone (clients) to insert/book appointments
CREATE POLICY "Anyone can book appointments" ON public.appointments
  FOR INSERT WITH CHECK (true);

-- 4. Policy: Allow admins to do everything (select, insert, update, delete)
CREATE POLICY "Admins can manage appointments" ON public.appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 5. Grant permissions (just to ensure schema accessibility)
GRANT ALL ON TABLE public.appointments TO postgres;
GRANT ALL ON TABLE public.appointments TO service_role;
GRANT ALL ON TABLE public.appointments TO authenticated;
GRANT ALL ON TABLE public.appointments TO anon;
