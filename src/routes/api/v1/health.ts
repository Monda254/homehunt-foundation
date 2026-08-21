import { createFileRoute } from "@tanstack/react-router";

import { checkApiHealth } from "@/core/health/health-check.server";
import { toErrorResponse } from "@/core/errors/api-error";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/core/observability/request-id";
import { logger } from "@/core/observability/logger";

export const Route = createFileRoute("/api/v1/health")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const requestId = resolveRequestId(request.headers);
        try {
          const report = checkApiHealth();
          logger.info("Health check", { event: "health.api", requestId, status: report.status });

          return new Response(JSON.stringify(report), {
            status: report.status === "error" ? 503 : 200,
            headers: {
              "content-type": "application/json; charset=utf-8",
              [REQUEST_ID_HEADER]: requestId,
              "cache-control": "no-store",
            },
          });
        } catch (error) {
          logger.error("Health check failed", error, { event: "health.api_failed", requestId });
          return toErrorResponse(error, requestId);
        }
      },
    },
  },
});
