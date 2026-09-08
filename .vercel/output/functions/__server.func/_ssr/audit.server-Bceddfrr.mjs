import { i as redact, r as logger } from "./request-id-Du7XsDoM.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/audit.server-Bceddfrr.js
/**
* Audit log writer (server-only).
*
* `audit_logs` is append-only: no client role can insert, so writes go through
* the privileged client from inside a verified server boundary.
* Never pass raw secrets, tokens or documents in before/after snapshots — the
* payload is redacted defensively before it is stored.
*/
async function recordAuditEvent(event) {
	const { supabaseAdmin } = await import("./client.server-Ma94aMcQ.mjs").then((n) => n.t);
	const { error } = await supabaseAdmin.from("audit_logs").insert({
		actor_id: event.actorId,
		action: event.action,
		resource_type: event.resourceType,
		resource_id: event.resourceId ?? null,
		before_data: redact(event.beforeData ?? null) ?? null,
		after_data: redact(event.afterData ?? null) ?? null,
		ip_address: event.ipAddress ?? null,
		user_agent: event.userAgent?.slice(0, 512) ?? null,
		request_id: event.requestId ?? null
	});
	if (error) logger.error("Failed to write audit log", error, {
		event: "audit.write_failed",
		action: event.action,
		...event.requestId ? { requestId: event.requestId } : {}
	});
}
/** Extracts safe client metadata for audit records. */
function auditMetadataFromRequest(request) {
	const headers = request?.headers;
	return {
		ipAddress: (headers?.get("x-forwarded-for"))?.split(",")[0]?.trim() ?? headers?.get("cf-connecting-ip") ?? null,
		userAgent: headers?.get("user-agent") ?? null
	};
}
//#endregion
export { recordAuditEvent as n, auditMetadataFromRequest as t };
