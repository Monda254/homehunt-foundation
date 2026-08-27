/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @tanstack/react-start server function wrapper to execute handlers directly
vi.mock("@tanstack/react-start", () => {
  const chain = {
    middleware: vi.fn().mockImplementation(() => chain),
    validator: vi.fn().mockImplementation(() => chain),
    handler: vi.fn().mockImplementation((handlerFn) => {
      // Return a function that executes the inner handler with mocked context
      const fn = vi.fn().mockImplementation(async (args: any) => {
        const context = { userId: "test-user-id", claims: { roles: ["admin"] } };
        return handlerFn({ data: args?.data, context });
      });
      return fn;
    }),
  };
  return {
    createServerFn: vi.fn().mockImplementation(() => chain),
  };
});

import {
  submitVerificationRequest,
  reviewVerificationRequest,
  submitPropertyClaim,
  reportListing,
  confirmListingFreshness,
} from "../trust.functions";

// Mock Supabase Admin Client
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({
    eq: vi.fn(() => ({
      in: vi.fn(() => ({
        maybeSingle: mockMaybeSingle,
      })),
      maybeSingle: mockMaybeSingle,
    })),
    in: vi.fn(() => ({
      maybeSingle: mockMaybeSingle,
    })),
    gte: vi.fn(() => ({
      select: vi.fn(() => ({
        count: 0,
      })),
    })),
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  })),
  order: vi.fn(() => ({
    data: [],
    error: null,
  })),
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
}));

const mockUpdate = vi.fn(() => ({
  eq: vi.fn(() => ({
    error: null,
  })),
}));

const mockInsert = vi.fn(() => ({
  select: vi.fn(() => ({
    single: mockSingle,
  })),
  error: null,
}));

const mockDelete = vi.fn(() => ({
  eq: vi.fn(() => ({
    error: null,
  })),
}));

vi.mock("@/integrations/supabase/client.server", () => {
  return {
    supabaseAdmin: {
      from: vi.fn((table) => {
        return {
          select: mockSelect,
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
        };
      }),
    },
  };
});

// Mock Auth Middleware
vi.mock("@/integrations/supabase/auth-middleware", () => {
  return {
    requireSupabaseAuth: async (next: any) => next(),
  };
});

// Mock Audit logging
vi.mock("@/core/audit/audit.server", () => {
  return {
    recordAuditEvent: vi.fn().mockResolvedValue(true),
    auditMetadataFromRequest: vi
      .fn()
      .mockReturnValue({ ipAddress: "127.0.0.1", userAgent: "Vitest" }),
  };
});

// Mock Request context extraction
vi.mock("@tanstack/react-start/server", () => {
  return {
    getRequest: vi.fn().mockReturnValue({
      headers: new Headers({
        "x-user-id": "test-user-id",
      }),
    }),
  };
});

describe("Phase 4 Trust & Verification Server Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("submitVerificationRequest", () => {
    it("successfully submits a verification request with evidence", async () => {
      // Mock no existing active verification
      mockMaybeSingle.mockResolvedValue({ data: null, error: null });

      // Mock verification insert
      mockSingle.mockResolvedValueOnce({
        data: { id: "test-ver-id", status: "PENDING" },
        error: null,
      });

      const result = await submitVerificationRequest({
        subjectType: "USER",
        subjectId: "95632eb9-923f-4a0b-80cc-c5e3f43b67bb",
        verificationType: "IDENTITY",
        evidence: [{ evidenceType: "Passport ID", storageReference: "user-id/passport.jpg" }],
      });

      expect(result.success).toBe(true);
      expect(result.verificationId).toBe("test-ver-id");
    });
  });

  describe("submitPropertyClaim", () => {
    it("successfully submits property claim if no conflicting approved claims", async () => {
      // Mock no active conflict
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      // Mock inserts
      mockSingle.mockResolvedValueOnce({
        data: { id: "test-claim-id", status: "PENDING" },
        error: null,
      });
      mockSingle.mockResolvedValueOnce({
        data: { id: "test-ver-id", status: "PENDING" },
        error: null,
      });

      const result = await submitPropertyClaim({
        propertyId: "95632eb9-923f-4a0b-80cc-c5e3f43b67bb",
        evidence: [{ evidenceType: "Title Deed", storageReference: "prop-id/deed.pdf" }],
      });

      expect(result.success).toBe(true);
      expect(result.claimId).toBe("test-claim-id");
    });
  });
});
