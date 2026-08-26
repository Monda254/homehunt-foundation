import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AppError, ERROR_CODES } from "@/core/errors/api-error";
import { isAppRole, requirePermission, hasPermission, type AppRole } from "@/core/auth/roles";
import { logger } from "@/core/observability/logger";
import { resolveRequestId } from "@/core/observability/request-id";
import { recordAuditEvent, auditMetadataFromRequest } from "@/core/audit/audit.server";
import { emailService } from "@/core/auth/email-sms.server";
import { checkRateLimit } from "@/core/auth/rate-limit.server";
import type { Database } from "@/integrations/supabase/types";

// =============================================================
// Helper: get base URL for redirects
// =============================================================
function getBaseUrl(): string {
  const env = process.env.APP_ENV ?? "development";
  return env === "development" ? "http://localhost:3000" : "https://homehunt.dev";
}

// =============================================================
// Helper: create temporary client to perform public authentication operations
// =============================================================
function createPublicAuthClient() {
  const SUPABASE_URL = process.env["SUPABASE_URL"];
  const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error("Supabase public credentials missing in environment");
  }
  return createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// =============================================================
// Types and Schemas
// =============================================================
export interface IdentitySnapshot {
  userId: string;
  email: string | null;
  fullName: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  preferredCounty: string | null;
  county: string | null;
  town: string | null;
  preferredLanguage: string;
  onboardingCompleted: boolean;
  status: string;
  roles: AppRole[];
  requestId: string;
}

// Zod schemas for input validation
const RegisterSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().min(1, "Last name is required").max(60),
  email: z.string().email("Invalid email address"),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{9,15}$/, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["tenant", "landlord", "agent"]),
});

const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const VerifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});

const ResendVerificationSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const RequestPasswordResetSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ResetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmNewPassword: z.string(),
});

const UpdateProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(60),
  lastName: z.string().min(1, "Last name is required").max(60),
  displayName: z.string().max(60).optional(),
  bio: z.string().max(500).optional(),
  county: z.string().max(60).optional(),
  town: z.string().max(60).optional(),
  preferredLanguage: z.string().max(10).default("en"),
});

const AdminListUsersSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
});

const AdminSuspendSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  reason: z.string().min(1, "Suspension reason is required"),
});

const AdminReactivateSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
});

const AdminManageRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID"),
  role: z.enum([
    "tenant",
    "landlord",
    "agent",
    "property_manager",
    "verifier",
    "admin",
    "super_admin",
  ]),
  action: z.enum(["assign", "remove"]),
});

// =============================================================
// Server Operations
// =============================================================

/** Read authenticated identity snapshot */
export const getMyIdentity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<IdentitySnapshot> => {
    const requestId = resolveRequestId(getRequest()?.headers);
    const { supabase, userId, claims } = context;

    const [profileResult, rolesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "full_name, first_name, last_name, phone_number, preferred_county, county, town, preferred_language, onboarding_completed, status",
        )
        .eq("id", userId)
        .maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", userId),
    ]);

    if (profileResult.error || rolesResult.error) {
      logger.error("Identity read failed", profileResult.error ?? rolesResult.error, {
        event: "identity.read_failed",
        requestId,
        userId,
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
      roles: (rolesResult.data ?? []).map((row) => row.role as string).filter(isAppRole),
      requestId,
    };
  });

