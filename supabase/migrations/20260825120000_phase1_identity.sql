-- =============================================================
-- HomeHunt Phase 1 — Identity, RBAC and Session migrations
-- =============================================================

-- 1. Create account_status enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'account_status') THEN
    CREATE TYPE public.account_status AS ENUM (
      'PENDING_VERIFICATION',
      'ACTIVE',
      'SUSPENDED',
      'DEACTIVATED',
      'LOCKED'
    );
  END IF;
END$$;

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
CREATE TABLE IF NOT EXISTS public.permissions (
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
CREATE TABLE IF NOT EXISTS public.role_permissions (
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
CREATE TABLE IF NOT EXISTS public.verification_tokens (
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
CREATE TABLE IF NOT EXISTS public.password_reset_tokens (
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
CREATE TABLE IF NOT EXISTS public.sessions (
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

CREATE OR REPLACE TRIGGER on_auth_user_updated
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
