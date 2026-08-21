# HomeHunt Security Specifications

This document outlines the security architecture, data isolation mechanisms, and compliance logging configurations implemented on the HomeHunt platform.

## Authentication & JWT Handling

- **Identity Provider:** Supabase Auth handles authentication and issues JWT access tokens.
- **Client Security:** Tokens are securely managed by the client router using the standard browser context (relying on `localStorage` for cross-origin isolation).
- **Server Verification:** The server verifies incoming bearer tokens (`Bearer <JWT>`) in request middleware (`src/integrations/supabase/auth-middleware.ts`).

## Row Level Security (RLS)

Every table created in the database MUST have Row Level Security enabled. RLS ensures that query calls bypass database exposure even if client credentials are leaked.

- **Profiles table:**
  - Users can read all profiles.
  - Users can only insert or update their own profile records (enforced by `id = auth.uid()`).
- **User Roles table:**
  - Users can only read their own roles.
  - Modifying roles requires platform admin authorization.
- **Audit Logs table:**
  - Append-only table. Read access is restricted solely to `admin` or `super_admin` roles.

## Secrets Management

- **Environment Isolation:** Secrets (database URLs, service role keys, JWT keys) are never committed to git.
- **Template Configuration:** An `.env.example` file is provided in the repository with mock variables. Actual secrets are resolved from `.env` in local development and secure container environments in production.
- **CORS Configuration:** CORS origins are restricted to trusted domains in production, blocking unauthorized cross-origin API calls.

## Audit Log System

Security actions, listing status changes, and user role updates are tracked in the database log:

- **Table:** `public.audit_logs`.
- **Logged Properties:** `actor_id`, `action`, `resource_type`, `resource_id`, `before_data` (JSON state), `after_data` (JSON state), `ip_address`, `user_agent`, and `request_id`.
- **Sensitive Data Filtering:** Password hashes, authorization headers, and personal details are filtered out of database data logs to prevent log leakage.