/** User Registration */
const fnRegister = createServerFn({ method: "POST" })
  .validator(RegisterSchema)
  .handler(async ({ data }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);

    // Rate limit registration by IP
    const rateLimitKey = `register:${meta.ipAddress ?? "unknown"}`;
    checkRateLimit(rateLimitKey, 5, 3600);

    const email = data.email.trim().toLowerCase();
    if (data.password !== data.confirmPassword) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Passwords do not match.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check if email already registered
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    const isTaken = existingUser?.users?.some((u) => u.email?.toLowerCase() === email);
    if (isTaken) {
      // Balance security (prevent enumeration) with UX: Registration explicitly rejects duplicate emails
      throw new AppError(ERROR_CODES.CONFLICT, "An account with this email already exists.");
    }

    // Create user in Supabase Auth.
    // Trigger `on_auth_user_created` will create the profile and default user role.
    const { data: userAuth, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: data.password,
      email_confirm: false, // forces verification flow
      user_metadata: {
        full_name: `${data.firstName} ${data.lastName}`.trim(),
        first_name: data.firstName,
        last_name: data.lastName,
        phone_number: data.phoneNumber || null,
        role: data.role,
      },
    });

    if (authError || !userAuth.user) {
      logger.error("Authentication signup failed", authError, {
        event: "register.failed",
        requestId,
        email,
      });
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Could not create user account.");
    }

    const userId = userAuth.user.id;

    // Generate cryptographically secure verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
    const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString(); // 24 hours

    // Insert verification token
    const { error: tokenError } = await supabaseAdmin.from("verification_tokens").insert({
      user_id: userId,
      token_hash: tokenHash,
      expires_at: expiresAt,
    });

    if (tokenError) {
      logger.error("Failed to write verification token", tokenError, {
        event: "register.token_write_failed",
        requestId,
        userId,
      });
      // Try to clean up user if token creation fails
      await supabaseAdmin.auth.admin.deleteUser(userId);
      throw new AppError(
        ERROR_CODES.INTERNAL_ERROR,
        "An error occurred during registration setup.",
      );
    }

    // Send verification email
    await emailService.sendVerificationEmail(email, verificationToken);

    // Record audit logs
    await Promise.all([
      recordAuditEvent({
        actorId: userId,
        action: "USER_REGISTERED",
        resourceType: "user",
        resourceId: userId,
        afterData: { email, role: data.role, name: `${data.firstName} ${data.lastName}` },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        requestId,
      }),
      recordAuditEvent({
        actorId: userId,
        action: "EMAIL_VERIFICATION_SENT",
        resourceType: "token",
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        requestId,
      }),
    ]);

    return { success: true, status: "PENDING_VERIFICATION" };
  });

/** User Authentication / Login */
const fnLogin = createServerFn({ method: "POST" })
  .validator(LoginSchema)
  .handler(async ({ data }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);

    const email = data.email.trim().toLowerCase();

    // Rate limit login attempts by email
    const rateLimitKey = `login:${email}`;
    checkRateLimit(rateLimitKey, 10, 300); // 10 attempts in 5 mins

    // Login using publishable client on server side
    const client = createPublicAuthClient();
    const { data: authData, error: authError } = await client.auth.signInWithPassword({
      email,
      password: data.password,
    });

    if (authError || !authData.session || !authData.user) {
      // Record login failure event
      await recordAuditEvent({
        actorId: null,
        action: "LOGIN_FAILED",
        resourceType: "user",
        beforeData: { email },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        requestId,
      });

      logger.warn("User login failed", { event: "login.failed", requestId, email });
      throw new AppError(ERROR_CODES.UNAUTHENTICATED, "Email or password is incorrect.");
    }

    const userId = authData.user.id;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Check account profile status
    const [profileResult, rolesResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", userId),
    ]);

    const profile = profileResult.data;
    if (!profile) {
      logger.error("Profile matching authenticated user was not found", null, {
        event: "login.profile_missing",
        requestId,
        userId,
      });
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to load account details.");
    }

    const roles = (rolesResult.data ?? []).map((row) => row.role as AppRole);

    if (
      profile.status === "SUSPENDED" ||
      profile.status === "LOCKED" ||
      profile.status === "DEACTIVATED"
    ) {
      // Sign out since user account is suspended
      await supabaseAdmin.auth.admin.signOut(authData.session.access_token);
      await recordAuditEvent({
        actorId: userId,
        action: "LOGIN_FAILED",
        resourceType: "user",
        resourceId: userId,
        beforeData: { status: profile.status },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        requestId,
      });

      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        `Your account has been ${profile.status.toLowerCase()}. Please contact support.`,
      );
    }

    // Insert active session track
    const sessionTokenHash = crypto
      .createHash("sha256")
      .update(authData.session.access_token)
      .digest("hex");
    const expiresAt = new Date(Date.now() + authData.session.expires_in * 1000).toISOString();

    const { error: sessionError } = await supabaseAdmin.from("sessions").insert({
      user_id: userId,
      session_token_hash: sessionTokenHash,
      expires_at: expiresAt,
      ip_address: meta.ipAddress,
      user_agent: meta.userAgent,
    });

    if (sessionError) {
      logger.error("Failed to write custom session record", sessionError, {
        event: "login.session_write_failed",
        requestId,
        userId,
      });
    }

    // Update last_login_at in profile
    await supabaseAdmin
      .from("profiles")
      .update({ last_login_at: new Date().toISOString() })
      .eq("id", userId);

    // Audit log
    await recordAuditEvent({
      actorId: userId,
      action: "LOGIN_SUCCESS",
      resourceType: "user",
      resourceId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
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
          preferredLanguage: profile.preferred_language,
        },
      },
    };
  });

