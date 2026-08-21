/**
 * Server-only configuration. MUST only be called from inside a server boundary
 * (`createServerFn().handler()` or a server route handler) — env is injected at
 * request time in the edge runtime, so module-scope reads are undefined.
 */
import { z } from "zod";

import { APP_NAME, API_VERSION } from "./app-config";

const serverEnvSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(10),
});

export type ServerConfig = z.infer<typeof serverEnvSchema> & {
  appName: string;
  apiVersion: string;
};

export type ServerConfigResult =
  { ok: true; config: ServerConfig } | { ok: false; issues: string[] };

/** Validates server configuration without throwing, so health checks can report it. */
export function readServerConfig(
  env: Record<string, string | undefined> = process.env as Record<string, string | undefined>,
): ServerConfigResult {
  const parsed = serverEnvSchema.safeParse({
    APP_ENV: env["APP_ENV"] ?? "development",
    SUPABASE_URL: env["SUPABASE_URL"],
    SUPABASE_PUBLISHABLE_KEY: env["SUPABASE_PUBLISHABLE_KEY"],
  });

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  }

  return {
    ok: true,
    config: { ...parsed.data, appName: APP_NAME, apiVersion: API_VERSION },
  };
}

/** Throwing variant for code paths that cannot degrade gracefully. */
export function requireServerConfig(): ServerConfig {
  const result = readServerConfig();
  if (!result.ok) {
    // Names only — never the values.
    throw new Error(`Invalid server configuration: ${result.issues.join("; ")}`);
  }
  return result.config;
}
