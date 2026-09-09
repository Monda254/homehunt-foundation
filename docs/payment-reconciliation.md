# Payment Reconciliation & Double-Entry Ledger Runbook

## Overview

This document specifies the operational procedures, data model, and reconciliation workflows for M-Pesa payments on the HomeHunt platform.

## Architecture & Data Flow

1. **Initiation**: Client requests STK Push via `fnInitiationStkPush`. Amount and obligation rules are strictly calculated server-side.
2. **Callback Correlation**: Safaricom Daraja sends an asynchronous HTTP POST callback with `CheckoutRequestID`.
3. **Idempotent Ledger Entry**: `processMpesaCallback` validates signature/header authentication, checks for duplicate `CheckoutRequestID`, and records a double-entry ledger item in `payments` / `financial_ledger`.

## Discrepancy Types & Handling

| Discrepancy Type   | Description                                                                             | Remediation Protocol                                                                                    |
| :----------------- | :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------ |
| `MISSING_EXTERNAL` | Ledger entry exists on HomeHunt but not returned in Safaricom Daraja settlement report. | Re-query Daraja API using `CheckoutRequestID`. If confirmed invalid, flag for manual accounting review. |
| `AMOUNT_MISMATCH`  | External gateway recorded an amount different from the double-entry ledger amount.      | Place transaction on hold. Audit system billing logs and issue manual adjustment credit/debit.          |
| `DUPLICATE`        | Payment transaction recorded multiple times for the same reference ID.                  | Trigger automatic reversal for duplicate receipt and retain original successful ledger record.          |

## Automated Reconciliation Job

Run daily at 00:30 UTC via cron or command runner:

```typescript
import { reconcileTransactions } from "@/core/payments/reconciliation.service";

const report = await reconcileTransactions(ledgerEntries, gatewayTransactions);
console.log(`Matched: ${report.totalMatched}, Discrepancies: ${report.totalDiscrepancies}`);
```