/** Revoke user session / Logout */
export const logout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ success: boolean }> => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);
    const { userId, token, tokenHash } = context;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Invalidate session in public.sessions
    await supabaseAdmin
      .from("sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("session_token_hash", tokenHash);

    // Revoke inside Supabase Auth
    await supabaseAdmin.auth.admin.signOut(token);

    // Record audit event
    await recordAuditEvent({
      actorId: userId,
      action: "LOGOUT",
      resourceType: "user",
      resourceId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

/** Verify Email */
const fnVerifyEmail = createServerFn({ method: "POST" })
  .validator(VerifyEmailSchema)
  .handler(async ({ data }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);

    // Hashing token
    const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Query verification tokens
    const { data: vt, error } = await supabaseAdmin
      .from("verification_tokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !vt || vt.used_at || new Date(vt.expires_at) < new Date()) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Verification link is invalid or has expired.");
    }

    const userId = vt.user_id;

    // Confirm email in auth.users
    const { error: confirmError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email_confirm: true,
    });

    if (confirmError) {
      logger.error("Failed to confirm email in auth.users", confirmError, {
        event: "verify_email.auth_confirm_failed",
        requestId,
        userId,
      });
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "An error occurred while confirming email.");
    }

    // Set used_at and status = ACTIVE
    await Promise.all([
      supabaseAdmin
        .from("verification_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", vt.id),
      supabaseAdmin.from("profiles").update({ status: "ACTIVE" }).eq("id", userId),
    ]);

    // Record audit event
    await recordAuditEvent({
      actorId: userId,
      action: "EMAIL_VERIFIED",
      resourceType: "user",
      resourceId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

/** Resend Email Verification link */
const fnResendVerification = createServerFn({ method: "POST" })
  .validator(ResendVerificationSchema)
  .handler(async ({ data }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);

    const email = data.email.trim().toLowerCase();

    // Rate limit resend requests by email
    checkRateLimit(`resend_verification:${email}`, 3, 600); // Max 3 resends in 10 mins

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Lookup user in auth
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users?.find((u) => u.email?.toLowerCase() === email);

    if (user) {
      // Verify profile is pending verification
      const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .maybeSingle();

      if (profile && profile.status === "PENDING_VERIFICATION") {
        // Invalidate old tokens
        await supabaseAdmin
          .from("verification_tokens")
          .update({ used_at: new Date().toISOString() })
          .eq("user_id", user.id)
          .is("used_at", null);

        // Generate new token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const tokenHash = crypto.createHash("sha256").update(verificationToken).digest("hex");
        const expiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();

        await supabaseAdmin.from("verification_tokens").insert({
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        });

        // Dispatches verification email
        await emailService.sendVerificationEmail(email, verificationToken);

        await recordAuditEvent({
          actorId: user.id,
          action: "EMAIL_VERIFICATION_SENT",
          resourceType: "token",
          ipAddress: meta.ipAddress,
          userAgent: meta.userAgent,
          requestId,
        });
      }
    }

    // Return generic response to avoid account enumeration
    return { success: true };
  });

/** Forgot Password / Reset request */
const fnRequestPasswordReset = createServerFn({ method: "POST" })
  .validator(RequestPasswordResetSchema)
  .handler(async ({ data }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);

    const email = data.email.trim().toLowerCase();

    // Rate limit
    checkRateLimit(`forgot_password:${email}`, 3, 600);

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const user = users?.users?.find((u) => u.email?.toLowerCase() === email);

    if (user) {
      // Invalidate previous reset tokens
      await supabaseAdmin
        .from("password_reset_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .is("used_at", null);

      // Create new reset token
      const resetToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour

      await supabaseAdmin.from("password_reset_tokens").insert({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      });

      // Send password reset email
      await emailService.sendPasswordResetEmail(email, resetToken);

      await recordAuditEvent({
        actorId: user.id,
        action: "PASSWORD_RESET_REQUESTED",
        resourceType: "token",
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        requestId,
      });
    }

    // Generic response protects against enumeration
    return {
      success: true,
      message: "If an account exists for that email, we've sent instructions.",
    };
  });

/** Reset Password using token */
const fnResetPassword = createServerFn({ method: "POST" })
  .validator(ResetPasswordSchema)
  .handler(async ({ data }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);

    if (data.password !== data.confirmPassword) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Passwords do not match.");
    }

    // Hash token
    const tokenHash = crypto.createHash("sha256").update(data.token).digest("hex");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Fetch reset token
    const { data: rt, error } = await supabaseAdmin
      .from("password_reset_tokens")
      .select("*")
      .eq("token_hash", tokenHash)
      .maybeSingle();

    if (error || !rt || rt.used_at || new Date(rt.expires_at) < new Date()) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Reset link is invalid or has expired.");
    }

    const userId = rt.user_id;

    // Update password in Supabase Auth
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.password,
    });

    if (updateError) {
      logger.error("Failed to reset password in auth.users", updateError, {
        event: "reset_password.failed",
        requestId,
        userId,
      });
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update your password.");
    }

    // Invalidate reset token and revoke all existing sessions
    await Promise.all([
      supabaseAdmin
        .from("password_reset_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", rt.id),
      supabaseAdmin
        .from("sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("user_id", userId),
      supabaseAdmin.auth.admin.signOut(userId), // Revokes all active refresh tokens in Supabase
    ]);

    // Record audit event
    await recordAuditEvent({
      actorId: userId,
      action: "PASSWORD_RESET_COMPLETED",
      resourceType: "user",
      resourceId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

/** Change Password from settings */
const fnChangePassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(ChangePasswordSchema)
  .handler(async ({ data, context }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);
    const { userId, tokenHash } = context;

    if (data.newPassword !== data.confirmNewPassword) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Passwords do not match.");
    }

    // Get user email
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: userAuth } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (!userAuth.user || !userAuth.user.email) {
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Account not found.");
    }

    // Verify current password by signing in
    const client = createPublicAuthClient();
    const { error: verifyError } = await client.auth.signInWithPassword({
      email: userAuth.user.email,
      password: data.currentPassword,
    });

    if (verifyError) {
      throw new AppError(ERROR_CODES.UNAUTHENTICATED, "Current password is incorrect.");
    }

    // Update password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: data.newPassword,
    });

    if (updateError) {
      logger.error("Failed to change password", updateError, {
        event: "change_password.failed",
        requestId,
        userId,
      });
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to update your password.");
    }

    // Revoke all OTHER sessions (keep current session tokenHash active)
    await supabaseAdmin
      .from("sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .neq("session_token_hash", tokenHash);

    // Record audit event
    await recordAuditEvent({
      actorId: userId,
      action: "PASSWORD_CHANGED",
      resourceType: "user",
      resourceId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

/** Get current user's profile details */
export const getMyProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      throw new AppError(ERROR_CODES.DEPENDENCY_UNAVAILABLE, "Could not load profile.");
    }

    return data;
  });

