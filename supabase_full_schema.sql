-- =============================================================
-- HomeHunt Phase 0 — Identity, RBAC and Audit foundation
-- Conventions: UUID PKs, UTC timestamptz, created_at/updated_at,
-- explicit GRANTs, RLS on every table, security-definer role checks.
-- =============================================================

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA extensions;

-- ---------- shared trigger ----------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ---------- roles ----------
CREATE TYPE public.app_role AS ENUM (
  'tenant',
  'landlord',
  'agent',
  'property_manager',
  'verifier',
  'admin',
  'super_admin'
);

-- ---------- profiles ----------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone_number TEXT,
  preferred_county TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT profiles_full_name_length CHECK (full_name IS NULL OR char_length(full_name) <= 120),
  CONSTRAINT profiles_phone_format CHECK (phone_number IS NULL OR phone_number ~ '^\+?[0-9]{9,15}$')
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- user_roles ----------
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE INDEX user_roles_user_id_idx ON public.user_roles (user_id);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ---------- authorization helpers (security definer, RLS-safe) ----------
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_platform_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_roles()
RETURNS SETOF public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_roles() TO authenticated, service_role;

-- ---------- profiles policies ----------
CREATE POLICY "profiles_select_authenticated"
ON public.profiles FOR SELECT TO authenticated
USING (true);

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.is_platform_admin(auth.uid()))
WITH CHECK (id = auth.uid() OR public.is_platform_admin(auth.uid()));

-- ---------- user_roles policies ----------
CREATE POLICY "user_roles_select_own_or_admin"
ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()));

-- ---------- audit_logs ----------
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  before_data JSONB,
  after_data JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT audit_logs_action_length CHECK (char_length(action) BETWEEN 1 AND 120),
  CONSTRAINT audit_logs_resource_type_length CHECK (char_length(resource_type) BETWEEN 1 AND 120)
);

CREATE INDEX audit_logs_actor_id_created_at_idx ON public.audit_logs (actor_id, created_at DESC);
CREATE INDEX audit_logs_resource_idx ON public.audit_logs (resource_type, resource_id);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Append-only: writes happen server-side with the service role only.
CREATE POLICY "audit_logs_select_admin"
ON public.audit_logs FOR SELECT TO authenticated
USING (public.is_platform_admin(auth.uid()));

-- ---------- signup wiring ----------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone_number)
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone_number', '')
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'tenant')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();-- Trigger-only functions must not be callable through the API at all.
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Authorization helpers: signed-in users only (used by RLS policies and app code).
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_platform_admin(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_user_roles() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_roles() TO authenticated, service_role;-- =============================================================
-- HomeHunt Phase 1 — Identity, RBAC and Session migrations
-- =============================================================

-- 1. Create account_status enum type
CREATE TYPE public.account_status AS ENUM (
  'PENDING_VERIFICATION',
  'ACTIVE',
  'SUSPENDED',
  'DEACTIVATED',
  'LOCKED'
);

-- 2. Alter profiles to support Phase 1 fields
ALTER TABLE public.profiles 
  ADD COLUMN first_name TEXT,
  ADD COLUMN last_name TEXT,
  ADD COLUMN display_name TEXT,
  ADD COLUMN bio TEXT,
  ADD COLUMN county TEXT,
  ADD COLUMN town TEXT,
  ADD COLUMN preferred_language TEXT NOT NULL DEFAULT 'en',
  ADD COLUMN status public.account_status NOT NULL DEFAULT 'PENDING_VERIFICATION',
  ADD COLUMN last_login_at TIMESTAMPTZ,
  ADD COLUMN deleted_at TIMESTAMPTZ;

-- Add length constraints
ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_first_name_length CHECK (first_name IS NULL OR char_length(first_name) <= 60),
  ADD CONSTRAINT profiles_last_name_length CHECK (last_name IS NULL OR char_length(last_name) <= 60),
  ADD CONSTRAINT profiles_display_name_length CHECK (display_name IS NULL OR char_length(display_name) <= 60),
  ADD CONSTRAINT profiles_county_length CHECK (county IS NULL OR char_length(county) <= 60),
  ADD CONSTRAINT profiles_town_length CHECK (town IS NULL OR char_length(town) <= 60),
  ADD CONSTRAINT profiles_language_length CHECK (char_length(preferred_language) <= 10);

-- 3. Create permissions table
CREATE TABLE public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT permissions_name_length CHECK (char_length(name) BETWEEN 3 AND 60)
);

GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "permissions_select_authenticated"
  ON public.permissions FOR SELECT TO authenticated
  USING (true);

-- 4. Create role_permissions table
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role public.app_role NOT NULL,
  permission_name TEXT NOT NULL REFERENCES public.permissions(name) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (role, permission_name)
);

GRANT SELECT ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_select_authenticated"
  ON public.role_permissions FOR SELECT TO authenticated
  USING (true);

-- 5. Create verification_tokens table (for email verification)
CREATE TABLE public.verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX verification_tokens_hash_idx ON public.verification_tokens (token_hash);
CREATE INDEX verification_tokens_user_idx ON public.verification_tokens (user_id);

GRANT ALL ON public.verification_tokens TO service_role;
ALTER TABLE public.verification_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verification_tokens_select_admin"
  ON public.verification_tokens FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- 6. Create password_reset_tokens table
CREATE TABLE public.password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX password_reset_tokens_hash_idx ON public.password_reset_tokens (token_hash);
CREATE INDEX password_reset_tokens_user_idx ON public.password_reset_tokens (user_id);

GRANT ALL ON public.password_reset_tokens TO service_role;
ALTER TABLE public.password_reset_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "password_reset_tokens_select_admin"
  ON public.password_reset_tokens FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- 7. Create sessions table
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token_hash TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  ip_address INET,
  user_agent TEXT
);

CREATE INDEX sessions_user_id_idx ON public.sessions (user_id);
CREATE INDEX sessions_token_hash_idx ON public.sessions (session_token_hash);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_select_own_or_admin"
  ON public.sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()));

CREATE POLICY "sessions_insert_own"
  ON public.sessions FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "sessions_update_own_or_admin"
  ON public.sessions FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()))
  WITH CHECK (user_id = auth.uid() OR public.is_platform_admin(auth.uid()));

-- 8. Create authorization check helper function
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    WHERE ur.user_id = _user_id AND rp.permission_name = _permission
  );
$$;

