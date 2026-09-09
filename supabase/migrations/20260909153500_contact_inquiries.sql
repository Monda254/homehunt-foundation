-- HomeHunt Contact Inquiries Table
CREATE TABLE IF NOT EXISTS public.contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contact_inquiries ENABLE ROW LEVEL SECURITY;

-- Allow anyone (public and authenticated users) to submit contact inquiries
CREATE POLICY "contact_inquiries_insert_policy" ON public.contact_inquiries
  FOR INSERT TO public, authenticated
  WITH CHECK (true);

-- Allow platform admins to view contact inquiries
CREATE POLICY "contact_inquiries_select_policy" ON public.contact_inquiries
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
    )
  );

-- Grant table access to roles
GRANT SELECT, INSERT ON public.contact_inquiries TO anon, authenticated, service_role;
