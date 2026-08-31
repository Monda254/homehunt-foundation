/**
 * Role-based access control primitives.
 *
 * Two independent checks are always required for a protected action:
 *   1. ROLE permission  — does this role type ever get to do this?
 *   2. RESOURCE ownership — is this specific record theirs to touch?
 *
 * Holding LANDLORD does NOT imply access to every property.
 */

import { AppError, ERROR_CODES } from "../errors/api-error";

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

export const APP_PERMISSIONS = [
  "USER_VIEW_SELF",
  "USER_UPDATE_SELF",
  "USER_CHANGE_PASSWORD",
  "PROFILE_VIEW_SELF",
  "PROFILE_UPDATE_SELF",
  "SESSION_VIEW_SELF",
  "SESSION_REVOKE_SELF",
  "ADMIN_VIEW_USERS",
  "ADMIN_SUSPEND_USER",
  "ADMIN_ASSIGN_ROLE",
  "ADMIN_REMOVE_ROLE",
  "PROPERTY_CREATE",
  "PROPERTY_VIEW",
  "PROPERTY_UPDATE",
  "PROPERTY_ARCHIVE",
  "LISTING_CREATE",
  "LISTING_UPDATE",
  "LISTING_PUBLISH",
  "VERIFICATION_VIEW",
  "VERIFICATION_REVIEW",
  "VERIFICATION_APPROVE",
  "VERIFICATION_REJECT",
  "REPORTS_VIEW",
  "REPORTS_REVIEW",
  "REPORTS_RESOLVE",
  "CLAIMS_VIEW",
  "CLAIMS_REVIEW",
  "CLAIMS_RESOLVE",
  "RISK_VIEW",
  "RISK_RESOLVE",
  "APPEALS_VIEW",
  "APPEALS_RESOLVE",
  "LISTING_PAUSE",
  "LISTING_RESTORE",
  "APPLICATIONS_CREATE",
  "APPLICATIONS_VIEW_SELF",
  "APPLICATIONS_WITHDRAW",
  "APPLICATIONS_MANAGE",
] as const;

export type AppPermission = (typeof APP_PERMISSIONS)[number];

