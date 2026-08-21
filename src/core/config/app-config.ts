/**
 * Centralised, typed application configuration.
 *
 * Rule: no module in the app reads `import.meta.env` or `process.env` directly.
 * Browser-safe values live here; server-only values live in
 * `src/core/config/server-config.ts` and are read inside server boundaries.
 */
import { z } from "zod";

export const APP_NAME = "HomeHunt";
export const API_VERSION = "v1";
export const API_BASE_PATH = `/api/${API_VERSION}` as const;

/** Phase gate — keeps unimplemented modules honest in the UI. */
export const CURRENT_PHASE = {
  id: 0,
  name: "Foundation & Project Setup",
} as const;

const clientEnvSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(10),
});

export type ClientConfig = z.infer<typeof clientEnvSchema> & {
  appName: string;
  apiVersion: string;
  apiBasePath: string;
};

export type ConfigResult = { ok: true; config: ClientConfig } | { ok: false; issues: string[] };

/**
 * Validates browser configuration. Returns a result instead of throwing so the
 * shell can render a readable "misconfigured environment" state.
 */
export function readClientConfig(
  env: Record<string, string | undefined> = import.meta.env as unknown as Record<
    string,
    string | undefined
  >,
): ConfigResult {
  const parsed = clientEnvSchema.safeParse({
    APP_ENV: env["VITE_APP_ENV"] ?? (env["DEV"] ? "development" : "production"),
    SUPABASE_URL: env["VITE_SUPABASE_URL"],
    SUPABASE_PUBLISHABLE_KEY: env["VITE_SUPABASE_PUBLISHABLE_KEY"],
  });

  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  }

  return {
    ok: true,
    config: {
      ...parsed.data,
      appName: APP_NAME,
      apiVersion: API_VERSION,
      apiBasePath: API_BASE_PATH,
    },
  };
}

export function isProduction(config: Pick<ClientConfig, "APP_ENV">): boolean {
  return config.APP_ENV === "production";
}
