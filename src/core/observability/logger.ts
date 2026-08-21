/**
 * Structured logging.
 *
 * One JSON line per event so logs can be shipped to a central collector later.
 * Sensitive keys are redacted defensively — never log passwords, tokens,
 * secrets, ID documents or full personal records.
 */
import { APP_NAME } from "../config/app-config";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  requestId?: string;
  userId?: string;
  event?: string;
  [key: string]: unknown;
}

const REDACTED = "[redacted]";

const SENSITIVE_KEY_PATTERN =
  /pass(word)?|secret|token|authorization|apikey|api_key|cookie|session|otp|pin|id_number|national_id|card|cvv|iban|private/i;

export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));

  const output: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
    output[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redact(entry, depth + 1);
  }
  return output;
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      ...(error.stack ? { stack: error.stack.split("\n").slice(0, 5).join("\n") } : {}),
    };
  }
  return { message: String(error) };
}

function emit(level: LogLevel, message: string, context: LogContext = {}, error?: unknown): void {
  const { requestId, userId, event, ...rest } = context;
  const line = {
    timestamp: new Date().toISOString(),
    level,
    service: `${APP_NAME.toLowerCase()}-web`,
    message,
    ...(event ? { event } : {}),
    ...(requestId ? { request_id: requestId } : {}),
    ...(userId ? { user_id: userId } : {}),
    ...(Object.keys(rest).length ? { context: redact(rest) } : {}),
    ...(error === undefined ? {} : { error: serializeError(error) }),
  };

  const serialized = JSON.stringify(line);
  if (level === "error") console.error(serialized);
  else if (level === "warn") console.warn(serialized);
  else console.log(serialized);
}

export const logger = {
  debug: (message: string, context?: LogContext) => emit("debug", message, context),
  info: (message: string, context?: LogContext) => emit("info", message, context),
  warn: (message: string, context?: LogContext) => emit("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    emit("error", message, context, error),
};
