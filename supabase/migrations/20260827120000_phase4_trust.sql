-- =============================================================
-- HomeHunt Phase 4 — Verification & Trust Layer Migrations
-- =============================================================

-- 1. Create Enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_status') THEN
    CREATE TYPE public.verification_status AS ENUM (
      'UNVERIFIED', 'PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED', 'EXPIRED', 'REVOKED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'verification_type') THEN
    CREATE TYPE public.verification_type AS ENUM (
      'IDENTITY', 'PROPERTY_OWNERSHIP', 'PROPERTY_EXISTENCE', 'LISTING', 'CONTACT', 'AGENT', 'LANDLORD'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'evidence_status') THEN
    CREATE TYPE public.evidence_status AS ENUM (
      'PENDING', 'APPROVED', 'REJECTED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_freshness_status') THEN
    CREATE TYPE public.listing_freshness_status AS ENUM (
      'CURRENT', 'STALE', 'REQUIRES_REVALIDATION', 'EXPIRED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'report_status') THEN
    CREATE TYPE public.report_status AS ENUM (
      'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED', 'ESCALATED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_severity') THEN
    CREATE TYPE public.risk_severity AS ENUM (
      'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'risk_status') THEN
    CREATE TYPE public.risk_status AS ENUM (
      'OPEN', 'RESOLVED', 'DISMISSED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'claim_status') THEN
    CREATE TYPE public.claim_status AS ENUM (
      'PENDING', 'APPROVED', 'REJECTED', 'WITHDRAWN'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appeal_status') THEN
    CREATE TYPE public.appeal_status AS ENUM (
      'APPEAL_SUBMITTED', 'UNDER_REVIEW', 'UPHELD', 'REVERSED'
    );
  END IF;
END
$$;

-- 2. Alter Existing Tables to support trust fields
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS identity_verified BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS agent_verified BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS verification_status public.verification_status NOT NULL DEFAULT 'UNVERIFIED';

ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS verification_status public.verification_status NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN IF NOT EXISTS freshness_status public.listing_freshness_status NOT NULL DEFAULT 'CURRENT',
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS price_confirmed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS availability_confirmed_at TIMESTAMPTZ;

-- 3. Create Verification Record Table
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type TEXT NOT NULL CHECK (subject_type IN ('USER', 'PROPERTY', 'LISTING')),
  subject_id UUID NOT NULL,
  verification_type public.verification_type NOT NULL,
  status public.verification_status NOT NULL DEFAULT 'PENDING',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  rejection_reason TEXT,
  revocation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger for updated_at
CREATE OR REPLACE TRIGGER verifications_set_updated_at
BEFORE UPDATE ON public.verifications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Prevent multiple active verifications for the same subject and verification type
CREATE UNIQUE INDEX IF NOT EXISTS verifications_active_subj_type_idx 
ON public.verifications (subject_id, verification_type) 
WHERE (status IN ('PENDING', 'UNDER_REVIEW', 'VERIFIED'));

-- 4. Create Verification Evidence Table
CREATE TABLE IF NOT EXISTS public.verification_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  evidence_type TEXT NOT NULL,
  storage_reference TEXT NOT NULL,
  submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status public.evidence_status NOT NULL DEFAULT 'PENDING',
  review_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER verification_evidence_set_updated_at
BEFORE UPDATE ON public.verification_evidence
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 5. Create Verification History Table
CREATE TABLE IF NOT EXISTS public.verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  status public.verification_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create Property Claim Table
CREATE TABLE IF NOT EXISTS public.property_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status public.claim_status NOT NULL DEFAULT 'PENDING',
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE OR REPLACE TRIGGER property_claims_set_updated_at
BEFORE UPDATE ON public.property_claims
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS property_claims_active_unique_idx
ON public.property_claims (property_id, user_id)
WHERE (status IN ('PENDING', 'APPROVED'));

-- 7. Create Listing Report Table
CREATE TABLE IF NOT EXISTS public.listing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  description TEXT,
  status public.report_status NOT NULL DEFAULT 'OPEN',
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE TRIGGER listing_reports_set_updated_at
BEFORE UPDATE ON public.listing_reports
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 8. Create Internal Risk Flag Table
CREATE TABLE IF NOT EXISTS public.risk_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type TEXT NOT NULL CHECK (subject_type IN ('USER', 'PROPERTY', 'LISTING')),
  subject_id UUID NOT NULL,
  risk_type TEXT NOT NULL,
  severity public.risk_severity NOT NULL DEFAULT 'LOW',
  status public.risk_status NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- 9. Create Appeals Table
CREATE TABLE IF NOT EXISTS public.moderation_appeals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type TEXT NOT NULL CHECK (target_type IN ('VERIFICATION', 'LISTING_SUSPENSION', 'PROPERTY_CLAIM')),
  target_id UUID NOT NULL,
  reason TEXT NOT NULL,
  status public.appeal_status NOT NULL DEFAULT 'APPEAL_SUBMITTED',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

CREATE OR REPLACE TRIGGER moderation_appeals_set_updated_at
BEFORE UPDATE ON public.moderation_appeals
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 10. Polymorphic Reference Checks Trigger Function
CREATE OR REPLACE FUNCTION public.check_verification_subject_exists()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subject_type = 'USER' THEN
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = NEW.subject_id) THEN
      RAISE EXCEPTION 'Referenced USER subject_id % does not exist in public.profiles', NEW.subject_id;
    END IF;
  ELSIF NEW.subject_type = 'PROPERTY' THEN
    IF NOT EXISTS (SELECT 1 FROM public.properties WHERE id = NEW.subject_id) THEN
      RAISE EXCEPTION 'Referenced PROPERTY subject_id % does not exist in public.properties', NEW.subject_id;
    END IF;
  ELSIF NEW.subject_type = 'LISTING' THEN
    IF NOT EXISTS (SELECT 1 FROM public.listings WHERE id = NEW.subject_id) THEN
      RAISE EXCEPTION 'Referenced LISTING subject_id % does not exist in public.listings', NEW.subject_id;
    END IF;
  ELSE
    RAISE EXCEPTION 'Invalid subject_type: %', NEW.subject_type;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER verifications_polymorphic_check
BEFORE INSERT OR UPDATE ON public.verifications
FOR EACH ROW EXECUTE FUNCTION public.check_verification_subject_exists();

CREATE OR REPLACE TRIGGER risk_flags_polymorphic_check
BEFORE INSERT OR UPDATE ON public.risk_flags
FOR EACH ROW EXECUTE FUNCTION public.check_verification_subject_exists();

-- 11. Row Level Security Policies
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_appeals ENABLE ROW LEVEL SECURITY;

-- Verifications Policies
CREATE POLICY "verifications_select_policy" ON public.verifications
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'verifier') OR
    (subject_type = 'USER' AND subject_id = auth.uid()) OR
    (subject_type = 'PROPERTY' AND (
      SELECT owner_user_id FROM public.properties WHERE id = subject_id
    ) = auth.uid()) OR
    (subject_type = 'LISTING' AND (
      SELECT created_by_user_id FROM public.listings WHERE id = subject_id
    ) = auth.uid())
  );

CREATE POLICY "verifications_insert_own" ON public.verifications
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_platform_admin(auth.uid()) OR
    (subject_type = 'USER' AND subject_id = auth.uid()) OR
    (subject_type = 'PROPERTY' AND (
      SELECT owner_user_id FROM public.properties WHERE id = subject_id
    ) = auth.uid()) OR
    (subject_type = 'LISTING' AND (
      SELECT created_by_user_id FROM public.listings WHERE id = subject_id
    ) = auth.uid())
  );

CREATE POLICY "verifications_update_admin" ON public.verifications
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_role(auth.uid(), 'verifier'));