REVOKE ALL ON FUNCTION public.has_permission(UUID, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_permission(UUID, TEXT) TO authenticated, service_role;

-- 9. Update signup trigger to capture selected role & verification status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  selected_role TEXT;
  initial_status public.account_status;
BEGIN
  -- 1. Resolve selected role from metadata, enforce self-selectable options
  selected_role := NULLIF(NEW.raw_user_meta_data ->> 'role', '');
  IF selected_role IS NULL OR selected_role NOT IN ('tenant', 'landlord', 'agent') THEN
    selected_role := 'tenant';
  END IF;

  -- 2. Resolve initial account status based on email verification state
  IF NEW.email_confirmed_at IS NOT NULL THEN
    initial_status := 'ACTIVE';
  ELSE
    initial_status := 'PENDING_VERIFICATION';
  END IF;

  -- 3. Insert profile record
  INSERT INTO public.profiles (
    id, 
    full_name, 
    first_name, 
    last_name, 
    phone_number, 
    status
  )
  VALUES (
    NEW.id,
    NULLIF(NEW.raw_user_meta_data ->> 'full_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'first_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'last_name', ''),
    NULLIF(NEW.raw_user_meta_data ->> 'phone_number', ''),
    initial_status
  )
  ON CONFLICT (id) DO NOTHING;

  -- 4. Assign the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, selected_role::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$$;

-- 10. Create user update trigger to automatically active profiles when email is confirmed
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email_confirmed_at IS NOT NULL AND OLD.email_confirmed_at IS NULL THEN
    UPDATE public.profiles
    SET status = 'ACTIVE'::public.account_status
    WHERE id = NEW.id AND status = 'PENDING_VERIFICATION'::public.account_status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- 11. Seed Permissions
INSERT INTO public.permissions (name, description) VALUES
  ('USER_VIEW_SELF', 'Can view their own credentials and logs'),
  ('USER_UPDATE_SELF', 'Can update their own credentials'),
  ('USER_CHANGE_PASSWORD', 'Can change their own password'),
  ('PROFILE_VIEW_SELF', 'Can view their own profile'),
  ('PROFILE_UPDATE_SELF', 'Can update their own profile information'),
  ('SESSION_VIEW_SELF', 'Can view their active sessions'),
  ('SESSION_REVOKE_SELF', 'Can revoke their own active sessions'),
  ('ADMIN_VIEW_USERS', 'Can list and view users on the platform'),
  ('ADMIN_SUSPEND_USER', 'Can temporarily suspend or restore users'),
  ('ADMIN_ASSIGN_ROLE', 'Can assign administrative or support roles to accounts'),
  ('ADMIN_REMOVE_ROLE', 'Can remove roles from accounts'),
  ('PROPERTY_CREATE', 'Can create property records'),
  ('PROPERTY_VIEW', 'Can view property records'),
  ('PROPERTY_UPDATE', 'Can modify property details'),
  ('PROPERTY_ARCHIVE', 'Can archive property records'),
  ('LISTING_CREATE', 'Can create marketplace listing records'),
  ('LISTING_UPDATE', 'Can update marketplace listing details'),
  ('LISTING_PUBLISH', 'Can publish marketplace listing records')
ON CONFLICT (name) DO NOTHING;

-- 12. Seed Role Permission Mappings
-- tenant
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('tenant', 'USER_VIEW_SELF'),
  ('tenant', 'USER_UPDATE_SELF'),
  ('tenant', 'USER_CHANGE_PASSWORD'),
  ('tenant', 'PROFILE_VIEW_SELF'),
  ('tenant', 'PROFILE_UPDATE_SELF'),
  ('tenant', 'SESSION_VIEW_SELF'),
  ('tenant', 'SESSION_REVOKE_SELF')
ON CONFLICT (role, permission_name) DO NOTHING;

-- landlord
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('landlord', 'USER_VIEW_SELF'),
  ('landlord', 'USER_UPDATE_SELF'),
  ('landlord', 'USER_CHANGE_PASSWORD'),
  ('landlord', 'PROFILE_VIEW_SELF'),
  ('landlord', 'PROFILE_UPDATE_SELF'),
  ('landlord', 'SESSION_VIEW_SELF'),
  ('landlord', 'SESSION_REVOKE_SELF'),
  ('landlord', 'PROPERTY_CREATE'),
  ('landlord', 'PROPERTY_VIEW'),
  ('landlord', 'PROPERTY_UPDATE'),
  ('landlord', 'PROPERTY_ARCHIVE'),
  ('landlord', 'LISTING_CREATE'),
  ('landlord', 'LISTING_UPDATE'),
  ('landlord', 'LISTING_PUBLISH')
ON CONFLICT (role, permission_name) DO NOTHING;

-- agent
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('agent', 'USER_VIEW_SELF'),
  ('agent', 'USER_UPDATE_SELF'),
  ('agent', 'USER_CHANGE_PASSWORD'),
  ('agent', 'PROFILE_VIEW_SELF'),
  ('agent', 'PROFILE_UPDATE_SELF'),
  ('agent', 'SESSION_VIEW_SELF'),
  ('agent', 'SESSION_REVOKE_SELF'),
  ('agent', 'PROPERTY_CREATE'),
  ('agent', 'PROPERTY_VIEW'),
  ('agent', 'PROPERTY_UPDATE'),
  ('agent', 'PROPERTY_ARCHIVE'),
  ('agent', 'LISTING_CREATE'),
  ('agent', 'LISTING_UPDATE'),
  ('agent', 'LISTING_PUBLISH')
ON CONFLICT (role, permission_name) DO NOTHING;

-- property_manager
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('property_manager', 'USER_VIEW_SELF'),
  ('property_manager', 'USER_UPDATE_SELF'),
  ('property_manager', 'USER_CHANGE_PASSWORD'),
  ('property_manager', 'PROFILE_VIEW_SELF'),
  ('property_manager', 'PROFILE_UPDATE_SELF'),
  ('property_manager', 'SESSION_VIEW_SELF'),
  ('property_manager', 'SESSION_REVOKE_SELF'),
  ('property_manager', 'PROPERTY_CREATE'),
  ('property_manager', 'PROPERTY_VIEW'),
  ('property_manager', 'PROPERTY_UPDATE'),
  ('property_manager', 'PROPERTY_ARCHIVE'),
  ('property_manager', 'LISTING_CREATE'),
  ('property_manager', 'LISTING_UPDATE'),
  ('property_manager', 'LISTING_PUBLISH')
ON CONFLICT (role, permission_name) DO NOTHING;

-- verifier
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('verifier', 'USER_VIEW_SELF'),
  ('verifier', 'USER_UPDATE_SELF'),
  ('verifier', 'USER_CHANGE_PASSWORD'),
  ('verifier', 'PROFILE_VIEW_SELF'),
  ('verifier', 'PROFILE_UPDATE_SELF'),
  ('verifier', 'SESSION_VIEW_SELF'),
  ('verifier', 'SESSION_REVOKE_SELF'),
  ('verifier', 'PROPERTY_VIEW')
ON CONFLICT (role, permission_name) DO NOTHING;

-- admin
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('admin', 'USER_VIEW_SELF'),
  ('admin', 'USER_UPDATE_SELF'),
  ('admin', 'USER_CHANGE_PASSWORD'),
  ('admin', 'PROFILE_VIEW_SELF'),
  ('admin', 'PROFILE_UPDATE_SELF'),
  ('admin', 'SESSION_VIEW_SELF'),
  ('admin', 'SESSION_REVOKE_SELF'),
  ('admin', 'ADMIN_VIEW_USERS'),
  ('admin', 'ADMIN_SUSPEND_USER'),
  ('admin', 'ADMIN_ASSIGN_ROLE'),
  ('admin', 'ADMIN_REMOVE_ROLE'),
  ('admin', 'PROPERTY_VIEW')
ON CONFLICT (role, permission_name) DO NOTHING;

-- super_admin
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('super_admin', 'USER_VIEW_SELF'),
  ('super_admin', 'USER_UPDATE_SELF'),
  ('super_admin', 'USER_CHANGE_PASSWORD'),
  ('super_admin', 'PROFILE_VIEW_SELF'),
  ('super_admin', 'PROFILE_UPDATE_SELF'),
  ('super_admin', 'SESSION_VIEW_SELF'),
  ('super_admin', 'SESSION_REVOKE_SELF'),
  ('super_admin', 'ADMIN_VIEW_USERS'),
  ('super_admin', 'ADMIN_SUSPEND_USER'),
  ('super_admin', 'ADMIN_ASSIGN_ROLE'),
  ('super_admin', 'ADMIN_REMOVE_ROLE'),
  ('super_admin', 'PROPERTY_CREATE'),
  ('super_admin', 'PROPERTY_VIEW'),
  ('super_admin', 'PROPERTY_UPDATE'),
  ('super_admin', 'PROPERTY_ARCHIVE'),
  ('super_admin', 'LISTING_CREATE'),
  ('super_admin', 'LISTING_UPDATE'),
  ('super_admin', 'LISTING_PUBLISH')
ON CONFLICT (role, permission_name) DO NOTHING;
-- =============================================================
-- HomeHunt Phase 2 — Property & Listing Management Migrations
-- =============================================================

-- 1. Create enum types
CREATE TYPE public.property_status AS ENUM (
  'DRAFT',
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED'
);

CREATE TYPE public.property_type AS ENUM (
  'APARTMENT',
  'HOUSE',
  'BEDSITTER',
  'STUDIO',
  'MAISONETTE',
  'TOWNHOUSE',
  'VILLA',
  'BUNGALOW',
  'ROOM',
  'SHARED_ACCOMMODATION',
  'OTHER'
);

CREATE TYPE public.unit_status AS ENUM (
  'DRAFT',
  'AVAILABLE',
  'RESERVED',
  'OCCUPIED',
  'MAINTENANCE',
  'UNAVAILABLE',
  'ARCHIVED'
);

CREATE TYPE public.unit_type AS ENUM (
  'BEDSITTER',
  'STUDIO',
  'ONE_BEDROOM',
  'TWO_BEDROOM',
  'THREE_BEDROOM',
  'FOUR_PLUS_BEDROOM',
  'ROOM',
  'SHARED',
  'HOUSE',
  'OTHER'
);

CREATE TYPE public.listing_status AS ENUM (
  'DRAFT',
  'PENDING_REVIEW',
  'PUBLISHED',
  'PAUSED',
  'EXPIRED',
  'ARCHIVED'
);

CREATE TYPE public.listing_type AS ENUM (
  'FOR_RENT',
  'FOR_SALE'
);

CREATE TYPE public.billing_period AS ENUM (
  'MONTHLY',
  'WEEKLY',
  'DAILY',
  'YEARLY'
);

CREATE TYPE public.relationship_type AS ENUM (
  'OWNER',
  'AGENT',
  'PROPERTY_MANAGER'
);

CREATE TYPE public.relationship_status AS ENUM (
  'ACTIVE',
  'PENDING',
  'REVOKED'
);

CREATE TYPE public.media_type AS ENUM (
  'IMAGE',
  'VIDEO',
  'FLOOR_PLAN',
  'DOCUMENT'
);

-- 2. Create properties table
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_type public.property_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status public.property_status NOT NULL DEFAULT 'DRAFT',
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Geographic location
  country TEXT NOT NULL DEFAULT 'Kenya',
  county TEXT NOT NULL,
  town TEXT NOT NULL,
  neighborhood TEXT,
  estate TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  landmark_description TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT properties_name_length CHECK (char_length(name) BETWEEN 3 AND 100),
  CONSTRAINT properties_county_length CHECK (char_length(county) BETWEEN 2 AND 60),
  CONSTRAINT properties_town_length CHECK (char_length(town) BETWEEN 2 AND 60),
  CONSTRAINT properties_latitude_range CHECK (latitude IS NULL OR (latitude BETWEEN -90.0 AND 90.0)),
  CONSTRAINT properties_longitude_range CHECK (longitude IS NULL OR (longitude BETWEEN -180.0 AND 180.0))
);

