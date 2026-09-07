/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

const createQueryBuilder = (resolvedValue: any) => {
  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    insert: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    delete: vi.fn().mockImplementation(() => builder),
    upsert: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    neq: vi.fn().mockImplementation(() => builder),
    in: vi.fn().mockImplementation(() => builder),
    limit: vi.fn().mockImplementation(() => builder),
    order: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(async () => resolvedValue),
    maybeSingle: vi.fn().mockImplementation(async () => resolvedValue),
    then: (onfulfilled: any) => Promise.resolve(resolvedValue).then(onfulfilled),
  };
  return builder;
};

let mockQueryResults: any[] = [];

vi.mock("@/integrations/supabase/client.server", () => {
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation(() => {
        const result = mockQueryResults.shift() || { data: null, error: null };
        return createQueryBuilder(result);
      }),
    },
  };
});

vi.mock("@/features/communication/notifications.server", () => ({
  NotificationService: {
    send: vi.fn().mockResolvedValue({ success: true }),
  },
}));

import { waiveObligation, queryPaymentStatus, generateReceiptPdfData } from "../financials.service";

describe("Phase 9 Financial Infrastructure Services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResults = [];
  });

  describe("waiveObligation", () => {
    it("waives obligation and posts compensating ledger entry for authorized landlord", async () => {
      mockQueryResults = [
        // 1. Fetch obligation and tenancy
        {
          data: {
            id: "ob-1",
            amount: 25000,
            currency: "KES",
            status: "PENDING",
            obligation_type: "RENT",
            tenancy: { id: "ten-1", provider_id: "landlord-123", tenant_id: "tenant-456" },
          },
          error: null,
        },
        // 2. Update obligation status
        { error: null },
        // 3. Insert ledger entry
        { error: null },
      ];

      const result = await waiveObligation("ob-1", "landlord-123", "Tenant advance goodwill credit");

      expect(result.success).toBe(true);
      expect(result.obligationId).toBe("ob-1");
    });

    it("rejects unauthorized waiver attempt from non-landlord user", async () => {
      mockQueryResults = [
        {
          data: {
            id: "ob-1",
            amount: 25000,
            status: "PENDING",
            tenancy: { id: "ten-1", provider_id: "landlord-123", tenant_id: "tenant-456" },
          },
          error: null,
        },
      ];

      await expect(
        waiveObligation("ob-1", "unauthorized-user", "Attempting waiver")
      ).rejects.toThrow("Access Denied");
    });
  });

  describe("queryPaymentStatus", () => {
    it("returns status for completed payment transactions", async () => {
      mockQueryResults = [
        {
          data: { id: "pay-1", status: "SUCCESSFUL", provider_reference: "MPESA-XYZ", amount: 30000 },
          error: null,
        },
      ];

      const res = await queryPaymentStatus("pay-1");

      expect(res.status).toBe("SUCCESSFUL");
      expect(res.settled).toBe(true);
    });
  });

  describe("generateReceiptPdfData", () => {
    it("formats authoritative receipt data for PDF export", async () => {
      mockQueryResults = [
        {
          data: {
            id: "rec-1",
            receipt_number: "REC-2026-001",
            amount: 35000,
            currency: "KES",
            obligation_type: "RENT",
            created_at: new Date().toISOString(),
            payment: {
              payment_method: "M-PESA",
              provider_reference: "MPESA-9999",
              tenancy: {
                tenant_name: "Jane Tenant",
                landlord_name: "John Landlord",
                property_address: "Kilimani, Nairobi",
              },
            },
          },
          error: null,
        },
      ];

      const pdfData = await generateReceiptPdfData("rec-1");

      expect(pdfData.receiptNumber).toBe("REC-2026-001");
      expect(pdfData.amountPaid).toBe(35000);
      expect(pdfData.paymentMethod).toBe("M-PESA");
      expect(pdfData.providerReference).toBe("MPESA-9999");
    });
  });
});
