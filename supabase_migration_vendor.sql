-- Add vendor contact fields to inquiries table
ALTER TABLE public.inquiries
  ADD COLUMN IF NOT EXISTS vendor_name TEXT,
  ADD COLUMN IF NOT EXISTS vendor_email TEXT,
  ADD COLUMN IF NOT EXISTS vendor_phone TEXT;

-- Ensure RLS policy allows inserts with these fields (if any custom policy exists)
-- Example: allow all inserts (already present) but we include a generic policy
CREATE POLICY "Allow vendor inserts" ON public.inquiries
  FOR INSERT WITH CHECK (true);

-- Grant permissions (if needed)
GRANT INSERT ON TABLE public.inquiries TO anon, authenticated;
