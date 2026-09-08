# HomeHunt Staging Smoke Test & Canary Validation Protocol

## 1. Overview

Before promoting build artifacts to production, operators MUST perform a complete end-to-end smoke test against the Staging environment.

---

## 2. Staging Pre-Requisites

- Staging DB seeded with test landlord (`landlord.staging@homehunt.co.ke`) and test tenant (`tenant.staging@homehunt.co.ke`).
- Safaricom Daraja Sandbox credentials active (`MPESA_ENV=sandbox`).
- AI Fallback mode verified.

---

## 3. End-to-End Test Execution Checklist

| # | User Journey / Workflow Step | Target Endpoint / Page | Expected Behavior | Result |
|---|-----------------------------|-----------------------|-------------------|--------|
| 1 | **Authentication** | `/login` | Successful JWT issuance & session hydration | PASS |
| 2 | **Property Search** | `/homes` | Bounding box search returns listings | PASS |
| 3 | **Trust & Verification** | `/properties/$id` | Verified badges and 15-min signed document URLs | PASS |
| 4 | **Viewing Scheduling** | `/viewings` | Booking request created without time collision | PASS |
| 5 | **Application Submission** | `/applications` | Landlord receives notification & app record created | PASS |
| 6 | **Lease Signing** | `/tenancies` | Electronic acceptance and contract status ACTIVE | PASS |
| 7 | **M-Pesa STK Push** | `/api/v1/payments/stk-push` | STK prompt triggered on test handset | PASS |
| 8 | **Webhook Processing** | `/api/v1/payments/mpesa/callback` | Callback processes idempotently and generates receipt | PASS |
| 9 | **Reconciliation Audit** | `/dashboard/tenancies` | Financials show MATCHED status | PASS |
| 10 | **Health & Readiness** | `/api/v1/readiness` | Returns 200 OK with `status: "ready"` | PASS |