-- Evidence Policies
CREATE POLICY "evidence_select_policy" ON public.verification_evidence
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'verifier') OR
    submitted_by = auth.uid()
  );

CREATE POLICY "evidence_insert_own" ON public.verification_evidence
  FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "evidence_update_admin" ON public.verification_evidence
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_role(auth.uid(), 'verifier'));

-- Property Claims Policies
CREATE POLICY "property_claims_select_policy" ON public.property_claims
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'verifier') OR
    user_id = auth.uid()
  );

CREATE POLICY "property_claims_insert_own" ON public.property_claims
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "property_claims_update_admin" ON public.property_claims
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_role(auth.uid(), 'verifier'));

-- Reports Policies
CREATE POLICY "listing_reports_select_policy" ON public.listing_reports
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'verifier') OR
    reporter_id = auth.uid()
  );

CREATE POLICY "listing_reports_insert_own" ON public.listing_reports
  FOR INSERT TO authenticated
  WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "listing_reports_update_admin" ON public.listing_reports
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_role(auth.uid(), 'verifier'));

-- Risk Flags Policies
CREATE POLICY "risk_flags_admin_policy" ON public.risk_flags
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_role(auth.uid(), 'verifier'));

-- Appeals Policies
CREATE POLICY "appeals_select_policy" ON public.moderation_appeals
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'verifier') OR
    user_id = auth.uid()
  );

