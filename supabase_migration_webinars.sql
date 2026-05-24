-- ==========================================================
-- SQL MIGRATION FOR WEBINARS & REGISTRATIONS
-- Copy and paste this script into the Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hqonpbkoutnkffjtshxw/sql/new
-- ==========================================================

-- 1. Create the webinars table
CREATE TABLE IF NOT EXISTS public.webinars (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  duration TEXT DEFAULT '1 hour',
  host_name TEXT,
  meeting_link TEXT, -- Webinar link (Zoom, Google Meet, Teams, etc.)
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the webinar_registrations table
CREATE TABLE IF NOT EXISTS public.webinar_registrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  webinar_id UUID REFERENCES public.webinars(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  -- Prevent registering twice for the same webinar with the same email
  CONSTRAINT unique_webinar_email UNIQUE (webinar_id, email)
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.webinars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webinar_registrations ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for Webinars
CREATE POLICY "Anyone can view webinars" ON public.webinars
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage webinars" ON public.webinars
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 5. RLS Policies for Webinar Registrations
CREATE POLICY "Anyone can register for webinars" ON public.webinar_registrations
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view and manage registrations" ON public.webinar_registrations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 6. Grant Permissions
GRANT ALL ON TABLE public.webinars TO postgres;
GRANT ALL ON TABLE public.webinars TO service_role;
GRANT ALL ON TABLE public.webinars TO authenticated;
GRANT ALL ON TABLE public.webinars TO anon;

GRANT ALL ON TABLE public.webinar_registrations TO postgres;
GRANT ALL ON TABLE public.webinar_registrations TO service_role;
GRANT ALL ON TABLE public.webinar_registrations TO authenticated;
GRANT ALL ON TABLE public.webinar_registrations TO anon;
