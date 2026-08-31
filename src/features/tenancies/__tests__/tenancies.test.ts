/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Query builder helper for mock client
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
    or: vi.fn().mockImplementation(() => builder),
    order: vi.fn().mockImplementation(() => builder),
    limit: vi.fn().mockImplementation(() => builder),
    single: vi.fn().mockImplementation(async () => resolvedValue),
    maybeSingle: vi.fn().mockImplementation(async () => resolvedValue),
    is: vi.fn().mockImplementation(() => builder),
  };
  return builder;
};

let mockQueryResults: any[] = [];
let mockCurrentUser = { userId: "provider-user-uuid", roles: ["landlord"] };

// Mock Supabase Admin Client
vi.mock("@/integrations/supabase/client.server", () => {
  return {
    supabaseAdmin: {
      from: vi.fn().mockImplementation((table) => {
        const result = mockQueryResults.shift() || { data: null, error: null };
        return createQueryBuilder(result);
      }),
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: { user: { email: "landlord@homehunt.co.ke" } },
            error: null,
          }),
        },
      },
      storage: {
        from: vi.fn().mockImplementation(() => ({
          createSignedUrl: vi
            .fn()
            .mockResolvedValue({ data: { signedUrl: "https://signedurl.com/lease" }, error: null }),
        })),
      },
    },
  };
});

// Mock react-start server functions middleware
vi.mock("@tanstack/react-start", () => {
  const chain = {
    middleware: vi.fn().mockImplementation(() => chain),
    validator: vi.fn().mockImplementation(() => chain),
    handler: vi.fn().mockImplementation((handlerFn) => {
      const fn = vi.fn().mockImplementation(async (args: any) => {
        const context = {
          userId: mockCurrentUser.userId,
          claims: { roles: mockCurrentUser.roles },
        };
        return handlerFn({ data: args?.data, context });
      });
      return fn;
    }),
  };
  return {
    createServerFn: vi.fn().mockImplementation(() => chain),
  };
});

// Mock Auth Middleware
vi.mock("@/integrations/supabase/auth-middleware", () => {
  return {
    requireSupabaseAuth: async (next: any) => next(),
  };
});

// Mock Audit Log Server
vi.mock("@/core/audit/audit.server", () => {
  return {
    recordAuditEvent: vi.fn().mockResolvedValue(true),
    auditMetadataFromRequest: vi
      .fn()
      .mockReturnValue({ ipAddress: "127.0.0.1", userAgent: "Vitest" }),
  };
});

// Mock Request Context
vi.mock("@tanstack/react-start/server", () => {
  return {
    getRequest: vi.fn().mockReturnValue({
      headers: new Headers({
        "x-user-id": "provider-user-uuid",
      }),
    }),
  };
});

// Mock Notifications Service
vi.mock("@/features/communication/notifications.server", () => {
  return {
    NotificationService: {
      send: vi.fn().mockResolvedValue(true),
    },
  };
});

import {
  createTenancy,
  prepareLease,
  sendLease,
  acceptLease,
  declineLease,
  executeLease,
  scheduleMoveIn,
  completeMoveIn,
  endTenancy,
  getTenancyDetails,
} from "../tenancies.functions";

