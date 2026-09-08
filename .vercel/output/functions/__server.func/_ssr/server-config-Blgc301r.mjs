import { a as enumType, c as objectType, d as stringType } from "../_libs/zod.mjs";
import { t as APP_NAME } from "./request-id-Du7XsDoM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-config-Blgc301r.js
/**
* Server-only configuration. MUST only be called from inside a server boundary
* (`createServerFn().handler()` or a server route handler) — env is injected at
* request time in the edge runtime, so module-scope reads are undefined.
*/
var serverEnvSchema = objectType({
	APP_ENV: enumType([
		"development",
		"staging",
		"production"
	]).default("development"),
	SUPABASE_URL: stringType().url(),
	SUPABASE_PUBLISHABLE_KEY: stringType().min(10)
});
/** Validates server configuration without throwing, so health checks can report it. */
function readServerConfig(env = process.env) {
	const parsed = serverEnvSchema.safeParse({
		APP_ENV: env["APP_ENV"] ?? "development",
		SUPABASE_URL: env["SUPABASE_URL"] ?? env["VITE_SUPABASE_URL"] ?? "https://ljffnleivjgbzyoajapk.supabase.co",
		SUPABASE_PUBLISHABLE_KEY: env["SUPABASE_PUBLISHABLE_KEY"] ?? env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? "sb_publishable_wcrajNTOgB_9myTj7jI8jA_pbL0Zivo"
	});
	if (!parsed.success) return {
		ok: false,
		issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`)
	};
	return {
		ok: true,
		config: {
			...parsed.data,
			appName: APP_NAME,
			apiVersion: "v1"
		}
	};
}
//#endregion
export { readServerConfig as t };
