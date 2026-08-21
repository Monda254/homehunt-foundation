-- Trigger-only functions must not be callable through the API at all.
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Authorization helpers: signed-in users only (used by RLS policies and app code).
REVOKE ALL ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_platform_admin(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.current_user_roles() FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_platform_admin(UUID) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_roles() TO authenticated, service_role;