CREATE INDEX properties_owner_idx ON public.properties (owner_user_id);
CREATE INDEX properties_status_idx ON public.properties (status);
CREATE INDEX properties_type_idx ON public.properties (property_type);
CREATE INDEX properties_county_town_idx ON public.properties (county, town);

-- 3. Create buildings table
CREATE TABLE public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  floors INTEGER CHECK (floors IS NULL OR floors > 0),
  year_built INTEGER CHECK (year_built IS NULL OR (year_built BETWEEN 1900 AND 2100)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT buildings_name_length CHECK (char_length(name) BETWEEN 1 AND 100)
);

CREATE INDEX buildings_property_idx ON public.buildings (property_id);

-- 4. Create units table
CREATE TABLE public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  unit_type public.unit_type NOT NULL,
  floor INTEGER,
  bedrooms INTEGER NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms INTEGER NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
  area NUMERIC CHECK (area IS NULL OR area > 0),
  status public.unit_status NOT NULL DEFAULT 'DRAFT',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT units_number_length CHECK (char_length(unit_number) BETWEEN 1 AND 30)
);

-- Unique index to prevent duplicate unit numbers within the same property/building
CREATE UNIQUE INDEX units_property_building_number_idx ON public.units (
  property_id, 
  COALESCE(building_id, '00000000-0000-0000-0000-000000000000'::uuid), 
  unit_number
) WHERE (deleted_at IS NULL);

