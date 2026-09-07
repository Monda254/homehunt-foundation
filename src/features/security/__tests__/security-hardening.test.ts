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
      from: vi.fn().mockImplementation(() => {
        const result = mockQueryResults.shift() || { data: null, error: null };
        return createQueryBuilder(result);
      }),
      auth: {
        admin: {
          getUserById: vi.fn().mockResolvedValue({
            data: { user: { email: "user@homehunt.co.ke" } },
            error: null,
          }),
        },
      },
      storage: {
        from: vi.fn().mockImplementation(() => ({
          createSignedUrl: vi
            .fn()
            .mockResolvedValue({ data: { signedUrl: "https://signedurl.com/private-doc" }, error: null }),
        })),
      },
    },
  };
});

// Mock react-start server functions middleware
let mockContextUser = { userId: "tenant-actor-uuid", claims: { roles: ["tenant"] } };

vi.mock("@tanstack/react-start", () => {
  const chain = {
    middleware: vi.fn().mockImplementation(() => chain),
    validator: vi.fn().mockImplementation(() => chain),
    handler: vi.fn().mockImplementation((handlerFn) => {
      const fn = vi.fn().mockImplementation(async (args: any) => {
        return handlerFn({ data: args?.data, context: mockContextUser });
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
      .mockReturnValue({ ipAddress: "127.0.0.1", userAgent: "SecurityAuditAgent" }),
  };
});

// Mock Request Context
vi.mock("@tanstack/react-start/server", () => {
  return {
    getRequest: vi.fn().mockReturnValue({
      headers: new Headers({
        "x-user-id": "tenant-actor-uuid",
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
  withdrawApplication,
  providerRecordDecision,
} from "@/features/applications/applications.functions";
import { fnGetSecureTenancyDocUrl } from "@/features/tenancies/tenancies.functions";
import { reviewVerificationRequest } from "@/features/properties/trust.functions";

describe("Phase 10 Security Hardening & Invariant Audit", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResults = [];
    mockContextUser = { userId: "tenant-actor-uuid", claims: { roles: ["tenant"] } };
  });

  describe("IDOR Protection", () => {
    it("prevents User A from withdrawing User B's application", async () => {
      mockQueryResults = [
        // Fetch application (owned by victim-user-uuid)
        {
          data: {
            id: "app-b-uuid",
            applicant_id: "victim-user-uuid",
            provider_id: "landlord-uuid",
            status: "SUBMITTED",
            application_number: "HH-APP-2026-000099",
          },
          error: null,
        },
      ];

      // Act & Assert: Tenant actor (tenant-actor-uuid) attempts IDOR on app-b-uuid
      await expect(withdrawApplication("22222222-2222-2222-2222-222222222222")).rejects.toThrow(
        /Access Denied: You do not own this application/,
      );
    });

    it("prevents unauthorized user from generating signed URLs for another user's lease document", async () => {
      mockQueryResults = [
        // Fetch tenancy details where tenant is victim-uuid and landlord is landlord-uuid
        {
          data: {
            id: "tenancy-uuid",
            tenant_id: "victim-uuid",
            landlord_id: "landlord-uuid",
            lease_agreement_url: "leases/doc.pdf",
          },
          error: null,
        },
      ];

      // Tenant actor (tenant-actor-uuid) attempts IDOR on victim-uuid's lease document
      await expect(
        fnGetSecureTenancyDocUrl({
          data: {
            tenancyId: "88888888-8888-8888-8888-888888888888",
            documentPath: "leases/doc.pdf",
          },
        } as any),
      ).rejects.toThrow(/Lease document record not found|Unauthorized/);
    });
  });

  describe("RBAC & Privilege Escalation Prevention", () => {
    it("blocks standard tenant from approving verification requests", async () => {
      mockContextUser = { userId: "tenant-actor-uuid", claims: { roles: ["tenant"] } };

      mockQueryResults = [
        // Fetch verification request
        {
          data: {
            id: "44444444-4444-4444-4444-444444444444",
            status: "PENDING",
            subject_type: "PROPERTY",
            subject_id: "prop-uuid",
          },
          error: null,
        },
      ];

      await expect(
        reviewVerificationRequest({
          id: "44444444-4444-4444-4444-444444444444",
          status: "VERIFIED",
        }),
      ).rejects.toThrow(/Missing required permission: VERIFICATION_/);
    });

    it("blocks applicant tenant from invoking provider decision on their own application", async () => {
      mockContextUser = { userId: "applicant-user-uuid", claims: { roles: ["tenant"] } };

      mockQueryResults = [
        {
          data: {
            id: "app-d-uuid",
            applicant_id: "applicant-user-uuid",
            provider_id: "landlord-uuid",
            status: "SUBMITTED",
          },
          error: null,
        },
      ];

      await expect(
        providerRecordDecision({
          applicationId: "55555555-5555-5555-5555-555555555555",
          action: "APPROVE",
        }),
      ).rejects.toThrow(/Missing required permission: APPLICATIONS_MANAGE/);
    });
  });

  describe("State Machine Invariant Checks", () => {
    it("blocks provider from recording invalid status transitions on WITHDRAWN application", async () => {
      mockContextUser = { userId: "landlord-uuid", claims: { roles: ["landlord", "agent"] } };

      mockQueryResults = [
        {
          data: {
            id: "app-withdrawn-uuid",
            applicant_id: "seeker-uuid",
            provider_id: "landlord-uuid",
            status: "WITHDRAWN",
          },
          error: null,
        },
      ];

      await expect(
        providerRecordDecision({
          applicationId: "77777777-7777-7777-7777-777777777777",
          action: "APPROVE",
        }),
      ).rejects.toThrow(/Invalid application status transition/);
    });
  });
});
