-- =============================================================
-- HomeHunt Phase 7 — Rental Application Workflow Migrations
-- =============================================================

-- Helper function for triggers (ensure exists)
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Create Sequence for human-readable application numbers
CREATE SEQUENCE IF NOT EXISTS public.application_number_seq START 1000;

-- 2. Create Trigger Function to generate application number
CREATE OR REPLACE FUNCTION public.set_application_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num TEXT;
BEGIN
  year_part := to_char(now(), 'YYYY');
  seq_num := lpad(nextval('public.application_number_seq')::text, 6, '0');
  NEW.application_number := 'HH-APP-' || year_part || '-' || seq_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Tables

-- Application Requirements (Listing-specific or property-specific checklist templates)
CREATE TABLE IF NOT EXISTS public.application_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  description TEXT,
  type VARCHAR NOT NULL DEFAULT 'DOCUMENT', -- 'TEXT', 'NUMBER', 'BOOLEAN', 'DOCUMENT', 'REFERENCE'
  is_required BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Rental Applications
CREATE TABLE IF NOT EXISTS public.rental_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_number VARCHAR UNIQUE, -- Populated by trigger
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  applicant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'ADDITIONAL_INFORMATION_REQUIRED', 'RESUBMITTED', 'SHORTLISTED', 'APPROVED', 'REJECTED', 'WITHDRAWN', 'EXPIRED'
  rent_snapshot NUMERIC NOT NULL,
  currency_snapshot VARCHAR NOT NULL DEFAULT 'KES',
  billing_period_snapshot VARCHAR NOT NULL DEFAULT 'MONTHLY',
  deposit_snapshot NUMERIC NOT NULL,
  preferred_move_in_date DATE,
  preferred_lease_months INT,
  personal_info JSONB NOT NULL DEFAULT '{}'::jsonb, -- full_name, phone_number, email, etc.
  employment_info JSONB NOT NULL DEFAULT '{}'::jsonb, -- status, employer, income_range, etc.
  household_info JSONB NOT NULL DEFAULT '{}'::jsonb, -- adults, children, pets, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at TIMESTAMPTZ,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  rejection_reason VARCHAR, -- 'REQUIREMENTS_NOT_MET', 'DOCUMENTATION_INCOMPLETE', 'PROPERTY_NO_LONGER_AVAILABLE', 'APPLICATION_WITHDRAWN', 'OTHER'
  rejection_notes TEXT,
  CONSTRAINT chk_applicant_provider_diff CHECK (applicant_id <> provider_id)
);

-- Application Documents (Files uploaded to support requirements)
CREATE TABLE IF NOT EXISTS public.application_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.rental_applications(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES public.application_requirements(id) ON DELETE SET NULL,
  name VARCHAR NOT NULL,
  file_path VARCHAR NOT NULL, -- Private storage path
  file_size INT NOT NULL,
  mime_type VARCHAR NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'UPLOADED', -- 'UPLOADED', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Additional Information Requests
CREATE TABLE IF NOT EXISTS public.application_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.rental_applications(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES public.application_requirements(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'RESPONDED', 'CANCELLED', 'EXPIRED'
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Application Reviews (Internal landlord/agent review logs & scoring notes)
CREATE TABLE IF NOT EXISTS public.application_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.rental_applications(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recommendation VARCHAR NOT NULL, -- 'APPROVE', 'REJECT', 'SHORTLIST', 'HOLD'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Application Status History (Timeline tracking log)
CREATE TABLE IF NOT EXISTS public.application_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.rental_applications(id) ON DELETE CASCADE,
  previous_status VARCHAR,
  new_status VARCHAR NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Triggers

-- Application number generation trigger
CREATE OR REPLACE TRIGGER trigger_set_application_number
  BEFORE INSERT ON public.rental_applications
  FOR EACH ROW
  WHEN (NEW.application_number IS NULL)
  EXECUTE FUNCTION public.set_application_number();

-- updated_at trigger hook-ups
CREATE OR REPLACE TRIGGER set_application_requirements_updated_at
  BEFORE UPDATE ON public.application_requirements
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_rental_applications_updated_at
  BEFORE UPDATE ON public.rental_applications
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_application_documents_updated_at
  BEFORE UPDATE ON public.application_documents
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_application_requests_updated_at
  BEFORE UPDATE ON public.application_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_application_reviews_updated_at
  BEFORE UPDATE ON public.application_reviews
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.application_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Requirements Policies: read by anyone (needed to construct form), write by property provider or admin
CREATE POLICY "req_select_policy" ON public.application_requirements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "req_write_policy" ON public.application_requirements
  FOR ALL TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND p.owner_user_id = auth.uid()
    )
  );

-- Applications Policies: Seeker, Provider, or Admin can select/update. Seeker can insert drafts.
CREATE POLICY "app_select_policy" ON public.rental_applications
  FOR SELECT TO authenticated
  USING (
    applicant_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "app_insert_policy" ON public.rental_applications
  FOR INSERT TO authenticated
  WITH CHECK (
    applicant_id = auth.uid()
  );

CREATE POLICY "app_update_policy" ON public.rental_applications
  FOR UPDATE TO authenticated
  USING (
    applicant_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  )
  WITH CHECK (
    applicant_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

-- Documents Policies: thread participants can read/write
CREATE POLICY "doc_select_policy" ON public.application_documents
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    public.has_role(auth.uid(), 'verifier') OR
    EXISTS (
      SELECT 1 FROM public.rental_applications ra
      WHERE ra.id = application_id AND (
        ra.applicant_id = auth.uid() OR
        ra.provider_id = auth.uid()
      )
    )
  );

CREATE POLICY "doc_insert_policy" ON public.application_documents
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.rental_applications ra
      WHERE ra.id = application_id AND ra.applicant_id = auth.uid()
    )
  );

CREATE POLICY "doc_delete_policy" ON public.application_documents
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.rental_applications ra
      WHERE ra.id = application_id AND ra.applicant_id = auth.uid() AND ra.status IN ('DRAFT', 'ADDITIONAL_INFORMATION_REQUIRED')
    )
  );

