# HomeHunt — Phase 9 Financial Infrastructure & Transaction Lifecycle

## 1. Overview

Phase 9 defines the trusted financial and legal transaction infrastructure for **HomeHunt**, converting user interest into verified tenancies through a structured lifecycle:

`DISCOVER -> COMPARE -> VERIFY -> VIEW -> APPLY -> APPROVE -> LEASE -> PAY -> LIVE`

---

## 2. Financial Architecture & Entities

### 2.1 Rental Applications (`rental_applications`)

- Connects applicants, listings, units, and property managers.
- Enforces strict state transitions (`DRAFT` -> `SUBMITTED` -> `UNDER_REVIEW` -> `APPROVED` / `REJECTED` / `WITHDRAWN`).
- Requires completed viewing appointments when mandated by listings.

### 2.2 Lease Management (`leases` & `lease_versions`)

- Stores contractual terms, rent amounts, security deposits, and start/end dates.
- Immutable lease versions prevent silent post-signing modifications.
- Digital lease documents stored in private Supabase Storage buckets with short-lived (15-minute) signed URLs.

### 2.3 Financial Obligations (`rent_obligations`) & Ledger (`ledger_entries`)

- Separates obligations (what the tenant owes) from settled transactions (actual payments).
- Supports recurring rent schedules, security deposits, and partial payments.

### 2.4 Payments & Provider Abstraction (`payments`)

- Authoritative server-side payment amounts (prevents client-side amount manipulation).
- Provider abstraction layer (`PaymentProvider` interface) supporting both local mock providers (`PAYMENT_PROVIDER=mock`) and production M-Pesa STK push.
- Idempotent callback/webhook processing using unique provider transaction references.
- Immutable, server-numbered payment receipts (`receipts`).

---

## 3. Security & Compliance Invariants

1. **Client Control:** Server determines authoritative financial amounts; client payloads cannot dictate payment values.
2. **Credential Isolation:** Raw M-Pesa PINs, credit card numbers, CVVs, or payment passwords are never stored or logged.
3. **Data Redaction:** Observability logger redacts payment secrets, tokens, and checkout IDs defensively.
4. **Row Level Security:** Financial records are strictly isolated by `auth.uid()` and RBAC permission checks.
