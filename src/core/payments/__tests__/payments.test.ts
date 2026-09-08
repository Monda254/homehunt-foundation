import { describe, it, expect, vi } from "vitest";
import { PaymentReconciliationService } from "../reconciliation.service";
import { mpesaProvider, MpesaPaymentProvider } from "../mpesa.provider";
import type { ReconciliationRecord } from "../payment.types";

describe("Payment Reconciliation Service", () => {
  it("should return empty list when no transactions exist for tenancy", async () => {
    const records = await PaymentReconciliationService.reconcileTenancyPayments(
      "00000000-0000-0000-0000-000000000000",
    );
    expect(Array.isArray(records)).toBe(true);
    expect(records.length).toBe(0);
  });
});

describe("MpesaPaymentProvider", () => {
  it("should initialize mpesaProvider instance correctly", () => {
    expect(mpesaProvider).toBeDefined();
    expect(mpesaProvider.name).toBe("MpesaPaymentProvider");
  });
});