describe("Phase 8 Tenancy, Leases & Occupancy Server Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResults = [];
    mockCurrentUser = { userId: "provider-user-uuid", roles: ["landlord"] };
  });

  describe("createTenancy", () => {
    it("successfully creates a new pending tenancy from an approved application", async () => {
      mockCurrentUser = { userId: "landlord-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch application details
        {
          data: {
            id: "app-uuid",
            status: "APPROVED",
            provider_id: "landlord-uuid",
            applicant_id: "seeker-uuid",
            property_id: "property-uuid",
            listing_id: "listing-uuid",
            unit_id: "unit-uuid",
            rent_snapshot: 40000,
            currency_snapshot: "KES",
            billing_period_snapshot: "MONTHLY",
            deposit_snapshot: 40000,
          },
          error: null,
        },
        // 2. Double booking check (no active tenancy for unit)
        { data: null, error: null },
        // 3. Duplicate tenancy check for this application (none found)
        { data: null, error: null },
        // 4. Insert tenancy record
        {
          data: {
            id: "new-tenancy-uuid",
            tenancy_reference: "HH-TEN-2026-000001",
            status: "PENDING",
            tenant_id: "seeker-uuid",
            provider_id: "landlord-uuid",
          },
          error: null,
        },
        // 5. Insert tenancy status history
        { data: null, error: null },
        // 6. Fetch conversation context (none found)
        { data: null, error: null },
      ];

      const result = await createTenancy({
        applicationId: "app-uuid",
      });

      expect(result.success).toBe(true);
      expect(result.tenancyId).toBe("new-tenancy-uuid");
    });

    it("fails tenancy creation if application is not APPROVED", async () => {
      mockCurrentUser = { userId: "landlord-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch application details (UNDER_REVIEW, not approved!)
        {
          data: {
            id: "app-uuid",
            status: "UNDER_REVIEW",
            provider_id: "landlord-uuid",
            applicant_id: "seeker-uuid",
          },
          error: null,
        },
      ];

      await expect(
        createTenancy({
          applicationId: "app-uuid",
        }),
      ).rejects.toThrow(/Only approved applications can be converted/);
    });

    it("prevents double-booking a unit that is already occupied", async () => {
      mockCurrentUser = { userId: "landlord-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch application details
        {
          data: {
            id: "app-uuid",
            status: "APPROVED",
            provider_id: "landlord-uuid",
            applicant_id: "seeker-uuid",
            property_id: "property-uuid",
            unit_id: "unit-uuid",
          },
          error: null,
        },
        // 2. Double booking check (found active tenancy!)
        {
          data: {
            id: "existing-tenancy-uuid",
            tenancy_reference: "HH-TEN-1234",
            status: "OCCUPIED",
          },
          error: null,
        },
      ];

      await expect(
        createTenancy({
          applicationId: "app-uuid",
        }),
      ).rejects.toThrow(/already booked or occupied/);
    });
  });

  describe("prepareLease & sendLease", () => {
    it("successfully drafts and sends a lease to the tenant", async () => {
      mockCurrentUser = { userId: "landlord-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch tenancy detail to verify preparation access
        {
          data: {
            id: "tenancy-uuid",
            provider_id: "landlord-uuid",
            status: "PENDING",
          },
          error: null,
        },
        // 2. Max version check (none)
        { data: [], error: null },
        // 3. Insert new lease draft
        {
          data: {
            id: "lease-uuid",
            version: 1,
            status: "DRAFT",
            rent_amount: 38000,
            deposit_amount: 38000,
            start_date: "2026-09-01",
            end_date: "2027-08-31",
          },
          error: null,
        },
        // 4. Update tenancy status to LEASE_PREPARATION
        { data: null, error: null },
        // 5. Insert status log
        { data: null, error: null },
      ];

      const prepRes = await prepareLease({
        tenancyId: "tenancy-uuid",
        rentAmount: 38000,
        depositAmount: 38000,
        startDate: "2026-09-01",
        endDate: "2027-08-31",
      });

      expect(prepRes.success).toBe(true);
      expect(prepRes.leaseId).toBe("lease-uuid");

      // Now send the lease
      mockQueryResults = [
        // 1. Fetch lease detail
        {
          data: {
            id: "lease-uuid",
            status: "DRAFT",
            tenancy: {
              id: "tenancy-uuid",
              provider_id: "landlord-uuid",
              tenant_id: "seeker-uuid",
              status: "LEASE_PREPARATION",
              tenancy_reference: "HH-TEN-001",
            },
          },
          error: null,
        },
        // 2. Update lease status to SENT_TO_TENANT
        { data: null, error: null },
        // 3. Update tenancy status to AWAITING_ACCEPTANCE
        { data: null, error: null },
        // 4. Status history insert
        { data: null, error: null },
      ];

      const sendRes = await sendLease("lease-uuid");
      expect(sendRes.success).toBe(true);
    });
  });

  describe("acceptLease & declineLease", () => {
    it("logs digital signature values on lease acceptance by seeker", async () => {
      mockCurrentUser = { userId: "seeker-uuid", roles: ["tenant"] };
      mockQueryResults = [
        // 1. Fetch lease detail
        {
          data: {
            id: "lease-uuid",
            status: "SENT_TO_TENANT",
            tenancy: {
              id: "tenancy-uuid",
              tenant_id: "seeker-uuid",
              provider_id: "landlord-uuid",
              tenancy_reference: "HH-TEN-001",
            },
          },
          error: null,
        },
        // 2. Update lease accepted flags
        { data: null, error: null },
      ];

      const res = await acceptLease({
        leaseId: "lease-uuid",
      });

      expect(res.success).toBe(true);
    });

    it("reverts tenancy back to draft terms when lease is declined", async () => {
      mockCurrentUser = { userId: "seeker-uuid", roles: ["tenant"] };
      mockQueryResults = [
        // 1. Fetch lease detail
        {
          data: {
            id: "lease-uuid",
            status: "SENT_TO_TENANT",
            tenancy: {
              id: "tenancy-uuid",
              tenant_id: "seeker-uuid",
              status: "AWAITING_ACCEPTANCE",
              tenancy_reference: "HH-TEN-001",
            },
          },
          error: null,
        },
        // 2. Revert lease status to DRAFT
        { data: null, error: null },
        // 3. Revert tenancy status to LEASE_PREPARATION
        { data: null, error: null },
        // 4. Status log insertion
        { data: null, error: null },
      ];

      const res = await declineLease({
        leaseId: "lease-uuid",
        notes: "Requested a correction to the pet policy limit.",
      });

      expect(res.success).toBe(true);
    });
  });

  describe("executeLease & move-in completion", () => {
    it("fully activates tenancy and locks listing upon countersign execution", async () => {
      mockCurrentUser = { userId: "landlord-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch lease details
        {
          data: {
            id: "lease-uuid",
            status: "TENANT_ACCEPTED",
            start_date: "2026-09-01",
            end_date: "2027-08-31",
            rent_amount: 38000,
            deposit_amount: 38000,
            tenancy: {
              id: "tenancy-uuid",
              provider_id: "landlord-uuid",
              tenant_id: "seeker-uuid",
              status: "AWAITING_ACCEPTANCE",
              tenancy_reference: "HH-TEN-001",
              unit_id: "unit-uuid",
              listing_id: "listing-uuid",
            },
          },
          error: null,
        },
        // 2. Update lease to EXECUTED
        { data: null, error: null },
        // 3. Terminate older leases
        { data: null, error: null },
        // 4. Activate Tenancy
        { data: null, error: null },
        // 5. Tenancy timeline log
        { data: null, error: null },
        // 6. Unit update to RESERVED
        { data: null, error: null },
        // 7. Pause listing
        { data: null, error: null },
        // 8. Fetch conversation
        { data: null, error: null },
      ];

      const res = await executeLease("lease-uuid");
      expect(res.success).toBe(true);
    });

    it("records inspection checks and marks unit OCCUPIED on move-in complete", async () => {
      mockCurrentUser = { userId: "landlord-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch tenancy detail
        {
          data: {
            id: "tenancy-uuid",
            status: "MOVE_IN_PENDING",
            provider_id: "landlord-uuid",
            tenant_id: "seeker-uuid",
            unit_id: "unit-uuid",
            listing_id: "listing-uuid",
          },
          error: null,
        },
        // 2. Update move_in_records details
        { data: null, error: null },
        // 3. Update tenancy status to OCCUPIED
        { data: null, error: null },
        // 4. Status history insert
        { data: null, error: null },
        // 5. Update unit status to OCCUPIED
        { data: null, error: null },
        // 6. Archive listing
        { data: null, error: null },
      ];

      const res = await completeMoveIn({
        tenancyId: "tenancy-uuid",
        actualDate: new Date().toISOString(),
        checklist: {
          keysReceived: true,
          accessConfirmed: true,
          conditionDocumented: true,
          utilityInfoProvided: true,
        },
        conditionNotes: "Unit in pristine condition.",
      });

      expect(res.success).toBe(true);
    });
  });

  describe("Security & IDOR Protection Tests", () => {
    it("prevents Tenant A from accepting Tenant B's lease agreement (IDOR)", async () => {
      mockCurrentUser = { userId: "tenant-A-uuid", roles: ["tenant"] };
      mockQueryResults = [
        // 1. Fetch lease detail owned by Tenant B
        {
          data: {
            id: "lease-uuid",
            status: "SENT_TO_TENANT",
            tenancy: {
              id: "tenancy-uuid",
              tenant_id: "tenant-B-uuid", // mismatch
            },
          },
          error: null,
        },
      ];

      await expect(
        acceptLease({
          leaseId: "lease-uuid",
        }),
      ).rejects.toThrow(/Access Denied/);
    });

    it("prevents landlord A from countersigning landlord B's lease (IDOR)", async () => {
      mockCurrentUser = { userId: "landlord-A-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch lease detail owned by landlord B
        {
          data: {
            id: "lease-uuid",
            status: "TENANT_ACCEPTED",
            tenancy: {
              id: "tenancy-uuid",
              provider_id: "landlord-B-uuid", // mismatch
            },
          },
          error: null,
        },
      ];

      await expect(executeLease("lease-uuid")).rejects.toThrow(/Access Denied/);
    });
  });
});
