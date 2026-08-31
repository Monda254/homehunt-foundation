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
  };
  return builder;
};

let mockQueryResults: any[] = [];

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
            data: { user: { email: "applicant@homehunt.co.ke" } },
            error: null,
          }),
        },
      },
      storage: {
        from: vi.fn().mockImplementation(() => ({
          createSignedUrl: vi
            .fn()
            .mockResolvedValue({ data: { signedUrl: "https://signedurl.com/doc" }, error: null }),
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
        const context = { userId: "applicant-user-uuid", claims: { roles: ["tenant"] } };
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
        "x-user-id": "applicant-user-uuid",
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
  createApplicationDraft,
  submitApplication,
  withdrawApplication,
  providerReviewApplication,
  providerRecordDecision,
} from "../applications.functions";

describe("Phase 7 Rental Applications Server Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResults = [];
  });

  describe("createApplicationDraft", () => {
    it("successfully creates a new application draft", async () => {
      mockQueryResults = [
        // 1. Fetch listing and property
        {
          data: {
            id: "listing-uuid",
            price: 50000,
            currency: "KES",
            status: "PUBLISHED",
            properties: {
              id: "property-uuid",
              owner_user_id: "landlord-user-uuid",
            },
          },
          error: null,
        },
        // 2. Check for active application (none found)
        { data: null, error: null },
        // 3. Insert application record
        {
          data: {
            id: "new-application-uuid",
            application_number: "HH-APP-2026-000001",
            listing_id: "listing-uuid",
            property_id: "property-uuid",
            applicant_id: "applicant-user-uuid",
            provider_id: "landlord-user-uuid",
            status: "DRAFT",
            rent_snapshot: 50000,
            deposit_snapshot: 50000,
            currency_snapshot: "KES",
          },
          error: null,
        },
        // 4. Status history insert
        { data: { id: "history-uuid" }, error: null },
      ];

      const result = await createApplicationDraft({
        listingId: "11111111-1111-1111-1111-111111111111",
      });

      expect(result.success).toBe(true);
      expect(result.applicationId).toBe("new-application-uuid");
    });

    it("prevents duplicate active applications", async () => {
      mockQueryResults = [
        // 1. Fetch listing and property
        {
          data: {
            id: "listing-uuid",
            status: "PUBLISHED",
            properties: {
              id: "property-uuid",
              owner_user_id: "landlord-user-uuid",
            },
          },
          error: null,
        },
        // 2. Check for active application (active draft found!)
        { data: { id: "active-app-uuid", status: "DRAFT" }, error: null },
      ];

      await expect(
        createApplicationDraft({
          listingId: "11111111-1111-1111-1111-111111111111",
        }),
      ).rejects.toThrow(/You already have an active application/);
    });

    it("blocks provider from applying to their own listing", async () => {
      mockQueryResults = [
        // 1. Fetch listing (owner matches seeker context)
        {
          data: {
            id: "listing-uuid",
            status: "PUBLISHED",
            properties: {
              id: "property-uuid",
              owner_user_id: "applicant-user-uuid",
            },
          },
          error: null,
        },
      ];

      await expect(
        createApplicationDraft({
          listingId: "11111111-1111-1111-1111-111111111111",
        }),
      ).rejects.toThrow(/cannot apply for your own properties/);
    });
  });

  describe("submitApplication", () => {
    it("throws error if personal details are incomplete", async () => {
      mockQueryResults = [
        // 1. Fetch application details
        {
          data: {
            id: "app-uuid",
            applicant_id: "applicant-user-uuid",
            status: "DRAFT",
            personal_info: { fullName: "" }, // incomplete
          },
          error: null,
        },
      ];

      await expect(submitApplication("12345678-1234-1234-1234-123456789012")).rejects.toThrow(
        /Personal contact information is incomplete/,
      );
    });

    it("throws error if viewing is required but not completed", async () => {
      mockQueryResults = [
        // 1. Fetch application details (valid profile fields)
        {
          data: {
            id: "app-uuid",
            applicant_id: "applicant-user-uuid",
            status: "DRAFT",
            listing_id: "listing-uuid",
            personal_info: {
              fullName: "Test Seeker",
              phoneNumber: "+2547123",
              email: "test@domain.com",
            },
            employment_info: { status: "EMPLOYED", incomeRange: "KES 50,000 - 100,000" },
            household_info: { adults: 1 },
          },
          error: null,
        },
        // 2. Fetch viewing requirements on listing (viewing_required = true)
        { data: { viewing_required: true }, error: null },
        // 3. Fetch Completed Viewings (none found!)
        { data: [], error: null },
      ];

      await expect(submitApplication("12345678-1234-1234-1234-123456789012")).rejects.toThrow(
        /A completed viewing is required before submitting/,
      );
    });
  });

  describe("withdrawApplication", () => {
    it("successfully withdraws an active application", async () => {
      mockQueryResults = [
        // 1. Fetch application
        {
          data: {
            id: "app-uuid",
            applicant_id: "applicant-user-uuid",
            provider_id: "landlord-uuid",
            status: "SUBMITTED",
            application_number: "HH-APP-2026-000001",
          },
          error: null,
        },
        // 2. Update status to WITHDRAWN
        { data: null, error: null },
        // 3. Status history log
        { data: null, error: null },
      ];

      const result = await withdrawApplication("12345678-1234-1234-1234-123456789012");
      expect(result.success).toBe(true);
    });
  });
});
