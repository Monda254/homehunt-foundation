import { n as ERROR_CODES, t as AppError } from "./api-error-C5p6KfDB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roles-BzUNBgvo.js
/**
* Role-based access control primitives.
*
* Two independent checks are always required for a protected action:
*   1. ROLE permission  — does this role type ever get to do this?
*   2. RESOURCE ownership — is this specific record theirs to touch?
*
* Holding LANDLORD does NOT imply access to every property.
*/
var APP_ROLES = [
	"tenant",
	"landlord",
	"agent",
	"property_manager",
	"verifier",
	"admin",
	"super_admin"
];
var ADMIN_ROLES = ["admin", "super_admin"];
var ROLE_PERMISSIONS = {
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
		"TENANCIES_CREATE",
		"TENANCIES_VIEW_SELF"
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
		"TENANCIES_CREATE",
		"TENANCIES_VIEW_SELF",
		"TENANCIES_MANAGE"
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
		"TENANCIES_CREATE",
		"TENANCIES_VIEW_SELF",
		"TENANCIES_MANAGE"
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
		"TENANCIES_CREATE",
		"TENANCIES_VIEW_SELF",
		"TENANCIES_MANAGE"
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
		"APPEALS_VIEW"
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
		"TENANCIES_VIEW_SELF",
		"TENANCIES_MANAGE"
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
		"TENANCIES_CREATE",
		"TENANCIES_VIEW_SELF",
		"TENANCIES_MANAGE"
	]
};
function isAppRole(value) {
	return APP_ROLES.includes(value);
}
function hasRole(roles, role) {
	return roles.includes(role);
}
function hasAnyRole(roles, allowed) {
	return roles.some((role) => allowed.includes(role));
}
function isPlatformAdmin(roles) {
	return hasAnyRole(roles, ADMIN_ROLES);
}
function hasPermission(roles, permission) {
	return roles.some((role) => ROLE_PERMISSIONS[role]?.includes(permission));
}
function requirePermission(roles, permission) {
	if (!hasPermission(roles, permission)) throw new AppError(ERROR_CODES.FORBIDDEN, `Missing required permission: ${permission}`);
}
//#endregion
export { requirePermission as a, isPlatformAdmin as i, hasRole as n, isAppRole as r, hasPermission as t };
