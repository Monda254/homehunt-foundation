/**
 * Health checks (server-only).
 *
 * Distinguishes application health from dependency health and never leaks
 * connection strings, keys or driver messages.
 */
import { readServerConfig } from "../config/server-config";
import { logger } from "../observability/logger";

export type ComponentStatus = "ok" | "degraded" | "unavailable" | "not_configured";

export interface HealthReport {
  status: "ok" | "degraded" | "error";
  service: string;
  version: string;
  environment: string;
  checked_at: string;
  components: Record<string, { status: ComponentStatus; latency_ms?: number; detail?: string }>;
}

function baseReport(): HealthReport {
  const config = readServerConfig();
  return {
    status: config.ok ? "ok" : "error",
    service: "homehunt-api",
    version: "v1",
    environment: config.ok ? config.config.APP_ENV : "unknown",
    checked_at: new Date().toISOString(),
    components: {
      application: { status: "ok" },
      configuration: config.ok
        ? { status: "ok" }
        : {
            status: "unavailable",
            detail: `invalid configuration: ${config.issues.length} issue(s)`,
          },
      // Redis/queue layer is not part of this deployment target; the caching and
      // background-job contract is documented in docs/architecture.
      cache: { status: "not_configured", detail: "managed cache not enabled in this environment" },
    },
  };
}

export function checkApiHealth(): HealthReport {
  return baseReport();
}

export async function checkDatabaseHealth(): Promise<HealthReport> {
  const report = baseReport();
  const startedAt = Date.now();

  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("profiles")
      .select("id", { head: true, count: "exact" });

    if (error) throw error;

    report.components["database"] = { status: "ok", latency_ms: Date.now() - startedAt };
  } catch (error) {
    logger.error("Database health check failed", error, { event: "health.database_failed" });
    report.components["database"] = {
      status: "unavailable",
      latency_ms: Date.now() - startedAt,
      detail: "database not reachable",
    };
    report.status = "error";
  }

  return report;
}