/** Update current user's profile information */
const fnUpdateMyProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(UpdateProfileSchema)
  .handler(async ({ data, context }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);
    const { supabase, userId } = context;

    // Fetch original profile data for audit history
    const { data: original } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    const fullName = `${data.firstName} ${data.lastName}`.trim();

    const { data: updated, error } = await supabase
      .from("profiles")
      .update({
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: fullName,
        display_name: data.displayName || null,
        bio: data.bio || null,
        county: data.county || null,
        town: data.town || null,
        preferred_language: data.preferredLanguage,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .maybeSingle();

    if (error || !updated) {
      logger.error("Failed to update profile", error, {
        event: "profile.update_failed",
        requestId,
        userId,
      });
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Could not update profile information.");
    }

    // Record audit event
    await recordAuditEvent({
      actorId: userId,
      action: "PROFILE_UPDATED",
      resourceType: "profile",
      resourceId: userId,
      beforeData: original
        ? {
            first_name: original.first_name,
            last_name: original.last_name,
            display_name: original.display_name,
            bio: original.bio,
            county: original.county,
            town: original.town,
            preferred_language: original.preferred_language,
          }
        : null,
      afterData: {
        first_name: updated.first_name,
        last_name: updated.last_name,
        display_name: updated.display_name,
        bio: updated.bio,
        county: updated.county,
        town: updated.town,
        preferred_language: updated.preferred_language,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return updated;
  });

/** Get current user's active session list */
export const getMySessions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data, error } = await supabase
      .from("sessions")
      .select("id, created_at, last_seen_at, ip_address, user_agent, session_token_hash")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.DEPENDENCY_UNAVAILABLE, "Could not load active sessions.");
    }

    // Mark current session in the list
    return (data ?? []).map((sess) => ({
      id: sess.id,
      createdAt: sess.created_at,
      lastSeenAt: sess.last_seen_at,
      ipAddress: sess.ip_address as string | null,
      userAgent: sess.user_agent,
      isCurrent: sess.session_token_hash === context.tokenHash,
    }));
  });