CREATE INDEX units_property_idx ON public.units (property_id);
CREATE INDEX units_building_idx ON public.units (building_id);
CREATE INDEX units_status_idx ON public.units (status);

-- 5. Create property_amenities table (normalized many-to-many)
CREATE TABLE public.property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, amenity)
);

-- 6. Create unit_amenities table
CREATE TABLE public.unit_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  amenity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (unit_id, amenity)
);

-- 7. Create property_parties table
CREATE TABLE public.property_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type public.relationship_type NOT NULL,
  status public.relationship_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (property_id, user_id, relationship_type)
);

CREATE INDEX property_parties_property_user_idx ON public.property_parties (property_id, user_id);

-- 8. Create listings table
CREATE TABLE public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  listing_type public.listing_type NOT NULL DEFAULT 'FOR_RENT',
  status public.listing_status NOT NULL DEFAULT 'DRAFT',
  price NUMERIC NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'KES',
  billing_period public.billing_period NOT NULL DEFAULT 'MONTHLY',
  deposit_amount NUMERIC CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
  availability_date DATE NOT NULL,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT listings_title_length CHECK (char_length(title) BETWEEN 5 AND 120),
  CONSTRAINT listings_currency_length CHECK (char_length(currency) = 3)
);

CREATE INDEX listings_property_idx ON public.listings (property_id);
CREATE INDEX listings_unit_idx ON public.listings (unit_id);
CREATE INDEX listings_status_idx ON public.listings (status);
CREATE INDEX listings_price_idx ON public.listings (price);
CREATE INDEX listings_availability_idx ON public.listings (availability_date);

