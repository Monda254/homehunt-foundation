/**
 * Role-based access control primitives.
 *
 * Two independent checks are always required for a protected action:
 *   1. ROLE permission  — does this role type ever get to do this?
 *   2. RESOURCE ownership — is this specific record theirs to touch?
 *
 * Holding LANDLORD does NOT imply access to every property.
 */

export const APP_ROLES = [
  "tenant",
  "landlord",
  "agent",
  "property_manager",
  "verifier",
  "admin",
  "super_admin",
] as const;

export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
  tenant: "Tenant",
  landlord: "Landlord",
  agent: "Agent",
  property_manager: "Property manager",
  verifier: "Verifier",
  admin: "Administrator",
  super_admin: "Super administrator",
};

export const ADMIN_ROLES: readonly AppRole[] = ["admin", "super_admin"];
export const LISTING_MANAGER_ROLES: readonly AppRole[] = ["landlord", "agent", "property_manager"];

export function isAppRole(value: string): value is AppRole {
  return (APP_ROLES as readonly string[]).includes(value);
}

export function hasRole(roles: readonly AppRole[], role: AppRole): boolean {
  return roles.includes(role);
}

export function hasAnyRole(roles: readonly AppRole[], allowed: readonly AppRole[]): boolean {
  return roles.some((role) => allowed.includes(role));
}

export function isPlatformAdmin(roles: readonly AppRole[]): boolean {
  return hasAnyRole(roles, ADMIN_ROLES);
}

export function canManageListings(roles: readonly AppRole[]): boolean {
  return hasAnyRole(roles, LISTING_MANAGER_ROLES) || isPlatformAdmin(roles);
}

/**
 * Role permission AND resource ownership. `authorizedManagerIds` is the set of
 * users a future module (properties, leases, disputes) records as authorised for
 * that specific resource.
 */
export function canMutateResource(params: {
  userId: string;
  roles: readonly AppRole[];
  authorizedManagerIds: readonly string[];
  requiredRoles?: readonly AppRole[];
}): boolean {
  const { userId, roles, authorizedManagerIds, requiredRoles = LISTING_MANAGER_ROLES } = params;
  if (isPlatformAdmin(roles)) return true;
  if (!hasAnyRole(roles, requiredRoles)) return false;
  return authorizedManagerIds.includes(userId);
}
