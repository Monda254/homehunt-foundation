import { a as getRequest, l as createMiddleware } from "./server-BRCrXnf-.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-error-C5p6KfDB.js
function isNewSupabaseApiKey(value) {
	return value.startsWith("sb_publishable_") || value.startsWith("sb_secret_");
}
function createSupabaseFetch(supabaseKey) {
	return (input, init) => {
		const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : void 0);
		if (init?.headers) new Headers(init.headers).forEach((value, key) => headers.set(key, value));
		if (isNewSupabaseApiKey(supabaseKey) && headers.get("Authorization") === `Bearer ${supabaseKey}`) headers.delete("Authorization");
		headers.set("apikey", supabaseKey);
		return fetch(input, {
			...init,
			headers
		});
	};
}
var requireSupabaseAuth = createMiddleware({ type: "function" }).server(async ({ next }) => {
	const SUPABASE_URL = process.env["SUPABASE_URL"] || process.env["VITE_SUPABASE_URL"] || "https://ljffnleivjgbzyoajapk.supabase.co";
	const SUPABASE_PUBLISHABLE_KEY = process.env["SUPABASE_PUBLISHABLE_KEY"] || process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_wcrajNTOgB_9myTj7jI8jA_pbL0Zivo";
	if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
		const message = `Missing Supabase environment variable(s): ${[...!SUPABASE_URL ? ["SUPABASE_URL"] : [], ...!SUPABASE_PUBLISHABLE_KEY ? ["SUPABASE_PUBLISHABLE_KEY"] : []].join(", ")}. Please configure them in your environment variables.`;
		console.error(`[Supabase] ${message}`);
		throw new Error(message);
	}
	const request = getRequest();
	if (!request?.headers) throw new Error("Unauthorized: No request headers available");
	const authHeader = request.headers.get("authorization");
	if (!authHeader) throw new Error("Unauthorized: No authorization header provided");
	if (!authHeader.startsWith("Bearer ")) throw new Error("Unauthorized: Only Bearer tokens are supported");
	const token = authHeader.replace("Bearer ", "");
	if (!token) throw new Error("Unauthorized: No token provided");
	if (token.split(".").length !== 3) throw new Error("Unauthorized: Invalid token");
	const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
		global: {
			fetch: createSupabaseFetch(SUPABASE_PUBLISHABLE_KEY),
			headers: { Authorization: `Bearer ${token}` }
		},
		auth: {
			storage: void 0,
			persistSession: false,
			autoRefreshToken: false
		}
	});
	const { data, error } = await supabase.auth.getClaims(token);
	if (error || !data?.claims) throw new Error("Unauthorized: Invalid token");
	if (!data.claims.sub) throw new Error("Unauthorized: No user ID found in token");
	const userId = data.claims.sub;
	const crypto = await import("crypto");
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
	const [profileResult, sessionResult] = await Promise.all([supabaseAdmin.from("profiles").select("status").eq("id", userId).maybeSingle(), supabaseAdmin.from("sessions").select("revoked_at").eq("session_token_hash", tokenHash).maybeSingle()]);
	if (profileResult.data) {
		const status = profileResult.data.status;
		if (status === "SUSPENDED" || status === "LOCKED" || status === "DEACTIVATED") throw new Error(`Unauthorized: Account is ${status}`);
	}
	if (sessionResult.data && sessionResult.data.revoked_at) throw new Error("Unauthorized: Session has been revoked");
	return next({ context: {
		supabase,
		userId,
		claims: data.claims,
		token,
		tokenHash
	} });
});
/**
* Single source of truth for API/domain errors and their wire format.
* Every endpoint and server function surfaces failures through this shape:
*
* { "error": { "code": "...", "message": "...", "request_id": "..." } }
*/
var ERROR_CODES = {
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
	NOT_IMPLEMENTED: "NOT_IMPLEMENTED"
};
var STATUS_BY_CODE = {
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
	NOT_IMPLEMENTED: 501
};
var AppError = class extends Error {
	code;
	status;
	/** Safe, user-facing detail only. Never provider internals or secrets. */
	details;
	constructor(code, message, options) {
		super(message);
		this.name = "AppError";
		this.code = code;
		this.status = STATUS_BY_CODE[code];
		this.details = options?.details;
		if (options?.cause !== void 0) this.cause = options.cause;
	}
};
/**
* Normalises any thrown value into the public error body. Unknown errors are
* flattened to INTERNAL_ERROR so stack traces never reach users.
*/
function toApiErrorBody(error, requestId) {
	if (error instanceof AppError) return { error: {
		code: error.code,
		message: error.message,
		request_id: requestId,
		...error.details === void 0 ? {} : { details: error.details }
	} };
	return { error: {
		code: ERROR_CODES.INTERNAL_ERROR,
		message: "An unexpected error occurred. Please try again.",
		request_id: requestId
	} };
}
function toErrorResponse(error, requestId) {
	const body = toApiErrorBody(error, requestId);
	const status = error instanceof AppError ? error.status : 500;
	return new Response(JSON.stringify(body), {
		status,
		headers: {
			"content-type": "application/json; charset=utf-8",
			"x-request-id": requestId,
			"cache-control": "no-store"
		}
	});
}
//#endregion
export { toErrorResponse as i, ERROR_CODES as n, requireSupabaseAuth as r, AppError as t };