-- 9. Create property_media table
CREATE TABLE public.property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  media_type public.media_type NOT NULL DEFAULT 'IMAGE',
  url TEXT NOT NULL,
  storage_key TEXT,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT property_media_owner_presence CHECK (
    (property_id IS NOT NULL) OR 
    (unit_id IS NOT NULL) OR 
    (listing_id IS NOT NULL)
  ),
  CONSTRAINT property_media_url_check CHECK (url LIKE 'http%')
);

CREATE INDEX property_media_property_idx ON public.property_media (property_id);
CREATE INDEX property_media_unit_idx ON public.property_media (unit_id);
CREATE INDEX property_media_listing_idx ON public.property_media (listing_id);

-- =============================================================
-- Row Level Security (RLS) Configuration
-- =============================================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;

-- Select helper policies to verify active property parties
CREATE OR REPLACE FUNCTION public.is_active_property_party(_property_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_parties
    WHERE property_id = _property_id AND user_id = _user_id AND status = 'ACTIVE'
  );
$$;

-- Explicit Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT SELECT ON public.properties TO anon;
GRANT ALL ON public.properties TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.buildings TO authenticated;
GRANT SELECT ON public.buildings TO anon;
GRANT ALL ON public.buildings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.units TO authenticated;
GRANT SELECT ON public.units TO anon;
GRANT ALL ON public.units TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_amenities TO authenticated;
GRANT SELECT ON public.property_amenities TO anon;
GRANT ALL ON public.property_amenities TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_amenities TO authenticated;
GRANT SELECT ON public.unit_amenities TO anon;
GRANT ALL ON public.unit_amenities TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_parties TO authenticated;
GRANT SELECT ON public.property_parties TO anon;
GRANT ALL ON public.property_parties TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT SELECT ON public.listings TO anon;
GRANT ALL ON public.listings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_media TO authenticated;
GRANT SELECT ON public.property_media TO anon;
GRANT ALL ON public.property_media TO service_role;

