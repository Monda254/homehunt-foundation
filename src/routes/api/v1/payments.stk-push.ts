/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute } from "@tanstack/react-router";
import { mpesaProvider } from "@/core/payments/mpesa.provider";
import { REQUEST_ID_HEADER, resolveRequestId } from "@/core/observability/request-id";
import { logger } from "@/core/observability/logger";

export const Route = createFileRoute("/api/v1/payments/stk-push")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const requestId = resolveRequestId(request.headers);
        try {
          const body = await request.json();
          logger.info("[STKPushAPI] STK push request received", {
            requestId,
            amount: body.amount,
            tenancyId: body.tenancyId,
          });

          const result = await mpesaProvider.initiateStkPush(body);

          return new Response(JSON.stringify(result), {
            status: result.success ? 200 : 400,
            headers: {
              "content-type": "application/json; charset=utf-8",
              [REQUEST_ID_HEADER]: requestId,
            },
          });
        } catch (err: any) {
          logger.error("[STKPushAPI] Failed to initiate STK push", {
            error: err.message,
            requestId,
          });
          return new Response(
            JSON.stringify({ success: false, error: err.message || "Internal error" }),
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
