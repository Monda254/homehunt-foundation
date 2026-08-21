/**
 * Request / correlation IDs.
 *
 * Clients may supply their own ID, but it is validated before being echoed or
 * logged — an unvalidated client string is a log-injection vector.
 */
export const REQUEST_ID_HEADER = "x-request-id";

const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,64}$/;

export function isValidRequestId(value: string | null | undefined): value is string {
  return typeof value === "string" && REQUEST_ID_PATTERN.test(value);
}

export function generateRequestId(): string {
  // Called per request (never at module scope — global-scope crypto is disallowed
  // in the edge runtime).
  return `req_${crypto.randomUUID().replace(/-/g, "")}`;
}

/** Returns the caller's request ID when it is safe, otherwise a fresh one. */
export function resolveRequestId(headers: Headers | undefined): string {
  const provided = headers?.get(REQUEST_ID_HEADER);
  return isValidRequestId(provided) ? provided : generateRequestId();
}