CREATE POLICY "appeals_insert_own" ON public.moderation_appeals
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "appeals_update_admin" ON public.moderation_appeals
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_role(auth.uid(), 'verifier'));

-- History Policies
CREATE POLICY "verification_history_select_policy" ON public.verification_history
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'verifier') OR
    EXISTS (
      SELECT 1 FROM public.verifications v 
      WHERE v.id = verification_id AND (
        (v.subject_type = 'USER' AND v.subject_id = auth.uid()) OR
        (v.subject_type = 'PROPERTY' AND (
          SELECT owner_user_id FROM public.properties WHERE id = v.subject_id
        ) = auth.uid()) OR
        (v.subject_type = 'LISTING' AND (
          SELECT created_by_user_id FROM public.listings WHERE id = v.subject_id
        ) = auth.uid())
      )
    )
  );

-- 12. Storage Bucket Creation and Policies
-- Create bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'verification_evidence', 
  'verification_evidence', 
  false, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Bucket Upload Policy
CREATE POLICY "Allow users to upload own evidence folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'verification_evidence' AND
  (split_part(name, '/', 1)) = auth.uid()::text
);

-- Bucket Read Policy
CREATE POLICY "Allow users to read own evidence folder or admins/verifiers"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'verification_evidence' AND
  (
    (split_part(name, '/', 1)) = auth.uid()::text OR 
    public.is_platform_admin(auth.uid()) OR 
    public.has_role(auth.uid(), 'verifier')
  )
);

-- 13. Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.verifications TO authenticated;
GRANT ALL ON public.verifications TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.verification_evidence TO authenticated;
GRANT ALL ON public.verification_evidence TO service_role;

GRANT SELECT, INSERT ON public.verification_history TO authenticated;
GRANT ALL ON public.verification_history TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_claims TO authenticated;
GRANT ALL ON public.property_claims TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.listing_reports TO authenticated;
GRANT ALL ON public.listing_reports TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.risk_flags TO authenticated;
GRANT ALL ON public.risk_flags TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.moderation_appeals TO authenticated;
GRANT ALL ON public.moderation_appeals TO service_role;

-- 14. Update listings_search_view to support trust & freshness DTO mapping
CREATE OR REPLACE VIEW public.listings_search_view AS
SELECT
  l.id AS listing_id,
  l.title AS listing_title,
  l.description AS listing_description,
  l.listing_type,
  l.status AS listing_status,
  l.price,
  l.currency,
  l.billing_period,
  l.deposit_amount,
  l.availability_date,
  l.published_at,
  l.created_at AS listing_created_at,
  l.deleted_at AS listing_deleted_at,
  l.verification_status AS listing_verification_status,
  l.freshness_status AS listing_freshness_status,
  l.last_verified_at AS listing_last_verified_at,
  l.price_confirmed_at,
  l.availability_confirmed_at,

  p.id AS property_id,
  p.property_type,
  p.name AS property_name,
  p.county,
  p.town,
  p.neighborhood,
  p.estate,
  p.address,
  p.latitude,
  p.longitude,
  p.landmark_description,
  p.verification_status AS property_verification_status,

  u.id AS unit_id,
  u.unit_type,
  u.floor,
  u.bedrooms,
  u.bathrooms,
  u.area,
  u.status AS unit_status,

  (SELECT COALESCE(identity_verified, false) FROM public.profiles WHERE id = p.owner_user_id) AS owner_identity_verified,
  (SELECT COALESCE(agent_verified, false) FROM public.profiles WHERE id = p.owner_user_id) AS owner_agent_verified,

  COALESCE(
    (
      SELECT array_agg(pa.amenity)
      FROM public.property_amenities pa
      WHERE pa.property_id = p.id
    ),
    '{}'::text[]
  ) AS property_amenities,

  COALESCE(
    (
      SELECT pm.url
      FROM public.property_media pm
      WHERE pm.listing_id = l.id AND pm.is_primary = true
      LIMIT 1
    ),
    (
      SELECT pm.url
      FROM public.property_media pm
      WHERE pm.unit_id = u.id AND pm.is_primary = true
      LIMIT 1
    ),
    (
      SELECT pm.url
      FROM public.property_media pm
      WHERE pm.property_id = p.id AND pm.is_primary = true
      LIMIT 1
    )
  ) AS primary_image_url
