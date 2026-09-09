# HomeHunt Production Operational Runbook

## 1. Overview & Architecture

HomeHunt is deployed as a unified full-stack web application powered by:

- **Frontend / SSR Runtime**: TanStack Start + React 19 + Vite + Nitro Server Engine
- **Backend Services**: Supabase (PostgreSQL + PostGIS, Auth, Storage)
- **Payment Processing**: Safaricom Daraja M-Pesa API + Internal Double-Entry Ledger
- **AI Engine**: Gemini / OpenAI LLM Providers with Deterministic Rule-Based Fallback

---

## 2. Environment Variables & Secret Management

All sensitive secrets MUST be injected via platform environment variables or managed secrets (e.g. AWS Secrets Manager / Vercel Secrets / Supabase Vault). **NEVER commit raw secrets into Git.**

```env
# Application Runtime
NODE_ENV=production
PORT=3000

# Supabase Platform Credentials
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# Safaricom Daraja M-Pesa Production Configuration
PAYMENT_PROVIDER=mpesa
MPESA_ENV=production
MPESA_CONSUMER_KEY=<safaricom-consumer-key>
MPESA_CONSUMER_SECRET=<safaricom-consumer-secret>
MPESA_PASSKEY=<safaricom-stk-passkey>
MPESA_SHORTCODE=<paybill-or-till-shortcode>
MPESA_CALLBACK_URL=https://homehunt.co.ke/api/v1/payments/mpesa/callback

# Production AI Provider Configuration
OPENAI_API_KEY=<openai-api-key>
GEMINI_API_KEY=<gemini-api-key>

# Communications & Notifications
EMAIL_PROVIDER_API_KEY=<resend-or-smtp-key>
SMS_PROVIDER_API_KEY=<africas-talking-api-key>
```

---

## 3. Production Deployment Protocol

### Step 1: Pre-Deployment Automated Quality Gate

Execute local build and test verification before triggering deployment pipelines:

```bash
# 1. Type Safety
npx tsc --noEmit

# 2. Automated Test Suite
npx vitest run

# 3. Production Compilation
npm run build
```

### Step 2: Database Migration Strategy

Run PostgreSQL schema migrations using Supabase CLI with Expand-Migrate-Contract methodology:

```bash
supabase db push --linked
```

### Step 3: Server Health & Readiness Probes

Post-deployment, query health endpoints to verify container lifecycle and database connectivity:

```bash
# Liveness Check
curl -f https://homehunt.co.ke/api/v1/health

# Readiness Check (Validates DB, Storage, and Configuration)
curl -f https://homehunt.co.ke/api/v1/readiness
```

---

## 4. Monitoring & Telemetry

1. **Structured Telemetry Logs**: Telemetry logs are rendered in JSON format with automatic credential redacting (`[REDACTED]`) for passwords, JWT tokens, and M-Pesa passkeys.
2. **Correlation Tracking**: Every API request includes an `X-Request-ID` header attached to all logs and error responses.
3. **Audit Log Inspection**: High-risk operations (verifications, lease approvals, obligation waivers) are recorded in the `audit_logs` table in PostgreSQL.