-- 1. Properties RLS Policies
CREATE POLICY "properties_select_all"
  ON public.properties FOR SELECT TO public
  USING (
    status = 'ACTIVE' 
    OR owner_user_id = auth.uid() 
    OR created_by_user_id = auth.uid()
    OR public.is_active_property_party(id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "properties_insert"
  ON public.properties FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = auth.uid()
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "properties_write"
  ON public.properties FOR UPDATE TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR public.is_active_property_party(id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  )
  WITH CHECK (
    owner_user_id = auth.uid()
    OR public.is_active_property_party(id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

-- 2. Buildings RLS Policies
CREATE POLICY "buildings_select_all"
  ON public.buildings FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id)
  );

CREATE POLICY "buildings_write"
  ON public.buildings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

-- 3. Units RLS Policies
CREATE POLICY "units_select_all"
  ON public.units FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id)
  );

CREATE POLICY "units_write"
  ON public.units FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

-- 4. Property Amenities Policies
CREATE POLICY "prop_amenities_select"
  ON public.property_amenities FOR SELECT TO public
  USING (true);

CREATE POLICY "prop_amenities_write"
  ON public.property_amenities FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

-- 5. Unit Amenities Policies
CREATE POLICY "unit_amenities_select"
  ON public.unit_amenities FOR SELECT TO public
  USING (true);

CREATE POLICY "unit_amenities_write"
  ON public.unit_amenities FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON u.property_id = p.id
      WHERE u.id = unit_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

-- 6. Listings RLS Policies
CREATE POLICY "listings_select_all"
  ON public.listings FOR SELECT TO public
  USING (
    status = 'PUBLISHED'
    OR created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "listings_write"
  ON public.listings FOR ALL TO authenticated
  USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR public.is_platform_admin(auth.uid())
  );

-- 7. Property Media Policies
CREATE POLICY "media_select_all"
  ON public.property_media FOR SELECT TO public
  USING (true);

CREATE POLICY "media_write"
  ON public.property_media FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON u.property_id = p.id
      WHERE u.id = unit_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.properties p ON l.property_id = p.id
      WHERE l.id = listing_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR public.is_platform_admin(auth.uid())
  );

-- 8. Property Parties RLS Policies
CREATE POLICY "parties_select_all"
  ON public.property_parties FOR SELECT TO public
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

CREATE POLICY "parties_write"
  ON public.property_parties FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_platform_admin(auth.uid())
      )
    )
  );
-- =============================================================
-- HomeHunt Phase 3 — Discovery & Search Migrations
-- =============================================================

-- 1. Create tables

-- Saved Searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT saved_searches_user_name_idx UNIQUE (user_id, name)
);

-- Favorites (Saved Homes)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT favorites_user_listing_idx UNIQUE (user_id, listing_id)
);

-- Search Analytics Events
CREATE TABLE IF NOT EXISTS public.search_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics_events ENABLE ROW LEVEL SECURITY;

-- Explicit Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT ALL ON public.saved_searches TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;

GRANT INSERT ON public.search_analytics_events TO public;
GRANT SELECT ON public.search_analytics_events TO service_role;

-- Policies

-- Saved Searches
CREATE POLICY "saved_searches_owner"
  ON public.saved_searches FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Favorites
CREATE POLICY "favorites_owner"
  ON public.favorites FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Analytics
CREATE POLICY "analytics_insert"
  ON public.search_analytics_events FOR INSERT TO public
  WITH CHECK (true);

