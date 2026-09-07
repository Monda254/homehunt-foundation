# HomeHunt — Production Operational Runbook

## 1. Executive Operations Summary

This runbook documents operational procedures for deploying, maintaining, monitoring, and responding to incidents on the **HomeHunt** platform.

---

## 2. Pre-Deployment Verification Checklist

Before deploying changes to production, execute the automated baseline verification:

```bash
# 1. Run full Vitest test suite (Must be 100% passing)
npx vitest run

# 2. Run TypeScript typecheck (Must be 0 errors)
npx tsc --noEmit

# 3. Run ESLint check (Must be 0 errors)
npx eslint .

# 4. Execute production build test
npm run build
```

---

## 3. Rollback Procedure

If a critical incident occurs immediately post-deployment:

1. **Vercel / Frontend Rollback**: Instant rollback to previous deployment build alias via Vercel Dashboard or CLI (`vercel rollback`).
2. **Database Rollback**: Migrations must be forward-safe. Never drop columns or tables destructively. Rollback schema migrations using explicit down scripts in `supabase/migrations`.
3. **Cache & Session Invalidation**: Invalidate active sessions if auth schemas change via `supabaseAdmin.auth.admin.signOut()`.

---

## 4. Incident Response Severity Matrix

| Severity | Definition | Target Resolution Time | Primary Actions |
| :--- | :--- | :--- | :--- |
| **P0 (Critical)** | Core outage, payment failure spike, data exposure, auth bypass. | `< 1 Hour` | 1. Trigger incident channel.<br>2. Rollback deployment.<br>3. Inspect `/api/v1/health`.<br>4. Run `checkSystemIntegrity()`. |
| **P1 (High)** | Major feature broken (e.g. search, applications, viewings). | `< 4 Hours` | 1. Isolate failing route.<br>2. Review correlation logs.<br>3. Deploy targeted patch. |
| **P2 (Medium)** | Degraded UX, notification delay, slow response time. | `< 24 Hours` | 1. Log bug.<br>2. Monitor DB query latencies.<br>3. Schedule fix. |
| **P3 (Low)** | Non-critical UI alignment, cosmetic fix, minor typo. | Continuous | Standard sprint patch. |

---

## 5. Webhook & Payment Troubleshooting

If M-Pesa callbacks or webhook notifications fail:
1. Verify incoming payload correlation ID in logs (`service: homehunt-web`).
2. Confirm endpoint authorization header matches signature.
3. Check `rent_obligations` table status via admin dashboard to confirm transaction reference uniqueness.
4. Execute `checkSystemIntegrity()` diagnostic script to assert payment-to-obligation matching.
