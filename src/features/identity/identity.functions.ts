import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { AppError, ERROR_CODES } from "@/core/errors/api-error";
import { isAppRole, type AppRole } from "@/core/auth/roles";
import { logger } from "@/core/observability/logger";
import { resolveRequestId } from "@/core/observability/request-id";

export interface IdentitySnapshot {
  userId: string;
  email: string | null;
  fullName: string | null;
  phoneNumber: string | null;
  preferredCounty: string | null;
  onboardingCompleted: boolean;
  roles: AppRole[];
  requestId: string;
}

/**
 * Authenticated identity read. RLS scopes both queries to the caller, so no
 * privileged client is involved.
 */
export const getMyIdentity = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<IdentitySnapshot> => {
    const requestId = resolveRequestId(getRequest()?.headers);
    const { supabase, userId, claims } = context;

    const [profileResult, rolesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, phone_number, preferred_county, onboarding_completed")
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

    return {
      userId,
      email,
      fullName: profileResult.data?.full_name ?? null,
      phoneNumber: profileResult.data?.phone_number ?? null,
      preferredCounty: profileResult.data?.preferred_county ?? null,
      onboardingCompleted: profileResult.data?.onboarding_completed ?? false,
      roles: (rolesResult.data ?? []).map((row) => row.role as string).filter(isAppRole),
      requestId,
    };
  });