export const ROLE_PERMISSIONS: Record<AppRole, AppPermission[]> = {
  tenant: [
    "USER_VIEW_SELF",
    "USER_UPDATE_SELF",
    "USER_CHANGE_PASSWORD",
    "PROFILE_VIEW_SELF",
    "PROFILE_UPDATE_SELF",
    "SESSION_VIEW_SELF",
    "SESSION_REVOKE_SELF",
    "APPLICATIONS_CREATE",
    "APPLICATIONS_VIEW_SELF",
    "APPLICATIONS_WITHDRAW",
  ],
  landlord: [
    "USER_VIEW_SELF",
    "USER_UPDATE_SELF",
    "USER_CHANGE_PASSWORD",
    "PROFILE_VIEW_SELF",
    "PROFILE_UPDATE_SELF",
    "SESSION_VIEW_SELF",
    "SESSION_REVOKE_SELF",
    "PROPERTY_CREATE",
    "PROPERTY_VIEW",
    "PROPERTY_UPDATE",
    "PROPERTY_ARCHIVE",
    "LISTING_CREATE",
    "LISTING_UPDATE",
    "LISTING_PUBLISH",
    "APPLICATIONS_VIEW_SELF",
    "APPLICATIONS_MANAGE",
  ],
  agent: [
    "USER_VIEW_SELF",
    "USER_UPDATE_SELF",
    "USER_CHANGE_PASSWORD",
    "PROFILE_VIEW_SELF",
    "PROFILE_UPDATE_SELF",
    "SESSION_VIEW_SELF",
    "SESSION_REVOKE_SELF",
    "PROPERTY_CREATE",
    "PROPERTY_VIEW",
    "PROPERTY_UPDATE",
    "PROPERTY_ARCHIVE",
    "LISTING_CREATE",
    "LISTING_UPDATE",
    "LISTING_PUBLISH",
    "APPLICATIONS_VIEW_SELF",
    "APPLICATIONS_MANAGE",
  ],
  property_manager: [
    "USER_VIEW_SELF",
    "USER_UPDATE_SELF",
    "USER_CHANGE_PASSWORD",
    "PROFILE_VIEW_SELF",
    "PROFILE_UPDATE_SELF",
    "SESSION_VIEW_SELF",
    "SESSION_REVOKE_SELF",
    "PROPERTY_CREATE",
    "PROPERTY_VIEW",
    "PROPERTY_UPDATE",
    "PROPERTY_ARCHIVE",
    "LISTING_CREATE",
    "LISTING_UPDATE",
    "LISTING_PUBLISH",
    "APPLICATIONS_VIEW_SELF",
    "APPLICATIONS_MANAGE",
  ],
  verifier: [
    "USER_VIEW_SELF",
    "USER_UPDATE_SELF",
    "USER_CHANGE_PASSWORD",
    "PROFILE_VIEW_SELF",
    "PROFILE_UPDATE_SELF",
    "SESSION_VIEW_SELF",
    "SESSION_REVOKE_SELF",
    "PROPERTY_VIEW",
    "VERIFICATION_VIEW",
    "VERIFICATION_REVIEW",
    "REPORTS_VIEW",
    "REPORTS_REVIEW",
    "CLAIMS_VIEW",
    "CLAIMS_REVIEW",
    "RISK_VIEW",
    "APPEALS_VIEW",
  ],
  admin: [
    "USER_VIEW_SELF",
    "USER_UPDATE_SELF",
    "USER_CHANGE_PASSWORD",
    "PROFILE_VIEW_SELF",
    "PROFILE_UPDATE_SELF",
    "SESSION_VIEW_SELF",
    "SESSION_REVOKE_SELF",
    "ADMIN_VIEW_USERS",
    "ADMIN_SUSPEND_USER",
    "ADMIN_ASSIGN_ROLE",
    "ADMIN_REMOVE_ROLE",
    "PROPERTY_VIEW",
    "VERIFICATION_VIEW",
    "VERIFICATION_REVIEW",
    "VERIFICATION_APPROVE",
    "VERIFICATION_REJECT",
    "REPORTS_VIEW",
    "REPORTS_REVIEW",
    "REPORTS_RESOLVE",
    "CLAIMS_VIEW",
    "CLAIMS_REVIEW",
    "CLAIMS_RESOLVE",
    "RISK_VIEW",
    "RISK_RESOLVE",
    "APPEALS_VIEW",
    "APPEALS_RESOLVE",
    "LISTING_PAUSE",
    "LISTING_RESTORE",
    "APPLICATIONS_VIEW_SELF",
    "APPLICATIONS_MANAGE",
  ],
  super_admin: [
    "USER_VIEW_SELF",
    "USER_UPDATE_SELF",
    "USER_CHANGE_PASSWORD",
    "PROFILE_VIEW_SELF",
    "PROFILE_UPDATE_SELF",
    "SESSION_VIEW_SELF",
    "SESSION_REVOKE_SELF",
    "ADMIN_VIEW_USERS",
    "ADMIN_SUSPEND_USER",
    "ADMIN_ASSIGN_ROLE",
    "ADMIN_REMOVE_ROLE",
    "PROPERTY_CREATE",
    "PROPERTY_VIEW",
    "PROPERTY_UPDATE",
    "PROPERTY_ARCHIVE",
    "LISTING_CREATE",
    "LISTING_UPDATE",
    "LISTING_PUBLISH",
    "VERIFICATION_VIEW",
    "VERIFICATION_REVIEW",
    "VERIFICATION_APPROVE",
    "VERIFICATION_REJECT",
    "REPORTS_VIEW",
    "REPORTS_REVIEW",
    "REPORTS_RESOLVE",
    "CLAIMS_VIEW",
    "CLAIMS_REVIEW",
    "CLAIMS_RESOLVE",
    "RISK_VIEW",
    "RISK_RESOLVE",
    "APPEALS_VIEW",
    "APPEALS_RESOLVE",
    "LISTING_PAUSE",
    "LISTING_RESTORE",
    "APPLICATIONS_VIEW_SELF",
    "APPLICATIONS_MANAGE",
  ],
};

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

export function hasPermission(roles: readonly AppRole[], permission: AppPermission): boolean {
  return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}

export function hasAnyPermission(
  roles: readonly AppRole[],
  permissions: readonly AppPermission[],
): boolean {
  return permissions.some((permission) => hasPermission(roles, permission));
}

export function requirePermission(roles: readonly AppRole[], permission: AppPermission): void {
  if (!hasPermission(roles, permission)) {
    throw new AppError(ERROR_CODES.FORBIDDEN, `Missing required permission: ${permission}`);
  }
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
