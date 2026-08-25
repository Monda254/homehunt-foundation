/**
 * Server-side rate limiting (server-only).
 *
 * Implements a memory-based sliding-window rate limiter for sensitive actions.
 * Ready for Redis transition by preserving key and window parameters.
 */

import { AppError, ERROR_CODES } from "../errors/api-error";

interface RateLimitBucket {
  timestamps: number[];
}

const memoryStore = new Map<string, RateLimitBucket>();

// Clean up expired buckets periodically to avoid memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of memoryStore.entries()) {
    // Keep only timestamps within the last 1 hour
    const active = bucket.timestamps.filter((t) => now - t < 3600 * 1000);
    if (active.length === 0) {
      memoryStore.delete(key);
    } else {
      bucket.timestamps = active;
    }
  }
}, 60 * 1000).unref?.(); // Use unref so the interval doesn't block server termination

/**
 * Checks a rate limit key. Throws a RATE_LIMITED AppError if exceeds limit.
 *
 * @param key Unique identifier (e.g., action:ip or action:email)
 * @param limit Maximum requests allowed in the window
 * @param windowSeconds Window length in seconds
 */
export function checkRateLimit(key: string, limit: number, windowSeconds: number): void {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;

  let bucket = memoryStore.get(key);
  if (!bucket) {
    bucket = { timestamps: [] };
    memoryStore.set(key, bucket);
  }

  // Filter timestamps within current window
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);

  if (bucket.timestamps.length >= limit) {
    throw new AppError(
      ERROR_CODES.RATE_LIMITED,
      "Too many requests. Please wait a moment and try again.",
      { details: { retryAfterSeconds: Math.ceil((bucket.timestamps[0] + windowMs - now) / 1000) } },
    );
  }

  bucket.timestamps.push(now);
}
