import { a as enumType, c as objectType, d as stringType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/request-id-Du7XsDoM.js
/**
* Centralised, typed application configuration.
*
* Rule: no module in the app reads `import.meta.env` or `process.env` directly.
* Browser-safe values live here; server-only values live in
* `src/core/config/server-config.ts` and are read inside server boundaries.
*/
var APP_NAME = "HomeHunt";
objectType({
	APP_ENV: enumType([
		"development",
		"staging",
		"production"
	]).default("development"),
	SUPABASE_URL: stringType().url(),
	SUPABASE_PUBLISHABLE_KEY: stringType().min(10)
});
/**
* Structured logging.
*
* One JSON line per event so logs can be shipped to a central collector later.
* Sensitive keys are redacted defensively — never log passwords, tokens,
* secrets, ID documents or full personal records.
*/
var REDACTED = "[redacted]";
var SENSITIVE_KEY_PATTERN = /pass(word)?|secret|token|authorization|apikey|api_key|cookie|session|otp|pin|id_number|national_id|card|cvv|iban|private|mpesa|checkout_id|stk|msisdn/i;
function redact(value, depth = 0) {
	if (depth > 4 || value === null || typeof value !== "object") return value;
	if (Array.isArray(value)) return value.map((item) => redact(item, depth + 1));
	const output = {};
	for (const [key, entry] of Object.entries(value)) output[key] = SENSITIVE_KEY_PATTERN.test(key) ? REDACTED : redact(entry, depth + 1);
	return output;
}
function serializeError(error) {
	if (error instanceof Error) return {
		name: error.name,
		message: error.message,
		...error.stack ? { stack: error.stack.split("\n").slice(0, 5).join("\n") } : {}
	};
	return { message: String(error) };
}
function emit(level, message, context = {}, error) {
	const { requestId, userId, event, ...rest } = context;
	const line = {
		timestamp: (/* @__PURE__ */ new Date()).toISOString(),
		level,
		service: `${APP_NAME.toLowerCase()}-web`,
		message,
		...event ? { event } : {},
		...requestId ? { request_id: requestId } : {},
		...userId ? { user_id: userId } : {},
		...Object.keys(rest).length ? { context: redact(rest) } : {},
		...error === void 0 ? {} : { error: serializeError(error) }
	};
	const serialized = JSON.stringify(line);
	if (level === "error") console.error(serialized);
	else if (level === "warn") console.warn(serialized);
	else console.log(serialized);
}
var logger = {
	debug: (message, context) => emit("debug", message, context),
	info: (message, context) => emit("info", message, context),
	warn: (message, context) => emit("warn", message, context),
	error: (message, error, context) => emit("error", message, context, error)
};
/**
* Request / correlation IDs.
*
* Clients may supply their own ID, but it is validated before being echoed or
* logged — an unvalidated client string is a log-injection vector.
*/
var REQUEST_ID_HEADER = "x-request-id";
var REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{8,64}$/;
function isValidRequestId(value) {
	return typeof value === "string" && REQUEST_ID_PATTERN.test(value);
}
function generateRequestId() {
	return `req_${crypto.randomUUID().replace(/-/g, "")}`;
}
/** Returns the caller's request ID when it is safe, otherwise a fresh one. */
function resolveRequestId(headers) {
	const provided = headers?.get(REQUEST_ID_HEADER);
	return isValidRequestId(provided) ? provided : generateRequestId();
}
//#endregion
export { resolveRequestId as a, redact as i, REQUEST_ID_HEADER as n, logger as r, APP_NAME as t };