-- Requests Policies
CREATE POLICY "req_status_select_policy" ON public.application_requests
  FOR SELECT TO authenticated
  USING (
    recipient_id = auth.uid() OR
    requester_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "req_status_insert_policy" ON public.application_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    requester_id = auth.uid()
  );

CREATE POLICY "req_status_update_policy" ON public.application_requests
  FOR UPDATE TO authenticated
  USING (
    recipient_id = auth.uid() OR
    requester_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

-- Reviews Policies (Landlord/agent internal review logs, hidden from applicants)
CREATE POLICY "rev_select_policy" ON public.application_reviews
  FOR SELECT TO authenticated
  USING (
    reviewer_id = auth.uid() OR
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.rental_applications ra
      WHERE ra.id = application_id AND ra.provider_id = auth.uid()
    )
  );

CREATE POLICY "rev_write_policy" ON public.application_reviews
  FOR ALL TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.rental_applications ra
      WHERE ra.id = application_id AND ra.provider_id = auth.uid()
    )
  );

-- Status History Policies (Timeline logs)
CREATE POLICY "hist_select_policy" ON public.application_status_history
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.rental_applications ra
      WHERE ra.id = application_id AND (
        ra.applicant_id = auth.uid() OR
        ra.provider_id = auth.uid()
      )
    )
  );

-- 7. Secure Private Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'application_documents',
  'application_documents',
  false, -- private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
CREATE POLICY "Allow users to upload own application folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'application_documents' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

CREATE POLICY "Allow users to read authorized application documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'application_documents' AND
  (
    (split_part(name, '/', 1)) = auth.uid()::text OR
    public.is_platform_admin(auth.uid()) OR
    public.has_role(auth.uid(), 'verifier') OR
    EXISTS (
      SELECT 1 FROM public.application_documents ad
      JOIN public.rental_applications ra ON ra.id = ad.application_id
      WHERE ad.file_path = name AND ra.provider_id = auth.uid()
    )
  )
);

CREATE POLICY "Allow users to delete own application documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'application_documents' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

-- 8. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_requirements TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rental_applications TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_documents TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_requests TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.application_reviews TO authenticated, service_role;
GRANT SELECT, INSERT ON public.application_status_history TO authenticated, service_role;

-- 9. Role Permissions
INSERT INTO public.permissions (name, description) VALUES
  ('APPLICATIONS_CREATE', 'Can create and submit rental applications'),
  ('APPLICATIONS_VIEW_SELF', 'Can view their own rental applications and status updates'),
  ('APPLICATIONS_WITHDRAW', 'Can withdraw their own submitted applications'),
  ('APPLICATIONS_MANAGE', 'Can review, request info, shortlist, and approve/reject applications')
ON CONFLICT (name) DO NOTHING;

-- Map to seeker/tenant
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('tenant', 'APPLICATIONS_CREATE'),
  ('tenant', 'APPLICATIONS_VIEW_SELF'),
  ('tenant', 'APPLICATIONS_WITHDRAW')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to landlord
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('landlord', 'APPLICATIONS_VIEW_SELF'),
  ('landlord', 'APPLICATIONS_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to agent
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('agent', 'APPLICATIONS_VIEW_SELF'),
  ('agent', 'APPLICATIONS_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to property manager
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('property_manager', 'APPLICATIONS_VIEW_SELF'),
  ('property_manager', 'APPLICATIONS_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to admin
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('admin', 'APPLICATIONS_VIEW_SELF'),
  ('admin', 'APPLICATIONS_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to super admin
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('super_admin', 'APPLICATIONS_VIEW_SELF'),
  ('super_admin', 'APPLICATIONS_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- 10. Database Indexes
CREATE INDEX IF NOT EXISTS idx_apps_applicant ON public.rental_applications(applicant_id);
CREATE INDEX IF NOT EXISTS idx_apps_provider ON public.rental_applications(provider_id);
CREATE INDEX IF NOT EXISTS idx_apps_listing ON public.rental_applications(listing_id);
CREATE INDEX IF NOT EXISTS idx_apps_status ON public.rental_applications(status);
CREATE INDEX IF NOT EXISTS idx_app_docs_app ON public.application_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_app_reqs_app ON public.application_requests(application_id);
CREATE INDEX IF NOT EXISTS idx_app_revs_app ON public.application_reviews(application_id);
CREATE INDEX IF NOT EXISTS idx_app_hist_app ON public.application_status_history(application_id);