/** Revoke specific session */
const fnRevokeSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ sessionId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);
    const { userId } = context;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Load session details
    const { data: session } = await supabaseAdmin
      .from("sessions")
      .select("user_id, session_token_hash")
      .eq("id", data.sessionId)
      .maybeSingle();

    if (!session) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "Session not found.");
    }

    // Ensure session belongs to current user
    if (session.user_id !== userId) {
      throw new AppError(ERROR_CODES.FORBIDDEN, "Unauthorized session modification.");
    }

    // Update revoked_at
    await supabaseAdmin
      .from("sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("id", data.sessionId);

    // Record audit event
    await recordAuditEvent({
      actorId: userId,
      action: "SESSION_REVOKED",
      resourceType: "session",
      resourceId: data.sessionId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

/** Revoke all sessions (except current or absolutely all) */
export const revokeAllSessions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);
    const { userId, tokenHash } = context;

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Mark revoked in sessions table
    await supabaseAdmin
      .from("sessions")
      .update({ revoked_at: new Date().toISOString() })
      .eq("user_id", userId)
      .neq("session_token_hash", tokenHash); // Keep current session active

    // Record audit event
    await recordAuditEvent({
      actorId: userId,
      action: "SESSION_REVOKED",
      resourceType: "session",
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

// =============================================================
// Admin Functions
// =============================================================

/** List all users (Admin only) */
const fnAdminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(AdminListUsersSchema)
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Check permissions
    const { data: userRolesResult } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
    const roles = (userRolesResult ?? []).map((r) => r.role as AppRole);
    requirePermission(roles, "ADMIN_VIEW_USERS");

    const offset = (data.page - 1) * data.pageSize;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Query profiles count & records
    let query = supabaseAdmin
      .from("profiles")
      .select(
        "id, full_name, phone_number, status, onboarding_completed, created_at, last_login_at",
        {
          count: "exact",
        },
      );

    if (data.status) {
      query = query.eq("status", data.status as never);
    }

    if (data.search) {
      query = query.or(`full_name.ilike.%${data.search}%,phone_number.ilike.%${data.search}%`);
    }

    query = query
      .order("created_at", { ascending: false })
      .range(offset, offset + data.pageSize - 1);

    const { data: list, count, error } = await query;
    if (error) {
      logger.error("Admin user list load failed", error, { event: "admin.list_users_failed" });
      throw new AppError(ERROR_CODES.DEPENDENCY_UNAVAILABLE, "Could not load user list.");
    }

    // Load emails and roles for listed user profiles
    const userIds = (list ?? []).map((u) => u.id);
    const [authUsers, userRoles] = await Promise.all([
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", userIds),
    ]);

    const usersMapped = (list ?? []).map((profile) => {
      const email = authUsers.data.users.find((au) => au.id === profile.id)?.email ?? null;
      const rolesForUser = (userRoles.data ?? [])
        .filter((ur) => ur.user_id === profile.id)
        .map((ur) => ur.role as AppRole);

      return {
        id: profile.id,
        fullName: profile.full_name,
        phoneNumber: profile.phone_number,
        email,
        status: profile.status,
        onboardingCompleted: profile.onboarding_completed,
        createdAt: profile.created_at,
        lastLoginAt: profile.last_login_at,
        roles: rolesForUser,
      };
    });

    return {
      users: usersMapped,
      totalCount: count ?? 0,
      page: data.page,
      pageSize: data.pageSize,
    };
  });

/** Retrieve specific user profiles and roles (Admin only) */
const fnAdminGetUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .validator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const { supabase, userId: actorId } = context;

    // Check permissions
    const { data: actorRolesResult } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", actorId);
    const actorRoles = (actorRolesResult ?? []).map((r) => r.role as AppRole);
    requirePermission(actorRoles, "ADMIN_VIEW_USERS");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const [profileResult, authUserResult, rolesResult, sessionsResult] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", data.userId).maybeSingle(),
      supabaseAdmin.auth.admin.getUserById(data.userId),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", data.userId),
      supabaseAdmin
        .from("sessions")
        .select("id, created_at, last_seen_at, revoked_at, ip_address, user_agent")
        .eq("user_id", data.userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    const profile = profileResult.data;
    if (!profile) {
      throw new AppError(ERROR_CODES.NOT_FOUND, "User profile not found.");
    }

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
      onboardingCompleted: profile.onboarding_completed,
      createdAt: profile.created_at,
      lastLoginAt: profile.last_login_at,
      roles: (rolesResult.data ?? []).map((r) => r.role as AppRole),
      sessions: (sessionsResult.data ?? []).map((s) => ({
        id: s.id,
        createdAt: s.created_at,
        lastSeenAt: s.last_seen_at,
        revokedAt: s.revoked_at,
        ipAddress: s.ip_address as string | null,
        userAgent: s.user_agent,
      })),
    };
  });

