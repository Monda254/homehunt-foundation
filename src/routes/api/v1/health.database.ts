import { createFileRoute } from "@tanstack/react-router";

import { checkDatabaseHealth } from "@/core/health/health-check.server";
import { toErrorResponse } from "@/core/errors/api-error";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/core/observability/request-id";
import { logger } from "@/core/observability/logger";

export const Route = createFileRoute("/api/v1/health/database")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const requestId = resolveRequestId(request.headers);
        try {
          const report = await checkDatabaseHealth();
          logger.info("Database health check", {
            event: "health.database",
            requestId,
            status: report.status,
          });

          return new Response(JSON.stringify(report), {
            status: report.status === "error" ? 503 : 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              [REQUEST_ID_HEADER]: requestId,
              "cache-control": "no-store",
            },
          });
        } catch (error) {
          logger.error("Database health check errored", error, {
            event: "health.database_failed",
            requestId,
          });
          return toErrorResponse(error, requestId);
        }
      },
    },
  },
});
