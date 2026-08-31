-- =============================================================
-- HomeHunt Phase 8 — Tenancy, Lease & Move-In Migrations
-- =============================================================

-- Helper function for triggers (ensure exists)
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Create Sequence for human-readable tenancy reference numbers
CREATE SEQUENCE IF NOT EXISTS public.tenancy_number_seq START 1000;

-- 2. Create Trigger Function to generate tenancy reference
CREATE OR REPLACE FUNCTION public.set_tenancy_number()
RETURNS TRIGGER AS $$
DECLARE
  year_part TEXT;
  seq_num TEXT;
BEGIN
  year_part := to_char(now(), 'YYYY');
  seq_num := lpad(nextval('public.tenancy_number_seq')::text, 6, '0');
  NEW.tenancy_reference := 'HH-TEN-' || year_part || '-' || seq_num;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Tables

-- Tenancies Table
CREATE TABLE IF NOT EXISTS public.tenancies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_reference VARCHAR UNIQUE, -- Populated by trigger
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE RESTRICT,
  application_id UUID UNIQUE NOT NULL REFERENCES public.rental_applications(id) ON DELETE RESTRICT,
  tenant_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  status VARCHAR NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'LEASE_PREPARATION', 'AWAITING_ACCEPTANCE', 'ACTIVE', 'MOVE_IN_PENDING', 'OCCUPIED', 'NOTICE_GIVEN', 'ENDED', 'TERMINATED', 'CANCELLED'
  rent_snapshot NUMERIC NOT NULL,
  currency_snapshot VARCHAR NOT NULL DEFAULT 'KES',
  billing_period_snapshot VARCHAR NOT NULL DEFAULT 'MONTHLY',
  deposit_snapshot NUMERIC NOT NULL,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  activated_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  termination_reason VARCHAR, -- 'LEASE_EXPIRED', 'MUTUAL_END', 'TERMINATION', 'OTHER'
  termination_notes TEXT,
  CONSTRAINT chk_tenant_provider_diff CHECK (tenant_id <> provider_id)
);

-- Unique index to prevent duplicate active tenancies for units/properties
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_unit_tenancy 
ON public.tenancies (unit_id) 
WHERE (status IN ('ACTIVE', 'OCCUPIED', 'MOVE_IN_PENDING', 'AWAITING_ACCEPTANCE'));

CREATE UNIQUE INDEX IF NOT EXISTS unique_active_property_tenancy 
ON public.tenancies (property_id) 
WHERE (unit_id IS NULL AND status IN ('ACTIVE', 'OCCUPIED', 'MOVE_IN_PENDING', 'AWAITING_ACCEPTANCE'));

-- Leases Table (Multiple drafts/negotiated versions of the agreement terms)
CREATE TABLE IF NOT EXISTS public.leases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id UUID NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  version INT NOT NULL DEFAULT 1,
  status VARCHAR NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'READY_FOR_REVIEW', 'SENT_TO_TENANT', 'TENANT_ACCEPTED', 'PROVIDER_ACCEPTED', 'EXECUTED', 'ACTIVE', 'EXPIRED', 'TERMINATED'
  rent_amount NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  terms JSONB NOT NULL DEFAULT '{}'::jsonb, -- custom guidelines, utilities, pets policy, occupancy limits
  file_path VARCHAR, -- signed lease agreement storage path
  tenant_accepted_at TIMESTAMPTZ,
  tenant_accepted_ip VARCHAR,
  tenant_accepted_user_agent VARCHAR,
  provider_accepted_at TIMESTAMPTZ,
  provider_accepted_ip VARCHAR,
  provider_accepted_user_agent VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tenancy_id, version)
);

-- Move-in Records Table
CREATE TABLE IF NOT EXISTS public.move_in_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id UUID UNIQUE NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ,
  actual_date TIMESTAMPTZ,
  status VARCHAR NOT NULL DEFAULT 'SCHEDULED', -- 'SCHEDULED', 'RESCHEDULED', 'COMPLETED', 'CANCELLED'
  checklist JSONB NOT NULL DEFAULT '{}'::jsonb, -- keys_handed_over, condition_approved, utilities_info_given
  condition_notes TEXT,
  condition_media JSONB NOT NULL DEFAULT '[]'::jsonb, -- private media file paths
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tenancy Status History (Timeline tracking)
CREATE TABLE IF NOT EXISTS public.tenancy_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenancy_id UUID NOT NULL REFERENCES public.tenancies(id) ON DELETE CASCADE,
  previous_status VARCHAR,
  new_status VARCHAR NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Triggers

-- Tenancy reference number generation trigger
CREATE OR REPLACE TRIGGER trigger_set_tenancy_number
  BEFORE INSERT ON public.tenancies
  FOR EACH ROW
  WHEN (NEW.tenancy_reference IS NULL)
  EXECUTE FUNCTION public.set_tenancy_number();

-- updated_at trigger hook-ups
CREATE OR REPLACE TRIGGER set_tenancies_updated_at
  BEFORE UPDATE ON public.tenancies
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_leases_updated_at
  BEFORE UPDATE ON public.leases
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_move_in_records_updated_at
  BEFORE UPDATE ON public.move_in_records
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_timestamp();

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_in_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenancy_status_history ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies

-- Tenancies Policies: Tenant, Provider, or Admin can select/update. Seeker or Owner can insert.
CREATE POLICY "tenancy_select_policy" ON public.tenancies
  FOR SELECT TO authenticated
  USING (
    tenant_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "tenancy_insert_policy" ON public.tenancies
  FOR INSERT TO authenticated
  WITH CHECK (
    tenant_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "tenancy_update_policy" ON public.tenancies
  FOR UPDATE TO authenticated
  USING (
    tenant_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  )
  WITH CHECK (
    tenant_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

-- Leases Policies: Joined access control on Tenancy
CREATE POLICY "lease_select_policy" ON public.leases
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tenancies t
      WHERE t.id = tenancy_id AND (
        t.tenant_id = auth.uid() OR
        t.provider_id = auth.uid()
      )
    )
  );

CREATE POLICY "lease_insert_policy" ON public.leases
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tenancies t
      WHERE t.id = tenancy_id AND (
        t.provider_id = auth.uid() OR
        t.tenant_id = auth.uid()
      )
    )
  );

CREATE POLICY "lease_update_policy" ON public.leases
  FOR UPDATE TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tenancies t
      WHERE t.id = tenancy_id AND (
        t.provider_id = auth.uid() OR
        t.tenant_id = auth.uid()
      )
    )
  );

-- Move-in Records Policies
CREATE POLICY "move_in_select_policy" ON public.move_in_records
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tenancies t
      WHERE t.id = tenancy_id AND (
        t.tenant_id = auth.uid() OR
        t.provider_id = auth.uid()
      )
    )
  );

CREATE POLICY "move_in_insert_policy" ON public.move_in_records
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tenancies t
      WHERE t.id = tenancy_id AND (
        t.provider_id = auth.uid() OR
        t.tenant_id = auth.uid()
      )
    )
  );

CREATE POLICY "move_in_update_policy" ON public.move_in_records
  FOR UPDATE TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tenancies t
      WHERE t.id = tenancy_id AND (
        t.provider_id = auth.uid() OR
        t.tenant_id = auth.uid()
      )
    )
  );

-- Tenancy Status History Policies (Timeline logs)
CREATE POLICY "tenancy_hist_select_policy" ON public.tenancy_status_history
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tenancies t
      WHERE t.id = tenancy_id AND (
        t.tenant_id = auth.uid() OR
        t.provider_id = auth.uid()
      )
    )
  );

-- 7. Secure Private Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'tenancy_documents',
  'tenancy_documents',
  false, -- private bucket
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for the bucket
CREATE POLICY "Allow users to upload own tenancy docs folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'tenancy_documents' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

CREATE POLICY "Allow users to read authorized tenancy documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'tenancy_documents' AND
  (
    (split_part(name, '/', 1)) = auth.uid()::text OR
    public.is_platform_admin(auth.uid()) OR
    EXISTS (
      SELECT 1 FROM public.tenancies t
      WHERE (t.tenant_id = auth.uid() OR t.provider_id = auth.uid())
    )
  )
);

CREATE POLICY "Allow users to delete own tenancy documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'tenancy_documents' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

-- 8. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tenancies TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leases TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.move_in_records TO authenticated, service_role;
GRANT SELECT, INSERT ON public.tenancy_status_history TO authenticated, service_role;

-- 9. Role Permissions
INSERT INTO public.permissions (name, description) VALUES
  ('TENANCIES_CREATE', 'Can initialize tenancy drafts from approved application'),
  ('TENANCIES_VIEW_SELF', 'Can view their own tenancy records, leases, and timeline logs'),
  ('TENANCIES_MANAGE', 'Can draft, execute, schedule move-ins, and manage status transitions')
ON CONFLICT (name) DO NOTHING;

-- Map to seeker/tenant
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('tenant', 'TENANCIES_CREATE'),
  ('tenant', 'TENANCIES_VIEW_SELF')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to landlord
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('landlord', 'TENANCIES_CREATE'),
  ('landlord', 'TENANCIES_VIEW_SELF'),
  ('landlord', 'TENANCIES_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to agent
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('agent', 'TENANCIES_CREATE'),
  ('agent', 'TENANCIES_VIEW_SELF'),
  ('agent', 'TENANCIES_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to property manager
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('property_manager', 'TENANCIES_CREATE'),
  ('property_manager', 'TENANCIES_VIEW_SELF'),
  ('property_manager', 'TENANCIES_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to admin
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('admin', 'TENANCIES_VIEW_SELF'),
  ('admin', 'TENANCIES_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to super admin
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('super_admin', 'TENANCIES_VIEW_SELF'),
  ('super_admin', 'TENANCIES_MANAGE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- 10. Database Indexes
CREATE INDEX IF NOT EXISTS idx_tenancy_tenant ON public.tenancies(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenancy_provider ON public.tenancies(provider_id);
CREATE INDEX IF NOT EXISTS idx_tenancy_property ON public.tenancies(property_id);
CREATE INDEX IF NOT EXISTS idx_tenancy_unit ON public.tenancies(unit_id);
CREATE INDEX IF NOT EXISTS idx_tenancy_status ON public.tenancies(status);
CREATE INDEX IF NOT EXISTS idx_leases_tenancy ON public.leases(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_leases_status ON public.leases(status);
CREATE INDEX IF NOT EXISTS idx_move_in_tenancy ON public.move_in_records(tenancy_id);
CREATE INDEX IF NOT EXISTS idx_tenancy_hist_tenancy ON public.tenancy_status_history(tenancy_id);
