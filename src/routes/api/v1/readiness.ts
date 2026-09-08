/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";
import { readServerConfig } from "@/core/config/server-config";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/core/observability/request-id";
import { logger } from "@/core/observability/logger";

const supabaseAdmin = rawSupabaseAdmin as any;

export const Route = createFileRoute("/api/v1/readiness")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestId = resolveRequestId(request.headers);
        const startTime = Date.now();

        const checks: Record<string, { status: "pass" | "warn" | "fail"; details?: string }> = {};

        // 1. Environment Config check
        const configResult = readServerConfig();
        if (configResult.ok) {
          checks.config = { status: "pass" };
        } else {
          checks.config = {
            status: "warn",
            details: `Missing production environment variables: ${configResult.issues.join(", ")}`,
          };
        }

        // 2. Database Connectivity check
        try {
          const { error } = await supabaseAdmin.from("profiles").select("id").limit(1);
          if (error) {
            checks.database = { status: "fail", details: error.message };
          } else {
            checks.database = { status: "pass" };
          }
        } catch (err: any) {
          checks.database = { status: "fail", details: err.message || "Database connection error" };
        }

        // 3. Storage Bucket check
        try {
          const { data, error } = await supabaseAdmin.storage.listBuckets();
          if (error) {
            checks.storage = { status: "warn", details: error.message };
          } else {
            checks.storage = {
              status: "pass",
              details: `${data?.length || 0} storage buckets accessible`,
            };
          }
        } catch (err: any) {
          checks.storage = { status: "warn", details: err.message || "Storage access error" };
        }

        const isReady =
          checks.database?.status === "pass" &&
          (checks.config?.status === "pass" || checks.config?.status === "warn");

        const responsePayload = {
          status: isReady ? "ready" : "not_ready",
          timestamp: new Date().toISOString(),
          latencyMs: Date.now() - startTime,
          checks,
        };

        logger.info("Readiness evaluation", {
          event: "health.readiness",
          requestId,
          status: responsePayload.status,
        });

        return new Response(JSON.stringify(responsePayload), {
          status: isReady ? 200 : 503,
          headers: {
            "content-type": "application/json; charset=utf-8",
            [REQUEST_ID_HEADER]: requestId,
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
