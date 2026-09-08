# HomeHunt Production Readiness Gap Matrix

Authoritative Gap Matrix for controlled production launch readiness.

| Gap Dimension | Current Baseline | Target Production State | Required Change | Status | Verification Method |
| --- | --- | --- | --- | --- | --- |
| **M-Pesa Production Readiness** | Mock payment flow in dev | Safaricom Daraja STK Push & OAuth client | Implement `MpesaPaymentProvider` with CheckoutRequestID correlation & signature validation | **IMPLEMENTED & VERIFIED** | Unit test suite & environment validation |
| **Payment Reconciliation** | Single transaction recording | Automated ledger vs gateway audit | Implement `ReconciliationService` (`MATCHED`, `MISSING`, `MISMATCH`, `DUPLICATE`) | **IMPLEMENTED & VERIFIED** | Unit tests in `financials.test.ts` |
| **Webhook Resilience** | Standard endpoint handling | Idempotency locked state transitions | Enforce idempotency key locks & handling for out-of-order/duplicate callbacks | **IMPLEMENTED & VERIFIED** | Unit tests for duplicate webhooks |
| **Notification Providers** | Structured logger dispatch | Multi-provider dispatch (SMTP/Resend, AT/Twilio) | Modular adapters for Email/SMS with fallback logging and deduplication | **IMPLEMENTED & VERIFIED** | Notification service test verification |
| **Storage Security & Signed URLs** | Public URL generation | Private buckets + 15-min signed URLs | Enforce 15-min (900s) expiry on `verification-documents` & `lease-documents` | **IMPLEMENTED & VERIFIED** | `fnGetSecureTenancyDocUrl` tests |
| **RLS & IDOR Security** | 96.0% audit score | 100% strict server-side authorization | Server-side actor ID verification across all application, lease, and document calls | **IMPLEMENTED & VERIFIED** | `security-hardening.test.ts` pass |
| **Production AI Activation** | Deterministic engine | Gemini/OpenAI API + Deterministic Fallback | Generative provider check with fallback guarantee when key missing or API fails | **IMPLEMENTED & VERIFIED** | `ai-evaluation.test.ts` |
| **AI Safety & Fallbacks** | Basic keyword sanitizer | Prompt injection & privacy protection | Guard against prompt injection directives and privacy leaks | **IMPLEMENTED & VERIFIED** | Injection test suite pass |
| **Health & Readiness APIs** | Liveness `/api/v1/health` | Multi-layer readiness validation | Implement `/api/v1/readiness` checking DB SSL, storage, and secrets | **IMPLEMENTED & VERIFIED** | HTTP endpoint & unit tests |
| **File Upload Security** | File extension check | Magic number MIME & size validation | Server-side magic-number checking to prevent executable file uploads | **IMPLEMENTED & VERIFIED** | Upload security validator |
| **Accessibility (WCAG 2.1 AA)** | Modern shadcn/ui components | Accessible focus, ARIA & reduced motion | Keyboard navigation, focus trapping, screen-reader text, and motion preference checks | **IMPLEMENTED & VERIFIED** | Accessibility review audit |
| **Performance & PostGIS** | Optimized client rendering | LCP < 2.5s, spatial index coverage | PostGIS GIST indexes on geometry and indexed listing queries | **IMPLEMENTED & VERIFIED** | SQL schema & performance review |
| **Observability & Logging** | Request IDs & logger | Structured JSON logging with zero leak | Redact passwords, secrets, tokens, and credentials from all telemetry | **IMPLEMENTED & VERIFIED** | Logger unit tests & audit |
| **Disaster Recovery & Runbooks** | Standard operations doc | Documented RTO/RPO, backup & restore | Create RTO/RPO procedures, rollback runbook, and incident response guide | **IMPLEMENTED & VERIFIED** | `docs/disaster-recovery.md` |
| **Legal & Product Claims** | Absolute claims in marketing | Defensible trust boundaries | Replace "100% scam-free" with "Verification-backed housing platform" | **IMPLEMENTED & VERIFIED** | Product claim audit |
