-- Create bug_reports table
CREATE TABLE IF NOT EXISTS public.bug_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  steps_to_reproduce TEXT,
  expected_behavior TEXT,
  actual_behavior TEXT,
  page_url TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_bug_reports_created_at ON public.bug_reports(created_at DESC);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status);

-- Enable Row Level Security
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert bug reports
CREATE POLICY "Allow public to insert bug reports"
  ON public.bug_reports
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow anyone to read bug reports
CREATE POLICY "Allow public to read bug reports"
  ON public.bug_reports
  FOR SELECT
  TO public
  USING (true);

-- Only allow service role to update/delete
CREATE POLICY "Only service role can update bug reports"
  ON public.bug_reports
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Only service role can delete bug reports"
  ON public.bug_reports
  FOR DELETE
  TO service_role
  USING (true);
