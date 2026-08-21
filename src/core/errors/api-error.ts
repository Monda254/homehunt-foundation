/**
 * Single source of truth for API/domain errors and their wire format.
 * Every endpoint and server function surfaces failures through this shape:
 *
 * { "error": { "code": "...", "message": "...", "request_id": "..." } }
 */

export const ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
  CONFIGURATION_ERROR: "CONFIGURATION_ERROR",
  DEPENDENCY_UNAVAILABLE: "DEPENDENCY_UNAVAILABLE",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  BAD_REQUEST: 400,
  VALIDATION_FAILED: 422,
  UNAUTHENTICATED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  PAYLOAD_TOO_LARGE: 413,
  CONFIGURATION_ERROR: 500,
  DEPENDENCY_UNAVAILABLE: 503,
  INTERNAL_ERROR: 500,
  NOT_IMPLEMENTED: 501,
};

export interface ApiErrorBody {
  error: {
    code: ErrorCode;
    message: string;
    request_id: string;
    details?: unknown;
  };
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  /** Safe, user-facing detail only. Never provider internals or secrets. */
  readonly details?: unknown;

  constructor(code: ErrorCode, message: string, options?: { details?: unknown; cause?: unknown }) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = STATUS_BY_CODE[code];
    this.details = options?.details;
    if (options?.cause !== undefined) this.cause = options.cause;
  }
}

export function statusForCode(code: ErrorCode): number {
  return STATUS_BY_CODE[code];
}

/**
 * Normalises any thrown value into the public error body. Unknown errors are
 * flattened to INTERNAL_ERROR so stack traces never reach users.
 */
export function toApiErrorBody(error: unknown, requestId: string): ApiErrorBody {
  if (error instanceof AppError) {
    return {
      error: {
        code: error.code,
        message: error.message,
        request_id: requestId,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    };
  }

  return {
    error: {
      code: ERROR_CODES.INTERNAL_ERROR,
      message: "An unexpected error occurred. Please try again.",
      request_id: requestId,
    },
  };
}

export function toErrorResponse(error: unknown, requestId: string): Response {
  const body = toApiErrorBody(error, requestId);
  const status = error instanceof AppError ? error.status : 500;

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "x-request-id": requestId,
      "cache-control": "no-store",
    },
  });
}