/** Suspend user account (Admin only) */
const fnAdminSuspendUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(AdminSuspendSchema)
  .handler(async ({ data, context }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);
    const { supabase, userId: actorId } = context;

    // Check permissions
    const { data: actorRolesResult } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", actorId);
    const actorRoles = (actorRolesResult ?? []).map((r) => r.role as AppRole);
    requirePermission(actorRoles, "ADMIN_SUSPEND_USER");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Ensure we are not suspending ourselves
    if (data.userId === actorId) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot suspend your own account.");
    }

    // Update status to SUSPENDED
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: "SUSPENDED" })
      .eq("id", data.userId);

    if (error) {
      logger.error("Failed to suspend account", error, {
        event: "admin.suspend_failed",
        requestId,
        userId: data.userId,
      });
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Could not suspend user account.");
    }

    // Revoke all active sessions
    await Promise.all([
      supabaseAdmin
        .from("sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("user_id", data.userId),
      supabaseAdmin.auth.admin.signOut(data.userId),
    ]);

    // Record audit event
    await recordAuditEvent({
      actorId,
      action: "ACCOUNT_SUSPENDED",
      resourceType: "user",
      resourceId: data.userId,
      afterData: { reason: data.reason },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

/** Reactivate user account (Admin only) */
const fnAdminReactivateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(AdminReactivateSchema)
  .handler(async ({ data, context }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);
    const { supabase, userId: actorId } = context;

    // Check permissions
    const { data: actorRolesResult } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", actorId);
    const actorRoles = (actorRolesResult ?? []).map((r) => r.role as AppRole);
    requirePermission(actorRoles, "ADMIN_SUSPEND_USER");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Update status to ACTIVE
    const { error } = await supabaseAdmin
      .from("profiles")
      .update({ status: "ACTIVE" })
      .eq("id", data.userId);

    if (error) {
      logger.error("Failed to reactivate account", error, {
        event: "admin.reactivate_failed",
        requestId,
        userId: data.userId,
      });
      throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Could not reactivate user account.");
    }

    // Record audit event
    await recordAuditEvent({
      actorId,
      action: "ACCOUNT_ACTIVATED",
      resourceType: "user",
      resourceId: data.userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

/** Assign or Remove user role (Admin/Super Admin only) */
const fnAdminManageRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(AdminManageRoleSchema)
  .handler(async ({ data, context }) => {
    const request = getRequest();
    const requestId = resolveRequestId(request?.headers);
    const meta = auditMetadataFromRequest(request);
    const { supabase, userId: actorId } = context;

    // Check permissions
    const { data: actorRolesResult } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", actorId);
    const actorRoles = (actorRolesResult ?? []).map((r) => r.role as AppRole);

    // Assigning/Removing role requires ADMIN_ASSIGN_ROLE/ADMIN_REMOVE_ROLE permission
    if (data.action === "assign") {
      requirePermission(actorRoles, "ADMIN_ASSIGN_ROLE");
    } else {
      requirePermission(actorRoles, "ADMIN_REMOVE_ROLE");
    }

    // Super Admin privilege restriction: Ordinary Admin cannot modify Admin/Super Admin roles
    const targetIsAdminType = data.role === "admin" || data.role === "super_admin";
    const actorIsSuperAdmin = actorRoles.includes("super_admin");
    if (targetIsAdminType && !actorIsSuperAdmin) {
      throw new AppError(
        ERROR_CODES.FORBIDDEN,
        "Only Super Administrators can manage Admin or Super Admin role assignments.",
      );
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    if (data.action === "assign") {
      const { error } = await supabaseAdmin.from("user_roles").insert({
        user_id: data.userId,
        role: data.role,
        granted_by: actorId,
      });

      if (error) {
        logger.error("Failed to assign role", error, {
          event: "admin.assign_role_failed",
          requestId,
          userId: data.userId,
          role: data.role,
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
        requestId,
      });
    } else {
      // Prevent deleting our own role if it leaves us lock out
      if (data.userId === actorId && data.role === "super_admin") {
        throw new AppError(ERROR_CODES.BAD_REQUEST, "You cannot remove your own Super Admin role.");
      }

      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);

      if (error) {
        logger.error("Failed to remove role", error, {
          event: "admin.remove_role_failed",
          requestId,
          userId: data.userId,
          role: data.role,
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
        requestId,
      });
    }

    return { success: true };
  });

export const register = (data: z.infer<typeof RegisterSchema>) => fnRegister({ data });
export const login = (data: z.infer<typeof LoginSchema>) => fnLogin({ data });
export const verifyEmail = (data: z.infer<typeof VerifyEmailSchema>) => fnVerifyEmail({ data });
export const resendVerification = (data: z.infer<typeof ResendVerificationSchema>) =>
  fnResendVerification({ data });
export const requestPasswordReset = (data: z.infer<typeof RequestPasswordResetSchema>) =>
  fnRequestPasswordReset({ data });
export const resetPassword = (data: z.infer<typeof ResetPasswordSchema>) =>
  fnResetPassword({ data });
export const changePassword = (data: z.infer<typeof ChangePasswordSchema>) =>
  fnChangePassword({ data });
export const updateMyProfile = (data: z.infer<typeof UpdateProfileSchema>) =>
  fnUpdateMyProfile({ data });
export const revokeSession = (data: { sessionId: string }) => fnRevokeSession({ data });
export const adminListUsers = (data: z.infer<typeof AdminListUsersSchema>) =>
  fnAdminListUsers({ data });
export const adminGetUser = (data: { userId: string }) => fnAdminGetUser({ data });
export const adminSuspendUser = (data: z.infer<typeof AdminSuspendSchema>) =>
  fnAdminSuspendUser({ data });
export const adminReactivateUser = (data: z.infer<typeof AdminReactivateSchema>) =>
  fnAdminReactivateUser({ data });
export const adminManageRole = (data: z.infer<typeof AdminManageRoleSchema>) =>
  fnAdminManageRole({ data });
