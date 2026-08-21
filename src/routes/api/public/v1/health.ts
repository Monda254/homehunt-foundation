import { createFileRoute } from "@tanstack/react-router";

import { checkApiHealth } from "@/core/health/health-check.server";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/core/observability/request-id";

/**
 * Unauthenticated alias of GET /api/v1/health for external uptime monitors.
 * Read-only; exposes no infrastructure detail.
 */
export const Route = createFileRoute("/api/public/v1/health")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const requestId = resolveRequestId(request.headers);
        const report = checkApiHealth();
        return new Response(JSON.stringify({ status: report.status, service: report.service }), {
          status: report.status === "error" ? 503 : 200,
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
