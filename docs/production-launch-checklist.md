# HomeHunt Production Launch Gate Checklist

Checklist for controlled production launch of the HomeHunt platform.

## 1. Security & Authorization Gates
- [x] All Supabase database tables have Row Level Security (RLS) enabled.
- [x] Storage buckets `verification-documents` and `lease-documents` are configured as PRIVATE.
- [x] Signed URL expirations are enforced at **15 minutes (900 seconds)** maximum.
- [x] Server-side IDOR authorization checks verified across applications, leases, viewings, and documents.
- [x] Zero API credentials, JWT secrets, or passkeys committed in source code or client bundles.

## 2. Payments & Financial Integrity Gates
- [x] M-Pesa Daraja provider interface implemented supporting production `MPESA_CONSUMER_KEY`, `MPESA_CONSUMER_SECRET`, `MPESA_PASSKEY`, and `MPESA_SHORTCODE`.
- [x] Server determines authoritative payment amounts (browser input is never trusted).
- [x] Webhook callbacks enforce idempotency and checkout transaction correlation.
- [x] Automated payment reconciliation service created for ledger vs. external transactions.
- [x] Double-entry ledger consistency and receipt generation verified.

## 3. AI Subsystem & Safety Gates
- [x] Production AI provider check implemented (Gemini / OpenAI API).
- [x] `DeterministicFallbackProvider` active and tested when API key is missing or external provider fails.
- [x] Prompt injection sanitizer active against directive manipulation.
- [x] AI evaluation suite verified against privacy leaks and hallucination.

## 4. Notifications & Communication Gates
- [x] Multi-provider notification dispatch implemented (Email via Resend/SMTP, SMS via Africa's Talking/Twilio, In-App).
- [x] Deduplication locks prevent double-sending on retried operations.
- [x] All transactional events (viewings, applications, leases, payments) covered.

## 5. Operations & Engineering Quality Gates
- [x] TypeScript compiler passes with **0 errors** (`pnpm exec tsc --noEmit`).
- [x] Vitest unit test suite passes **64/64 tests** across 11 test files (`npx vitest run`).
- [x] ESLint passes with **0 errors** (`npm run lint`).
- [x] Production build passes (`npm run build`).
- [x] Readiness endpoint (`/api/v1/readiness`) active and verifying DB SSL, storage, and secrets.
- [x] Environment configuration template (`.env.example`) documented with safe placeholders.
- [x] Disaster recovery, incident response, rollback runbooks, and legal readiness guidelines documented in `docs/`.
