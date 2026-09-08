import { a as getRequest, i as createServerFn } from "./server-BRCrXnf-.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
import { n as ERROR_CODES, r as requireSupabaseAuth, t as AppError } from "./api-error-C5p6KfDB.mjs";
import { a as enumType, c as objectType, d as stringType, o as literalType, s as numberType } from "../_libs/zod.mjs";
import { a as resolveRequestId, r as logger } from "./request-id-Du7XsDoM.mjs";
import { a as requirePermission, r as isAppRole } from "./roles-BzUNBgvo.mjs";
import { t as readServerConfig } from "./server-config-Blgc301r.mjs";
import { t as createServerRpc } from "./createServerRpc-QTbvBIhf.mjs";
import { n as recordAuditEvent, t as auditMetadataFromRequest } from "./audit.server-Bceddfrr.mjs";
import { t as checkRateLimit } from "./rate-limit.server-dC5Xqp4I.mjs";
import crypto from "crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/identity.functions-CZKJgGAS.js
/**
* Email and SMS services (server-only).
*
* Provides a modular interface for sending notifications.
* In development, output is written to structured console logger.
*/
var emailService = {
	async sendVerificationEmail(email, token, customBaseUrl) {
		const config = readServerConfig();
		const isDev = !config.ok || config.config.APP_ENV === "development";
		const verificationLink = `${customBaseUrl || (isDev ? "http://localhost:8080" : "https://homehunt.co.ke")}/verify-email?token=${token}`;
		const resendApiKey = process.env.RESEND_API_KEY;
		logger.info("Email verification dispatched", {
			event: "email.verification_sent",
			recipient: email,
			provider: resendApiKey ? "Resend" : "LoggerFallback",
			...isDev ? { localUrl: verificationLink } : {}
		});
		if (resendApiKey) try {
			await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${resendApiKey}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					from: "HomeHunt <no-reply@homehunt.co.ke>",
					to: [email],
					subject: "Verify your HomeHunt Account",
					html: `<p>Welcome to HomeHunt! Click <a href="${verificationLink}">here</a> to verify your account.</p>`
				})
			});
		} catch (err) {
			logger.error("Failed to send email via Resend provider:", { error: err.message });
		}
		else {
			console.log("\n============================================================");
			console.log(`[DEVELOPMENT EMAIL SENDER] TO: ${email}`);
			console.log("Please click the link below to verify your account:");
			console.log(verificationLink);
			console.log("============================================================\n");
		}
	},
	async sendPasswordResetEmail(email, token, customBaseUrl) {
		const config = readServerConfig();
		const isDev = !config.ok || config.config.APP_ENV === "development";
		const resetLink = `${customBaseUrl || (isDev ? "http://localhost:8080" : "https://homehunt.co.ke")}/reset-password?token=${token}`;
		const resendApiKey = process.env.RESEND_API_KEY;
		logger.info("Password reset dispatched", {
			event: "email.password_reset_sent",
			recipient: email,
			provider: resendApiKey ? "Resend" : "LoggerFallback",
			...isDev ? { localUrl: resetLink } : {}
		});
		if (resendApiKey) try {
			await fetch("https://api.resend.com/emails", {
				method: "POST",
				headers: {
					Authorization: `Bearer ${resendApiKey}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					from: "HomeHunt <no-reply@homehunt.co.ke>",
					to: [email],
					subject: "Reset your HomeHunt Password",
					html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
				})
			});
		} catch (err) {
			logger.error("Failed to send password reset email via Resend:", { error: err.message });
		}
		else {
			console.log("\n============================================================");
			console.log(`[DEVELOPMENT EMAIL SENDER] TO: ${email}`);
			console.log("Please click the link below to reset your password:");
			console.log(resetLink);
			console.log("============================================================\n");
		}
	}
};
function getBaseUrlFromRequest(request) {
	if (!request) return void 0;
	const headers = request.headers;
	const host = headers.get("x-forwarded-host") || headers.get("host");
	if (!host) return void 0;
	headers.get("x-forwarded-proto");
	return `${host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https"}://${host}`;
}
function isNewSupabaseApiKey(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
	return (input, init) => {
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
function createPublicAuthClient() {
	const SUPABASE_URL = process.env["SUPABASE_URL"];
	const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
	if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) throw new Error("Supabase public credentials missing in environment");
	return createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: { fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY) },
		auth: {
			persistSession: false,
			autoRefreshToken: false
		}
	});
}
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
var getMyIdentity_createServerFn_handler = createServerRpc({
	id: "33f865121d8faf2b19aec29cdc4e3c5d189faffd78d6fb2f72d85c2ea8afaaa3",
	name: "getMyIdentity",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => getMyIdentity.__executeServer(opts));
var getMyIdentity = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyIdentity_createServerFn_handler, async ({ context }) => {
	const requestId = resolveRequestId(getRequest()?.headers);
	const { supabase, userId, claims } = context;
	const [profileResult, rolesResult] = await Promise.all([supabase.from("profiles").select("full_name, first_name, last_name, phone_number, preferred_county, county, town, preferred_language, onboarding_completed, status").eq("id", userId).maybeSingle(), supabase.from("user_roles").select("role").eq("user_id", userId)]);
	if (profileResult.error || rolesResult.error) {
		logger.error("Identity read failed", profileResult.error ?? rolesResult.error, {
			event: "identity.read_failed",
			requestId,
			userId
		});
		throw new AppError(ERROR_CODES.DEPENDENCY_UNAVAILABLE, "Could not load your account.");
	}
	const email = typeof claims["email"] === "string" ? claims["email"] : null;
	const profile = profileResult.data;
	return {
		userId,
		email,
		fullName: profile?.full_name ?? null,
		firstName: profile?.first_name ?? null,
		lastName: profile?.last_name ?? null,
		phoneNumber: profile?.phone_number ?? null,
		preferredCounty: profile?.preferred_county ?? null,
		county: profile?.county ?? null,
		town: profile?.town ?? null,
		preferredLanguage: profile?.preferred_language ?? "en",
		onboardingCompleted: profile?.onboarding_completed ?? false,
		status: profile?.status ?? "PENDING_VERIFICATION",
		roles: (rolesResult.data ?? []).map((row) => row.role).filter(isAppRole),
		requestId
	};
});
var fnRegister_createServerFn_handler = createServerRpc({
	id: "5f97cc68a9c502f679e635893a6c6c7bd9333a56b5f6b0ab0a77d61f41e759c5",
	name: "fnRegister",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnRegister.__executeServer(opts));
/** User Registration */
var fnRegister = createServerFn({ method: "POST" }).validator(RegisterSchema).handler(fnRegister_createServerFn_handler, async ({ data }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const baseUrl = getBaseUrlFromRequest(request);
	const rateLimitKey = `register:${meta.ipAddress ?? "unknown"}`;
	checkRateLimit(rateLimitKey, 5, 3600);
	const email = data.email.trim().toLowerCase();
	if (data.password !== data.confirmPassword) throw new AppError(ERROR_CODES.BAD_REQUEST, "Passwords do not match.");
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
	if (existingUser?.users?.some((u) => u.email?.toLowerCase() === email)) throw new AppError(ERROR_CODES.CONFLICT, "An account with this email already exists.");
	const { data: userAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
		email,
		password: data.password,
		email_confirm: false,
		user_metadata: {
			full_name: `${data.firstName} ${data.lastName}`.trim(),
			first_name: data.firstName,
			last_name: data.lastName,
			phone_number: data.phoneNumber || null,
			role: data.role
		}
	});
	if (authError || !userAuth.user) {
		logger.error("Authentication signup failed", authError, {
			event: "register.failed",
			requestId,
			email
		});
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, authError?.message || "Could not create user account.");
	}
	const userId = userAuth.user.id;
	const verificationToken = crypto.randomBytes(32).toString("hex");
	const tokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
	const expiresAt = new Date(Date.now() + 864e5).toISOString();
	const { error: tokenError } = await supabaseAdmin.from("verification_tokens").insert({
		user_id: userId,
		token_hash: tokenHash,
		expires_at: expiresAt
	});
	if (tokenError) {
		logger.error("Failed to write verification token", tokenError, {
			event: "register.token_write_failed",
			requestId,
			userId
		});
		await supabaseAdmin.auth.admin.deleteUser(userId);
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, "An error occurred during registration setup.");
	}
	await emailService.sendVerificationEmail(email, verificationToken, baseUrl);
	await Promise.all([recordAuditEvent({
		actorId: userId,
		action: "USER_REGISTERED",
		resourceType: "user",
		resourceId: userId,
		afterData: {
			email,
			role: data.role,
			name: `${data.firstName} ${data.lastName}`
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	}), recordAuditEvent({
		actorId: userId,
		action: "EMAIL_VERIFICATION_SENT",
		resourceType: "token",
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	})]);
	return {
		success: true,
		status: "PENDING_VERIFICATION"
	};
});
/** User Authentication / Login */
var fnLogin_createServerFn_handler = createServerRpc({
	id: "2490eaecca4433f2c079d135bf24185b2423726107983f02ac9681c0cd4f5de9",
	name: "fnLogin",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnLogin.__executeServer(opts));
var fnLogin = createServerFn({ method: "POST" }).validator(LoginSchema).handler(fnLogin_createServerFn_handler, async ({ data }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const email = data.email.trim().toLowerCase();
	const rateLimitKey = `login:${email}`;
	checkRateLimit(rateLimitKey, 10, 300);
	const { data: authData, error: authError } = await createPublicAuthClient().auth.signInWithPassword({
		email,
		password: data.password
	});
	if (authError || !authData.session || !authData.user) {
		await recordAuditEvent({
			actorId: null,
			action: "LOGIN_FAILED",
			resourceType: "user",
			beforeData: { email },
			ipAddress: meta.ipAddress,
			userAgent: meta.userAgent,
			requestId
		});
		logger.warn("User login failed", {
			event: "login.failed",
			requestId,
			email
		});
		const errorMessage = authError?.message?.toLowerCase().includes("confirm") ? "Please verify your email address before logging in." : "Email or password is incorrect.";
		throw new AppError(ERROR_CODES.UNAUTHENTICATED, errorMessage);
	}
	const userId = authData.user.id;
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const [profileResult, rolesResult] = await Promise.all([supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(), supabaseAdmin.from("user_roles").select("role").eq("user_id", userId)]);
	const profile = profileResult.data;
	if (!profile) {
		logger.error("Profile matching authenticated user was not found", null, {
			event: "login.profile_missing",
			requestId,
			userId
		});
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to load account details.");
	}
	const roles = (rolesResult.data ?? []).map((row) => row.role);
	if (profile.status === "SUSPENDED" || profile.status === "LOCKED" || profile.status === "DEACTIVATED") {
		await supabaseAdmin.auth.admin.signOut(authData.session.access_token);
		await recordAuditEvent({
			actorId: userId,
			action: "LOGIN_FAILED",
			resourceType: "user",
			resourceId: userId,
			beforeData: { status: profile.status },
			ipAddress: meta.ipAddress,
			userAgent: meta.userAgent,
			requestId
		});
		throw new AppError(ERROR_CODES.FORBIDDEN, `Your account has been ${profile.status.toLowerCase()}. Please contact support.`);
	}
	const sessionTokenHash = crypto.createHash("sha256").update(authData.session.access_token).digest("hex");
	const expiresAt = new Date(Date.now() + authData.session.expires_in * 1e3).toISOString();
	const { error: sessionError } = await supabaseAdmin.from("sessions").insert({
		user_id: userId,
		session_token_hash: sessionTokenHash,
		expires_at: expiresAt,
		ip_address: meta.ipAddress,
		user_agent: meta.userAgent
	});
	if (sessionError) logger.error("Failed to write custom session record", sessionError, {
		event: "login.session_write_failed",
		requestId,
		userId
	});
	await supabaseAdmin.from("profiles").update({ last_login_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", userId);
	await recordAuditEvent({
		actorId: userId,
		action: "LOGIN_SUCCESS",
		resourceType: "user",
		resourceId: userId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return {
		access_token: authData.session.access_token,
		refresh_token: authData.session.refresh_token,
		user: {
			id: userId,
			email: authData.user.email,
			status: profile.status,
			roles,
			profile: {
				fullName: profile.full_name,
				firstName: profile.first_name,
				lastName: profile.last_name,
				phoneNumber: profile.phone_number,
				avatarUrl: profile.avatar_url,
				county: profile.county,
				town: profile.town,
				preferredLanguage: profile.preferred_language
			}
		}
	};
});
/** Revoke user session / Logout */
var logout_createServerFn_handler = createServerRpc({
	id: "6f6bee3c605a966ab3ccbd0c630fdbee80f77d5a9e1fe01dffca77d98da09b2b",
	name: "logout",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => logout.__executeServer(opts));
var logout = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(logout_createServerFn_handler, async ({ context }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const { userId, token, tokenHash } = context;
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	await supabaseAdmin.from("sessions").update({ revoked_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("session_token_hash", tokenHash);
	await supabaseAdmin.auth.admin.signOut(token);
	await recordAuditEvent({
		actorId: userId,
		action: "LOGOUT",
		resourceType: "user",
		resourceId: userId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnVerifyEmail_createServerFn_handler = createServerRpc({
	id: "81033d6052bb9143b9a5ffc3df1a35a9825211fd090e2bf5534f1621466af9de",
	name: "fnVerifyEmail",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnVerifyEmail.__executeServer(opts));
/** Verify Email */
var fnVerifyEmail = createServerFn({ method: "POST" }).validator(VerifyEmailSchema).handler(fnVerifyEmail_createServerFn_handler, async ({ data }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const { data: vt, error } = await supabaseAdmin.from("verification_tokens").select("*").eq("token_hash", tokenHash).maybeSingle();
	if (error || !vt || vt.used_at || new Date(vt.expires_at) < /* @__PURE__ */ new Date()) throw new AppError(ERROR_CODES.BAD_REQUEST, "Verification link is invalid or has expired.");
	const userId = vt.user_id;
	const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(userId, { email_confirm: true });
	if (confirmError) {
		logger.error("Failed to confirm email in auth.users", confirmError, {
			event: "verify_email.auth_confirm_failed",
			requestId,
			userId
		});
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, "An error occurred while confirming email.");
	}
	await Promise.all([supabaseAdmin.from("verification_tokens").update({ used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", vt.id), supabaseAdmin.from("profiles").update({ status: "ACTIVE" }).eq("id", userId)]);
	await recordAuditEvent({
		actorId: userId,
		action: "EMAIL_VERIFIED",
		resourceType: "user",
		resourceId: userId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
/** Resend Email Verification link */
var fnResendVerification_createServerFn_handler = createServerRpc({
	id: "7eae376f1767eb29f370bb8787cd56f2f4ae0b9fc96cfbb20facf3c14a8599b4",
	name: "fnResendVerification",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnResendVerification.__executeServer(opts));
var fnResendVerification = createServerFn({ method: "POST" }).validator(ResendVerificationSchema).handler(fnResendVerification_createServerFn_handler, async ({ data }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const baseUrl = getBaseUrlFromRequest(request);
	const email = data.email.trim().toLowerCase();
	checkRateLimit(`resend_verification:${email}`, 3, 600);
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const { data: users } = await supabaseAdmin.auth.admin.listUsers();
	const user = users?.users?.find((u) => u.email?.toLowerCase() === email);
	if (user) {
		const { data: profile } = await supabaseAdmin.from("profiles").select("status").eq("id", user.id).maybeSingle();
		if (profile && profile.status === "PENDING_VERIFICATION") {
			await supabaseAdmin.from("verification_tokens").update({ used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", user.id).is("used_at", null);
			const verificationToken = crypto.randomBytes(32).toString("hex");
			const tokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
			const expiresAt = new Date(Date.now() + 864e5).toISOString();
			await supabaseAdmin.from("verification_tokens").insert({
				user_id: user.id,
				token_hash: tokenHash,
				expires_at: expiresAt
			});
			await emailService.sendVerificationEmail(email, verificationToken, baseUrl);
			await recordAuditEvent({
				actorId: user.id,
				action: "EMAIL_VERIFICATION_SENT",
				resourceType: "token",
				ipAddress: meta.ipAddress,
				userAgent: meta.userAgent,
				requestId
			});
		}
	}
	return { success: true };
});
/** Forgot Password / Reset request */
var fnRequestPasswordReset_createServerFn_handler = createServerRpc({
	id: "53beee758189c7616ed6ac1ee557507ab33db9453fb617cb949f4039deaafc17",
	name: "fnRequestPasswordReset",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnRequestPasswordReset.__executeServer(opts));
var fnRequestPasswordReset = createServerFn({ method: "POST" }).validator(RequestPasswordResetSchema).handler(fnRequestPasswordReset_createServerFn_handler, async ({ data }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const baseUrl = getBaseUrlFromRequest(request);
	const email = data.email.trim().toLowerCase();
	checkRateLimit(`forgot_password:${email}`, 3, 600);
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const { data: users } = await supabaseAdmin.auth.admin.listUsers();
	const user = users?.users?.find((u) => u.email?.toLowerCase() === email);
	if (user) {
		await supabaseAdmin.from("password_reset_tokens").update({ used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", user.id).is("used_at", null);
		const resetToken = crypto.randomBytes(32).toString("hex");
		const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
		const expiresAt = new Date(Date.now() + 36e5).toISOString();
		await supabaseAdmin.from("password_reset_tokens").insert({
			user_id: user.id,
			token_hash: tokenHash,
			expires_at: expiresAt
		});
		await emailService.sendPasswordResetEmail(email, resetToken, baseUrl);
		await recordAuditEvent({
			actorId: user.id,
			action: "PASSWORD_RESET_REQUESTED",
			resourceType: "token",
			ipAddress: meta.ipAddress,
			userAgent: meta.userAgent,
			requestId
		});
	}
	return {
		success: true,
		message: "If an account exists for that email, we've sent instructions."
	};
});
/** Reset Password using token */
var fnResetPassword_createServerFn_handler = createServerRpc({
	id: "91a88cc32bfd1c751fa9eb130f7a7908476de9c5f8f3f339b80044ef787488ac",
	name: "fnResetPassword",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnResetPassword.__executeServer(opts));
var fnResetPassword = createServerFn({ method: "POST" }).validator(ResetPasswordSchema).handler(fnResetPassword_createServerFn_handler, async ({ data }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	if (data.password !== data.confirmPassword) throw new AppError(ERROR_CODES.BAD_REQUEST, "Passwords do not match.");
	const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const { data: rt, error } = await supabaseAdmin.from("password_reset_tokens").select("*").eq("token_hash", tokenHash).maybeSingle();
	if (error || !rt || rt.used_at || new Date(rt.expires_at) < /* @__PURE__ */ new Date()) throw new AppError(ERROR_CODES.BAD_REQUEST, "Reset link is invalid or has expired.");
	const userId = rt.user_id;
	const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: data.password });
	if (updateError) {
		logger.error("Failed to reset password in auth.users", updateError, {
			event: "reset_password.failed",
			requestId,
			userId
		});
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update your password.");
	}
	await Promise.all([
		supabaseAdmin.from("password_reset_tokens").update({ used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", rt.id),
		supabaseAdmin.from("sessions").update({ revoked_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", userId),
		supabaseAdmin.auth.admin.signOut(userId)
	]);
	await recordAuditEvent({
		actorId: userId,
		action: "PASSWORD_RESET_COMPLETED",
		resourceType: "user",
		resourceId: userId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
/** Change Password from settings */
var fnChangePassword_createServerFn_handler = createServerRpc({
	id: "0ff03e50af513a13b7e59770f1add804856dd966815c1ee629032ad0df9fd0f6",
	name: "fnChangePassword",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnChangePassword.__executeServer(opts));
var fnChangePassword = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(ChangePasswordSchema).handler(fnChangePassword_createServerFn_handler, async ({ data, context }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const { userId, tokenHash } = context;
	if (data.newPassword !== data.confirmNewPassword) throw new AppError(ERROR_CODES.BAD_REQUEST, "Passwords do not match.");
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(userId);
	if (!userAuth.user || !userAuth.user.email) throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Account not found.");
	const { error: verifyError } = await createPublicAuthClient().auth.signInWithPassword({
		email: userAuth.user.email,
		password: data.currentPassword
	});
	if (verifyError) throw new AppError(ERROR_CODES.UNAUTHENTICATED, "Current password is incorrect.");
	const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, { password: data.newPassword });
	if (updateError) {
		logger.error("Failed to change password", updateError, {
			event: "change_password.failed",
			requestId,
			userId
		});
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update your password.");
	}
	await supabaseAdmin.from("sessions").update({ revoked_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", userId).neq("session_token_hash", tokenHash);
	await recordAuditEvent({
		actorId: userId,
		action: "PASSWORD_CHANGED",
		resourceType: "user",
		resourceId: userId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
/** Get current user's profile details */
var getMyProfile_createServerFn_handler = createServerRpc({
	id: "6a2272c075436e5cc4f031a84661123ed6eb70f87e5962ff3ee3649873f5726e",
	name: "getMyProfile",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => getMyProfile.__executeServer(opts));
var getMyProfile = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMyProfile_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
	if (error) throw new AppError(ERROR_CODES.DEPENDENCY_UNAVAILABLE, "Could not load profile.");
	return data;
});
var fnUpdateMyProfile_createServerFn_handler = createServerRpc({
	id: "1d06b863d91c5a5835c2790115165a94d45ada1c411f2ed45c8c991197c61661",
	name: "fnUpdateMyProfile",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnUpdateMyProfile.__executeServer(opts));
/** Update current user's profile information */
var fnUpdateMyProfile = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(UpdateProfileSchema).handler(fnUpdateMyProfile_createServerFn_handler, async ({ data, context }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const { supabase, userId } = context;
	const { data: original } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
	const fullName = `${data.firstName} ${data.lastName}`.trim();
	const { data: updated, error } = await supabase.from("profiles").update({
		first_name: data.firstName,
		last_name: data.lastName,
		full_name: fullName,
		display_name: data.displayName || null,
		bio: data.bio || null,
		county: data.county || null,
		town: data.town || null,
		preferred_language: data.preferredLanguage,
		updated_at: (/* @__PURE__ */ new Date()).toISOString()
	}).eq("id", userId).select().maybeSingle();
	if (error || !updated) {
		logger.error("Failed to update profile", error, {
			event: "profile.update_failed",
			requestId,
			userId
		});
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Could not update profile information.");
	}
	await recordAuditEvent({
		actorId: userId,
		action: "PROFILE_UPDATED",
		resourceType: "profile",
		resourceId: userId,
		beforeData: original ? {
			first_name: original.first_name,
			last_name: original.last_name,
			display_name: original.display_name,
			bio: original.bio,
			county: original.county,
			town: original.town,
			preferred_language: original.preferred_language
		} : null,
		afterData: {
			first_name: updated.first_name,
			last_name: updated.last_name,
			display_name: updated.display_name,
			bio: updated.bio,
			county: updated.county,
			town: updated.town,
			preferred_language: updated.preferred_language
		},
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return updated;
});
/** Get current user's active session list */
var getMySessions_createServerFn_handler = createServerRpc({
	id: "b94b875aa111a6d831729b151e274a7bfbe65b3a4d13c58a09311dd0188ca736",
	name: "getMySessions",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => getMySessions.__executeServer(opts));
var getMySessions = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).handler(getMySessions_createServerFn_handler, async ({ context }) => {
	const { supabase, userId } = context;
	const { data, error } = await supabase.from("sessions").select("id, created_at, last_seen_at, ip_address, user_agent, session_token_hash").eq("user_id", userId).is("revoked_at", null).gt("expires_at", (/* @__PURE__ */ new Date()).toISOString()).order("created_at", { ascending: false });
	if (error) throw new AppError(ERROR_CODES.DEPENDENCY_UNAVAILABLE, "Could not load active sessions.");
	return (data ?? []).map((sess) => ({
		id: sess.id,
		createdAt: sess.created_at,
		lastSeenAt: sess.last_seen_at,
		ipAddress: sess.ip_address,
		userAgent: sess.user_agent,
		isCurrent: sess.session_token_hash === context.tokenHash
	}));
});
var fnRevokeSession_createServerFn_handler = createServerRpc({
	id: "386b88d44491863a4db14383649f3f402971c1b92152df42cbec74d15660e36f",
	name: "fnRevokeSession",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnRevokeSession.__executeServer(opts));
/** Revoke specific session */
var fnRevokeSession = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(objectType({ sessionId: stringType().uuid() })).handler(fnRevokeSession_createServerFn_handler, async ({ data, context }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const { userId } = context;
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const { data: session } = await supabaseAdmin.from("sessions").select("user_id, session_token_hash").eq("id", data.sessionId).maybeSingle();
	if (!session) throw new AppError(ERROR_CODES.NOT_FOUND, "Session not found.");
	if (session.user_id !== userId) throw new AppError(ERROR_CODES.FORBIDDEN, "Unauthorized session modification.");
	await supabaseAdmin.from("sessions").update({ revoked_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("id", data.sessionId);
	await recordAuditEvent({
		actorId: userId,
		action: "SESSION_REVOKED",
		resourceType: "session",
		resourceId: data.sessionId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
/** Revoke all sessions (except current or absolutely all) */
var revokeAllSessions_createServerFn_handler = createServerRpc({
	id: "b4b0a31f39f36a2fad528306dff54641d05d007d5e0e1622a6447456af0bdac3",
	name: "revokeAllSessions",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => revokeAllSessions.__executeServer(opts));
var revokeAllSessions = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(revokeAllSessions_createServerFn_handler, async ({ context }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const { userId, tokenHash } = context;
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	await supabaseAdmin.from("sessions").update({ revoked_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", userId).neq("session_token_hash", tokenHash);
	await recordAuditEvent({
		actorId: userId,
		action: "SESSION_REVOKED",
		resourceType: "session",
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
var fnAdminListUsers_createServerFn_handler = createServerRpc({
	id: "e8218a448d916d11d04b18f3d353966cd7215fdaec24c14e67cd3f44328467ad",
	name: "fnAdminListUsers",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnAdminListUsers.__executeServer(opts));
/** List all users (Admin only) */
var fnAdminListUsers = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(AdminListUsersSchema).handler(fnAdminListUsers_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId } = context;
	const { data: userRolesResult } = await supabase.from("user_roles").select("role").eq("user_id", userId);
	const roles = (userRolesResult ?? []).map((r) => r.role);
	requirePermission(roles, "ADMIN_VIEW_USERS");
	const offset = (data.page - 1) * data.pageSize;
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	let query = supabaseAdmin.from("profiles").select("id, full_name, phone_number, status, onboarding_completed, created_at, last_login_at", { count: "exact" });
	if (data.status) query = query.eq("status", data.status);
	if (data.search) query = query.or(`full_name.ilike.%${data.search}%,phone_number.ilike.%${data.search}%`);
	query = query.order("created_at", { ascending: false }).range(offset, offset + data.pageSize - 1);
	const { data: list, count, error } = await query;
	if (error) {
		logger.error("Admin user list load failed", error, { event: "admin.list_users_failed" });
		throw new AppError(ERROR_CODES.DEPENDENCY_UNAVAILABLE, "Could not load user list.");
	}
	const userIds = (list ?? []).map((u) => u.id);
	const [authUsers, userRoles] = await Promise.all([supabaseAdmin.auth.admin.listUsers(), supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", userIds)]);
	return {
		users: (list ?? []).map((profile) => {
			const email = authUsers.data.users.find((au) => au.id === profile.id)?.email ?? null;
			const rolesForUser = (userRoles.data ?? []).filter((ur) => ur.user_id === profile.id).map((ur) => ur.role);
			return {
				id: profile.id,
				fullName: profile.full_name,
				phoneNumber: profile.phone_number,
				email,
				status: profile.status,
				onboardingCompleted: profile.onboarding_completed,
				createdAt: profile.created_at,
				lastLoginAt: profile.last_login_at,
				roles: rolesForUser
			};
		}),
		totalCount: count ?? 0,
		page: data.page,
		pageSize: data.pageSize
	};
});
/** Retrieve specific user profiles and roles (Admin only) */
var fnAdminGetUser_createServerFn_handler = createServerRpc({
	id: "d7e2f98ba6c3da96f54ed0fa8afe0e8d73d8d2e8adc30777989d90dae10e4375",
	name: "fnAdminGetUser",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnAdminGetUser.__executeServer(opts));
var fnAdminGetUser = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth]).validator(objectType({ userId: stringType().uuid() })).handler(fnAdminGetUser_createServerFn_handler, async ({ data, context }) => {
	const { supabase, userId: actorId } = context;
	const { data: actorRolesResult } = await supabase.from("user_roles").select("role").eq("user_id", actorId);
	const actorRoles = (actorRolesResult ?? []).map((r) => r.role);
	requirePermission(actorRoles, "ADMIN_VIEW_USERS");
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const [profileResult, authUserResult, rolesResult, sessionsResult] = await Promise.all([
		supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
		supabaseAdmin.auth.admin.getUserById(data.userId),
		supabaseAdmin.from("user_roles").select("role").eq("user_id", data.userId),
		supabaseAdmin.from("sessions").select("id, created_at, last_seen_at, revoked_at, ip_address, user_agent").eq("user_id", data.userId).order("created_at", { ascending: false }).limit(10)
	]);
	const profile = profileResult.data;
	if (!profile) throw new AppError(ERROR_CODES.NOT_FOUND, "User profile not found.");
	return {
		id: profile.id,
		email: authUserResult.data?.user?.email ?? null,
		fullName: profile.full_name,
		firstName: profile.first_name,
		lastName: profile.last_name,
		phoneNumber: profile.phone_number,
		avatarUrl: profile.avatar_url,
		county: profile.county,
		town: profile.town,
		status: profile.status,
		identityVerified: profile.identity_verified || false,
		agentVerified: profile.agent_verified || false,
		onboardingCompleted: profile.onboarding_completed,
		createdAt: profile.created_at,
		lastLoginAt: profile.last_login_at,
		roles: (rolesResult.data ?? []).map((r) => r.role),
		sessions: (sessionsResult.data ?? []).map((s) => ({
			id: s.id,
			createdAt: s.created_at,
			lastSeenAt: s.last_seen_at,
			revokedAt: s.revoked_at,
			ipAddress: s.ip_address,
			userAgent: s.user_agent
		}))
	};
});
/** Suspend user account (Admin only) */
var fnAdminSuspendUser_createServerFn_handler = createServerRpc({
	id: "b1abe9912d1b857637253ce847c2cb5a72e21b892c8ef4c9f8048d87f4d87cf8",
	name: "fnAdminSuspendUser",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnAdminSuspendUser.__executeServer(opts));
var fnAdminSuspendUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AdminSuspendSchema).handler(fnAdminSuspendUser_createServerFn_handler, async ({ data, context }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const { supabase, userId: actorId } = context;
	const { data: actorRolesResult } = await supabase.from("user_roles").select("role").eq("user_id", actorId);
	const actorRoles = (actorRolesResult ?? []).map((r) => r.role);
	requirePermission(actorRoles, "ADMIN_SUSPEND_USER");
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	if (data.userId === actorId) throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot suspend your own account.");
	const { error } = await supabaseAdmin.from("profiles").update({ status: "SUSPENDED" }).eq("id", data.userId);
	if (error) {
		logger.error("Failed to suspend account", error, {
			event: "admin.suspend_failed",
			requestId,
			userId: data.userId
		});
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Could not suspend user account.");
	}
	await Promise.all([supabaseAdmin.from("sessions").update({ revoked_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("user_id", data.userId), supabaseAdmin.auth.admin.signOut(data.userId)]);
	await recordAuditEvent({
		actorId,
		action: "ACCOUNT_SUSPENDED",
		resourceType: "user",
		resourceId: data.userId,
		afterData: { reason: data.reason },
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
/** Reactivate user account (Admin only) */
var fnAdminReactivateUser_createServerFn_handler = createServerRpc({
	id: "cca1b32e85cac6c5e8073698729623a5c8b013696217102ea5b6a840bf74b91b",
	name: "fnAdminReactivateUser",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnAdminReactivateUser.__executeServer(opts));
var fnAdminReactivateUser = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AdminReactivateSchema).handler(fnAdminReactivateUser_createServerFn_handler, async ({ data, context }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const { supabase, userId: actorId } = context;
	const { data: actorRolesResult } = await supabase.from("user_roles").select("role").eq("user_id", actorId);
	const actorRoles = (actorRolesResult ?? []).map((r) => r.role);
	requirePermission(actorRoles, "ADMIN_SUSPEND_USER");
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const { error } = await supabaseAdmin.from("profiles").update({ status: "ACTIVE" }).eq("id", data.userId);
	if (error) {
		logger.error("Failed to reactivate account", error, {
			event: "admin.reactivate_failed",
			requestId,
			userId: data.userId
		});
		throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Could not reactivate user account.");
	}
	await recordAuditEvent({
		actorId,
		action: "ACCOUNT_ACTIVATED",
		resourceType: "user",
		resourceId: data.userId,
		ipAddress: meta.ipAddress,
		userAgent: meta.userAgent,
		requestId
	});
	return { success: true };
});
/** Assign or Remove user role (Admin/Super Admin only) */
var fnAdminManageRole_createServerFn_handler = createServerRpc({
	id: "34ae6a93f7518eaf70dd124b06b7251686e60e3c04e86a5d89a1f0d2f30d9e11",
	name: "fnAdminManageRole",
	filename: "src/features/identity/identity.functions.ts"
}, (opts) => fnAdminManageRole.__executeServer(opts));
var fnAdminManageRole = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).validator(AdminManageRoleSchema).handler(fnAdminManageRole_createServerFn_handler, async ({ data, context }) => {
	const request = getRequest();
	const requestId = resolveRequestId(request?.headers);
	const meta = auditMetadataFromRequest(request);
	const { supabase, userId: actorId } = context;
	const { data: actorRolesResult } = await supabase.from("user_roles").select("role").eq("user_id", actorId);
	const actorRoles = (actorRolesResult ?? []).map((r) => r.role);
	if (data.action === "assign") requirePermission(actorRoles, "ADMIN_ASSIGN_ROLE");
	else requirePermission(actorRoles, "ADMIN_REMOVE_ROLE");
	const targetIsAdminType = data.role === "admin" || data.role === "super_admin";
	const actorIsSuperAdmin = actorRoles.includes("super_admin");
	if (targetIsAdminType && !actorIsSuperAdmin) throw new AppError(ERROR_CODES.FORBIDDEN, "Only Super Administrators can manage Admin or Super Admin role assignments.");
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	if (data.action === "assign") {
		const { error } = await supabaseAdmin.from("user_roles").insert({
			user_id: data.userId,
			role: data.role,
			granted_by: actorId
		});
		if (error) {
			logger.error("Failed to assign role", error, {
				event: "admin.assign_role_failed",
				requestId,
				userId: data.userId,
				role: data.role
			});
			throw new AppError(ERROR_CODES.CONFLICT, "User already has this role assigned.");
		}
		await recordAuditEvent({
			actorId,
			action: "ROLE_ASSIGNED",
			resourceType: "user_role",
			resourceId: data.userId,
			afterData: { role: data.role },
			ipAddress: meta.ipAddress,
			userAgent: meta.userAgent,
			requestId
		});
	} else {
		if (data.userId === actorId && data.role === "super_admin") throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot remove your own Super Admin role.");
		const { error } = await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId).eq("role", data.role);
		if (error) {
			logger.error("Failed to remove role", error, {
				event: "admin.remove_role_failed",
				requestId,
				userId: data.userId,
				role: data.role
			});
			throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Could not remove user role.");
		}
		await recordAuditEvent({
			actorId,
			action: "ROLE_REMOVED",
			resourceType: "user_role",
			resourceId: data.userId,
			beforeData: { role: data.role },
			ipAddress: meta.ipAddress,
			userAgent: meta.userAgent,
			requestId
		});
	}
	return { success: true };
});
//#endregion
export { fnAdminGetUser_createServerFn_handler, fnAdminListUsers_createServerFn_handler, fnAdminManageRole_createServerFn_handler, fnAdminReactivateUser_createServerFn_handler, fnAdminSuspendUser_createServerFn_handler, fnChangePassword_createServerFn_handler, fnLogin_createServerFn_handler, fnRegister_createServerFn_handler, fnRequestPasswordReset_createServerFn_handler, fnResendVerification_createServerFn_handler, fnResetPassword_createServerFn_handler, fnRevokeSession_createServerFn_handler, fnUpdateMyProfile_createServerFn_handler, fnVerifyEmail_createServerFn_handler, getMyIdentity_createServerFn_handler, getMyProfile_createServerFn_handler, getMySessions_createServerFn_handler, logout_createServerFn_handler, revokeAllSessions_createServerFn_handler };
