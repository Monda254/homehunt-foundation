import { i as createServerFn, o as getServerFnById, t as TSS_SERVER_FUNCTION } from "./server-Dy3VKkCi.mjs";
import { r as requireSupabaseAuth } from "./api-error-CUUESrGA.mjs";
import { a as enumType, c as objectType, d as stringType, o as literalType, s as numberType } from "../_libs/zod.mjs";
import { y as router_exports } from "./router-CmEb8YAq2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/identity.functions-DQ-FICcY.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var RegisterSchema = objectType({
	firstName: stringType().min(1, "First name is required").max(60),
	lastName: stringType().min(1, "Last name is required").max(60),
	email: stringType().email("Invalid email address"),
	phoneNumber: stringType().regex(/^\+?[0-9]{9,15}$/, "Invalid phone number format").optional().or(literalType("")),
	password: stringType().min(8, "Password must be at least 8 characters"),
	confirmPassword: stringType(),
	role: enumType([
		"tenant",
		"landlord",
		"agent"
	])
});
var LoginSchema = objectType({
	email: stringType().email("Invalid email address"),
	password: stringType().min(1, "Password is required")
});
var VerifyEmailSchema = objectType({ token: stringType().min(1, "Verification token is required") });
var ResendVerificationSchema = objectType({ email: stringType().email("Invalid email address") });
var RequestPasswordResetSchema = objectType({ email: stringType().email("Invalid email address") });
var ResetPasswordSchema = objectType({
	token: stringType().min(1, "Reset token is required"),
	password: stringType().min(8, "Password must be at least 8 characters"),
	confirmPassword: stringType()
});
var ChangePasswordSchema = objectType({
	currentPassword: stringType().min(1, "Current password is required"),
	newPassword: stringType().min(8, "Password must be at least 8 characters"),
	confirmNewPassword: stringType()
});
var UpdateProfileSchema = objectType({
	firstName: stringType().min(1, "First name is required").max(60),
	lastName: stringType().min(1, "Last name is required").max(60),
	displayName: stringType().max(60).optional(),
	bio: stringType().max(500).optional(),
	county: stringType().max(60).optional(),
	town: stringType().max(60).optional(),
	preferredLanguage: stringType().max(10).default("en")
});
var AdminListUsersSchema = objectType({
	page: numberType().int().min(1).default(1),
	pageSize: numberType().int().min(1).max(100).default(20),
	search: stringType().optional(),
	role: stringType().optional(),
	status: stringType().optional()
});
var AdminSuspendSchema = objectType({
	userId: stringType().uuid("Invalid user ID"),
	reason: stringType().min(1, "Suspension reason is required")
});
var AdminReactivateSchema = objectType({ userId: stringType().uuid("Invalid user ID") });
var AdminManageRoleSchema = objectType({
	userId: stringType().uuid("Invalid user ID"),
	role: enumType([
		"tenant",
		"landlord",
		"agent",
		"property_manager",
		"verifier",
		"admin",
		"super_admin"
	]),
	action: enumType(["assign", "remove"])
});
/** Read authenticated identity snapshot */
var getMyIdentity = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("33f865121d8faf2b19aec29cdc4e3c5d189faffd78d6fb2f72d85c2ea8afaaa3"));
/** User Registration */
var fnRegister = createServerFn({ method: "POST" }).validator(RegisterSchema).handler(createSsrRpc("5f97cc68a9c502f679e635893a6c6c7bd9333a56b5f6b0ab0a77d61f41e759c5"));
/** User Authentication / Login */
var fnLogin = createServerFn({ method: "POST" }).validator(LoginSchema).handler(createSsrRpc("2490eaecca4433f2c079d135bf24185b2423726107983f02ac9681c0cd4f5de9"));
/** Revoke user session / Logout */
var logout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("6f6bee3c605a966ab3ccbd0c630fdbee80f77d5a9e1fe01dffca77d98da09b2b"));
/** Verify Email */
var fnVerifyEmail = createServerFn({ method: "POST" }).validator(VerifyEmailSchema).handler(createSsrRpc("81033d6052bb9143b9a5ffc3df1a35a9825211fd090e2bf5534f1621466af9de"));
/** Resend Email Verification link */
var fnResendVerification = createServerFn({ method: "POST" }).validator(ResendVerificationSchema).handler(createSsrRpc("7eae376f1767eb29f370bb8787cd56f2f4ae0b9fc96cfbb20facf3c14a8599b4"));
/** Forgot Password / Reset request */
var fnRequestPasswordReset = createServerFn({ method: "POST" }).validator(RequestPasswordResetSchema).handler(createSsrRpc("53beee758189c7616ed6ac1ee557507ab33db9453fb617cb949f4039deaafc17"));
/** Reset Password using token */
var fnResetPassword = createServerFn({ method: "POST" }).validator(ResetPasswordSchema).handler(createSsrRpc("91a88cc32bfd1c751fa9eb130f7a7908476de9c5f8f3f339b80044ef787488ac"));
/** Change Password from settings */
var fnChangePassword = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ChangePasswordSchema).handler(createSsrRpc("0ff03e50af513a13b7e59770f1add804856dd966815c1ee629032ad0df9fd0f6"));
/** Get current user's profile details */
var getMyProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("6a2272c075436e5cc4f031a84661123ed6eb70f87e5962ff3ee3649873f5726e"));
/** Update current user's profile information */
var fnUpdateMyProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateProfileSchema).handler(createSsrRpc("1d06b863d91c5a5835c2790115165a94d45ada1c411f2ed45c8c991197c61661"));
/** Get current user's active session list */
var getMySessions = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b94b875aa111a6d831729b151e274a7bfbe65b3a4d13c58a09311dd0188ca736"));
/** Revoke specific session */
var fnRevokeSession = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({ sessionId: stringType().uuid() })).handler(createSsrRpc("386b88d44491863a4db14383649f3f402971c1b92152df42cbec74d15660e36f"));
/** Revoke all sessions (except current or absolutely all) */
var revokeAllSessions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(createSsrRpc("b4b0a31f39f36a2fad528306dff54641d05d007d5e0e1622a6447456af0bdac3"));
/** List all users (Admin only) */
var fnAdminListUsers = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(AdminListUsersSchema).handler(createSsrRpc("e8218a448d916d11d04b18f3d353966cd7215fdaec24c14e67cd3f44328467ad"));
/** Retrieve specific user profiles and roles (Admin only) */
var fnAdminGetUser = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({ userId: stringType().uuid() })).handler(createSsrRpc("d7e2f98ba6c3da96f54ed0fa8afe0e8d73d8d2e8adc30777989d90dae10e4375"));
/** Suspend user account (Admin only) */
var fnAdminSuspendUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AdminSuspendSchema).handler(createSsrRpc("b1abe9912d1b857637253ce847c2cb5a72e21b892c8ef4c9f8048d87f4d87cf8"));
/** Reactivate user account (Admin only) */
var fnAdminReactivateUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AdminReactivateSchema).handler(createSsrRpc("cca1b32e85cac6c5e8073698729623a5c8b013696217102ea5b6a840bf74b91b"));
/** Assign or Remove user role (Admin/Super Admin only) */
var fnAdminManageRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AdminManageRoleSchema).handler(createSsrRpc("34ae6a93f7518eaf70dd124b06b7251686e60e3c04e86a5d89a1f0d2f30d9e11"));
var register = (data) => fnRegister({ data });
var login = (data) => fnLogin({ data });
var verifyEmail = (data) => fnVerifyEmail({ data });
var resendVerification = (data) => fnResendVerification({ data });
var requestPasswordReset = (data) => fnRequestPasswordReset({ data });
var resetPassword = (data) => fnResetPassword({ data });
var changePassword = (data) => fnChangePassword({ data });
var updateMyProfile = (data) => fnUpdateMyProfile({ data });
var revokeSession = (data) => fnRevokeSession({ data });
var adminListUsers = (data) => fnAdminListUsers({ data });
var adminGetUser = (data) => fnAdminGetUser({ data });
var adminSuspendUser = (data) => fnAdminSuspendUser({ data });
var adminReactivateUser = (data) => fnAdminReactivateUser({ data });
var adminManageRole = (data) => fnAdminManageRole({ data });
//#endregion
export { resetPassword as _, adminReactivateUser as a, updateMyProfile as b, createSsrRpc as c, getMySessions as d, login as f, resendVerification as g, requestPasswordReset as h, adminManageRole as i, getMyIdentity as l, register as m, adminGetUser as n, adminSuspendUser as o, logout as p, adminListUsers as r, changePassword as s, router_exports as t, getMyProfile as u, revokeAllSessions as v, verifyEmail as x, revokeSession as y };