FROM public.listings l
JOIN public.properties p ON l.property_id = p.id
LEFT JOIN public.units u ON l.unit_id = u.id;

-- 15. Seed new permissions
INSERT INTO public.permissions (name, description) VALUES
  ('VERIFICATION_VIEW', 'Can view verification requests'),
  ('VERIFICATION_REVIEW', 'Can review and comment on verification requests'),
  ('VERIFICATION_APPROVE', 'Can approve verification requests'),
  ('VERIFICATION_REJECT', 'Can reject verification requests'),
  ('REPORTS_VIEW', 'Can view listing reports'),
  ('REPORTS_REVIEW', 'Can inspect listing reports'),
  ('REPORTS_RESOLVE', 'Can resolve listing reports'),
  ('CLAIMS_VIEW', 'Can view property claims'),
  ('CLAIMS_REVIEW', 'Can review property claims'),
  ('CLAIMS_RESOLVE', 'Can approve/reject property claims'),
  ('RISK_VIEW', 'Can view internal risk flags'),
  ('RISK_RESOLVE', 'Can dismiss/resolve internal risk flags'),
  ('APPEALS_VIEW', 'Can view moderation appeals'),
  ('APPEALS_RESOLVE', 'Can resolve moderation appeals'),
  ('LISTING_PAUSE', 'Can pause active listings'),
  ('LISTING_RESTORE', 'Can restore paused listings')
ON CONFLICT (name) DO NOTHING;

-- Map permissions to roles
-- verifier permissions
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('verifier', 'VERIFICATION_VIEW'),
  ('verifier', 'VERIFICATION_REVIEW'),
  ('verifier', 'REPORTS_VIEW'),
  ('verifier', 'REPORTS_REVIEW'),
  ('verifier', 'CLAIMS_VIEW'),
  ('verifier', 'CLAIMS_REVIEW'),
  ('verifier', 'RISK_VIEW'),
  ('verifier', 'APPEALS_VIEW')
ON CONFLICT (role, permission_name) DO NOTHING;

-- admin permissions
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('admin', 'VERIFICATION_VIEW'),
  ('admin', 'VERIFICATION_REVIEW'),
  ('admin', 'VERIFICATION_APPROVE'),
  ('admin', 'VERIFICATION_REJECT'),
  ('admin', 'REPORTS_VIEW'),
  ('admin', 'REPORTS_REVIEW'),
  ('admin', 'REPORTS_RESOLVE'),
  ('admin', 'CLAIMS_VIEW'),
  ('admin', 'CLAIMS_REVIEW'),
  ('admin', 'CLAIMS_RESOLVE'),
  ('admin', 'RISK_VIEW'),
  ('admin', 'RISK_RESOLVE'),
  ('admin', 'APPEALS_VIEW'),
  ('admin', 'APPEALS_RESOLVE'),
  ('admin', 'LISTING_PAUSE'),
  ('admin', 'LISTING_RESTORE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- super_admin permissions
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('super_admin', 'VERIFICATION_VIEW'),
  ('super_admin', 'VERIFICATION_REVIEW'),
  ('super_admin', 'VERIFICATION_APPROVE'),
  ('super_admin', 'VERIFICATION_REJECT'),
  ('super_admin', 'REPORTS_VIEW'),
  ('super_admin', 'REPORTS_REVIEW'),
  ('super_admin', 'REPORTS_RESOLVE'),
  ('super_admin', 'CLAIMS_VIEW'),
  ('super_admin', 'CLAIMS_REVIEW'),
  ('super_admin', 'CLAIMS_RESOLVE'),
  ('super_admin', 'RISK_VIEW'),
  ('super_admin', 'RISK_RESOLVE'),
  ('super_admin', 'APPEALS_VIEW'),
  ('super_admin', 'APPEALS_RESOLVE'),
  ('super_admin', 'LISTING_PAUSE'),
  ('super_admin', 'LISTING_RESTORE')
ON CONFLICT (role, permission_name) DO NOTHING;
