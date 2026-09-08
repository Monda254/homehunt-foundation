/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { mpesaProvider } from "@/core/payments/mpesa.provider";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/core/observability/request-id";
import { logger } from "@/core/observability/logger";

export const Route = createFileRoute("/api/v1/payments/mpesa/callback")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestId = resolveRequestId(request.headers);
        try {
          const payload = await request.json();
          logger.info("[MpesaWebhook] Webhook payload received", { requestId });

          const result = await mpesaProvider.processWebhookCallback(payload);

          return new Response(
            JSON.stringify({
              ResultCode: 0,
              ResultDesc: "Accepted",
              data: result,
            }),
            {
              status: 200,
              headers: {
                "content-type": "application/json; charset=utf-8",
                [REQUEST_ID_HEADER]: requestId,
              },
            },
          );
        } catch (err: any) {
          logger.error("[MpesaWebhook] Failed to process callback", {
            error: err.message,
            requestId,
          });
          return new Response(
            JSON.stringify({ ResultCode: 1, ResultDesc: "Internal Server Error" }),
            {
              status: 500,
              headers: {
                "content-type": "application/json; charset=utf-8",
                [REQUEST_ID_HEADER]: requestId,
              },
            },
          );
        }
      },
    },
  },
});