-- 3. Create missing search indexes
CREATE INDEX IF NOT EXISTS properties_neighborhood_idx ON public.properties (neighborhood) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS properties_estate_idx ON public.properties (estate) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS units_bedrooms_idx ON public.units (bedrooms) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS units_bathrooms_idx ON public.units (bathrooms) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS units_unit_type_idx ON public.units (unit_type) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings (created_at) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS listings_published_at_idx ON public.listings (published_at) WHERE (deleted_at IS NULL);

-- 4. Create search view joining listing, property, and unit
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

-- =============================================================
-- HomeHunt Phase 4 — Verification & Trust Layer
-- =============================================================

-- Enums
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

-- Alter Existing Tables
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

-- Verifications Table
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

CREATE OR REPLACE TRIGGER verifications_set_updated_at
BEFORE UPDATE ON public.verifications
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS verifications_active_subj_type_idx 
ON public.verifications (subject_id, verification_type) 
WHERE (status IN ('PENDING', 'UNDER_REVIEW', 'VERIFIED'));

-- Verification Evidence Table
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

-- Verification History Table
CREATE TABLE IF NOT EXISTS public.verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.verifications(id) ON DELETE CASCADE,
  status public.verification_status NOT NULL,
  changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Property Claim Table
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

-- Listing Report Table
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

-- Internal Risk Flag Table
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

-- Appeals Table
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

-- Polymorphic Checks Trigger
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

-- Row Level Security
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_appeals ENABLE ROW LEVEL SECURITY;

-- Policies
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

CREATE POLICY "risk_flags_admin_policy" ON public.risk_flags
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()) OR public.has_role(auth.uid(), 'verifier'));

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

-- Grants
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

-- Seed permissions
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

-- Map permissions
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


-- =============================================================
-- HomeHunt Phase 5 — Intelligent Housing Matching Schemas
-- =============================================================

-- 1. Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  min_budget NUMERIC,
  max_budget NUMERIC,
  preferred_budget NUMERIC,
  property_types VARCHAR[],
  bedrooms INT,
  bedrooms_rule VARCHAR DEFAULT 'MIN',
  bathrooms INT,
  bathrooms_rule VARCHAR DEFAULT 'MIN',
  move_in_date DATE,
  preferred_locations JSONB DEFAULT '[]'::jsonb,
  amenities JSONB DEFAULT '[]'::jsonb,
  furnishing_preference VARCHAR DEFAULT 'ANY',
  priority_weights JSONB DEFAULT '{}'::jsonb,
  use_behavioral_personalization BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create saved_searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create recommendation_feedback table
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  feedback_type VARCHAR NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_listing_feedback UNIQUE (user_id, listing_id, feedback_type)
);

-- 4. Create recommendation_history table
CREATE TABLE IF NOT EXISTS public.recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  shown_at TIMESTAMPTZ DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  saved_at TIMESTAMPTZ,
  hidden_at TIMESTAMPTZ
);

-- 5. Row Level Security Policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own saved searches" ON public.saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved searches" ON public.saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches" ON public.saved_searches
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches" ON public.saved_searches
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own feedback" ON public.recommendation_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON public.recommendation_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own history" ON public.recommendation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" ON public.recommendation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history" ON public.recommendation_history
  FOR UPDATE USING (auth.uid() = user_id);

-- Triggers
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

CREATE TRIGGER set_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

-- Grants
GRANT ALL ON TABLE public.user_preferences TO authenticated, service_role;
GRANT ALL ON TABLE public.saved_searches TO authenticated, service_role;
GRANT ALL ON TABLE public.recommendation_feedback TO authenticated, service_role;
GRANT ALL ON TABLE public.recommendation_history TO authenticated, service_role;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_prefs_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_user_id ON public.recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_listing_id ON public.recommendation_feedback(listing_id);
CREATE INDEX IF NOT EXISTS idx_rec_history_user_id ON public.recommendation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_history_listing_id ON public.recommendation_history(listing_id);

