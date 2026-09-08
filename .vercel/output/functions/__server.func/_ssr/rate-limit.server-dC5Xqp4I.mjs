import { n as ERROR_CODES, t as AppError } from "./api-error-C5p6KfDB.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/rate-limit.server-dC5Xqp4I.js
/**
* Server-side rate limiting (server-only).
*
* Implements a memory-based sliding-window rate limiter for sensitive actions.
* Ready for Redis transition by preserving key and window parameters.
*/
var memoryStore = /* @__PURE__ */ new Map();
setInterval(() => {
	const now = Date.now();
	for (const [key, bucket] of memoryStore.entries()) {
		const active = bucket.timestamps.filter((t) => now - t < 36e5);
		if (active.length === 0) memoryStore.delete(key);
		else bucket.timestamps = active;
	}
}, 6e4).unref?.();
/**
* Checks a rate limit key. Throws a RATE_LIMITED AppError if exceeds limit.
*
* @param key Unique identifier (e.g., action:ip or action:email)
* @param limit Maximum requests allowed in the window
* @param windowSeconds Window length in seconds
*/
function checkRateLimit(key, limit, windowSeconds) {
	const now = Date.now();
	const windowMs = windowSeconds * 1e3;
	let bucket = memoryStore.get(key);
	if (!bucket) {
		bucket = { timestamps: [] };
		memoryStore.set(key, bucket);
	}
	bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
	if (bucket.timestamps.length >= limit) throw new AppError(ERROR_CODES.RATE_LIMITED, "Too many requests. Please wait a moment and try again.", { details: { retryAfterSeconds: Math.ceil((bucket.timestamps[0] + windowMs - now) / 1e3) } });
	bucket.timestamps.push(now);
}
//#endregion
export { checkRateLimit as t };
