/**
 * Audit log writer (server-only).
 *
 * `audit_logs` is append-only: no client role can insert, so writes go through
 * the privileged client from inside a verified server boundary.
 * Never pass raw secrets, tokens or documents in before/after snapshots — the
 * payload is redacted defensively before it is stored.
 */
import { redact, logger } from "../observability/logger";

export interface AuditEvent {
  actorId: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

export async function recordAuditEvent(event: AuditEvent): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { error } = await supabaseAdmin.from("audit_logs").insert({
    actor_id: event.actorId,
    action: event.action,
    resource_type: event.resourceType,
    resource_id: event.resourceId ?? null,
    before_data: (redact(event.beforeData ?? null) ?? null) as never,
    after_data: (redact(event.afterData ?? null) ?? null) as never,
    ip_address: event.ipAddress ?? null,
    user_agent: event.userAgent?.slice(0, 512) ?? null,
    request_id: event.requestId ?? null,
  });

  if (error) {
    // Audit failures must be visible but must not break the user's action.
    logger.error("Failed to write audit log", error, {
      event: "audit.write_failed",
      action: event.action,
      ...(event.requestId ? { requestId: event.requestId } : {}),
    });
  }
}

/** Extracts safe client metadata for audit records. */
export function auditMetadataFromRequest(request: Request | undefined): {
  ipAddress: string | null;
  userAgent: string | null;
} {
  const headers = request?.headers;
  const forwarded = headers?.get("x-forwarded-for");
  return {
    ipAddress: forwarded?.split(",")[0]?.trim() ?? headers?.get("cf-connecting-ip") ?? null,
    userAgent: headers?.get("user-agent") ?? null,
  };
}
