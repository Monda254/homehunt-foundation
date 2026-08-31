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
let mockCurrentUser = { userId: "applicant-user-uuid", roles: ["tenant"] };

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
  providerRequestInformation,
  respondToInformationRequest,
  getApplicationDetails,
  getSecureApplicationDocUrl,
} from "../applications.functions";

describe("Phase 7 Extended Application Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResults = [];
    // Reset defaults
    mockCurrentUser = { userId: "applicant-user-uuid", roles: ["tenant"] };
  });

  describe("Application Eligibility & Creation", () => {
    it("fails draft creation if listing is not published", async () => {
      mockQueryResults = [
        // 1. Fetch listing and property (draft status, ineligible)
        {
          data: {
            id: "listing-uuid",
            price: 45000,
            currency: "KES",
            status: "DRAFT", // not published
            properties: {
              id: "property-uuid",
              owner_user_id: "landlord-uuid",
            },
          },
          error: null,
        },
      ];

      await expect(
        createApplicationDraft({
          listingId: "listing-uuid",
        }),
      ).rejects.toThrow(/listing is currently not active/);
    });
  });

  describe("State Machine Transition Rules & Landlord Decision Actions", () => {
    it("successfully approves a shortlisted application", async () => {
      mockCurrentUser = { userId: "landlord-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch application detail
        {
          data: {
            id: "app-uuid",
            status: "SHORTLISTED", // valid state to transition to APPROVED
            provider_id: "landlord-uuid",
            applicant_id: "applicant-uuid",
            application_number: "HH-APP-001",
            listing_id: "listing-uuid",
          },
          error: null,
        },
        // 2. Update status to APPROVED
        { data: null, error: null },
        // 3. Insert status history
        { data: null, error: null },
        // 4. Fetch conversation context (none found/new created)
        { data: { id: "conv-uuid" }, error: null },
        // 5. Insert conversation message
        { data: null, error: null },
        // 6. Record audit log
        { data: null, error: null },
      ];

      const result = await providerRecordDecision({
        applicationId: "app-uuid",
        action: "APPROVE",
      });

      expect(result.success).toBe(true);
    });

    it("prevents transition from DRAFT straight to APPROVED (State Machine Validation)", async () => {
      mockCurrentUser = { userId: "landlord-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch application detail in DRAFT status
        {
          data: {
            id: "app-uuid",
            status: "DRAFT",
            provider_id: "landlord-uuid",
            applicant_id: "applicant-uuid",
            application_number: "HH-APP-001",
          },
          error: null,
        },
      ];

      await expect(
        providerRecordDecision({
          applicationId: "app-uuid",
          action: "APPROVE",
        }),
      ).rejects.toThrow(/Invalid application status transition/);
    });
  });

  describe("Authorization & IDOR Protection Tests", () => {
    it("prevents provider A from reviewing/decisioning provider B's application (IDOR)", async () => {
      mockCurrentUser = { userId: "landlord-A-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // 1. Fetch application owned by landlord-B
        {
          data: {
            id: "app-uuid",
            status: "UNDER_REVIEW",
            provider_id: "landlord-B-uuid", // does not match currentUser landlord-A
            applicant_id: "applicant-uuid",
          },
          error: null,
        },
      ];

      await expect(
        providerRecordDecision({
          applicationId: "app-uuid",
          action: "APPROVE",
        }),
      ).rejects.toThrow(/Access Denied: You are not authorized/);
    });

    it("prevents Seeker A from downloading Seeker B's private documents (Document IDOR)", async () => {
      mockCurrentUser = { userId: "seeker-A-uuid", roles: ["tenant"] };
      mockQueryResults = [
        // 1. Fetch document record (associated with seeker-B's application)
        {
          data: {
            id: "doc-uuid",
            file_path: "seeker-B-uuid/file.png",
            rental_applications: {
              applicant_id: "seeker-B-uuid", // does not match seeker-A
              provider_id: "landlord-uuid",
            },
          },
          error: null,
        },
      ];

      await expect(getSecureApplicationDocUrl("seeker-B-uuid/file.png")).rejects.toThrow(
        /Access Denied/,
      );
    });

    it("prevents applicant from viewing landlord internal review notes (Privacy Leak Protection)", async () => {
      mockCurrentUser = { userId: "applicant-uuid", roles: ["tenant"] };
      mockQueryResults = [
        // 1. Fetch application details
        {
          data: {
            id: "app-uuid",
            applicant_id: "applicant-uuid",
            provider_id: "landlord-uuid",
          },
          error: null,
        },
        // 2. Fetch documents
        { data: [], error: null },
        // 3. Fetch requests
        { data: [], error: null },
        // 4. Fetch history
        { data: [], error: null },
        // Notice: reviews table is NOT queried for applicant, but lets assert result has no reviews
      ];

      const result = await getApplicationDetails("app-uuid");
      expect(result.reviews).toEqual([]); // Internal notes completely isolated
    });
  });

  describe("Information Request & Response Workflow", () => {
    it("completes the request additional info and respond sequence", async () => {
      // 1. Landlord requests additional info
      mockCurrentUser = { userId: "landlord-uuid", roles: ["landlord"] };
      mockQueryResults = [
        // Fetch application details to request info
        {
          data: {
            id: "app-uuid",
            status: "UNDER_REVIEW",
            provider_id: "landlord-uuid",
            applicant_id: "applicant-uuid",
            property_id: "property-uuid",
            listing_id: "listing-uuid",
          },
          error: null,
        },
        // Insert new application requirement
        { data: { id: "new-req-uuid" }, error: null },
        // Insert request
        { data: null, error: null },
        // Update application status to ADDITIONAL_INFORMATION_REQUIRED
        { data: null, error: null },
        // Status history insert
        { data: null, error: null },
        // Fetch conversation context
        { data: { id: "conv-uuid" }, error: null },
        // Insert warning message
        { data: null, error: null },
      ];

      const requestRes = await providerRequestInformation({
        applicationId: "app-uuid",
        requirementName: "Latest Bank Statement",
        message: "Please upload bank statements for the past 3 months.",
      });
      expect(requestRes.success).toBe(true);

      // 2. Applicant responds to information request
      mockCurrentUser = { userId: "applicant-uuid", roles: ["tenant"] };
      mockQueryResults = [
        // Fetch request details
        {
          data: {
            id: "request-uuid",
            application_id: "app-uuid",
            recipient_id: "applicant-uuid",
            requirement_id: "req-uuid",
            rental_applications: {
              status: "ADDITIONAL_INFORMATION_REQUIRED",
              provider_id: "landlord-uuid",
              property_id: "property-uuid",
              listing_id: "listing-uuid",
            },
          },
          error: null,
        },
        // Insert documents
        { data: null, error: null },
        // Update request status to RESPONDED
        { data: null, error: null },
        // Update application status to RESUBMITTED
        { data: null, error: null },
        // Status history insert
        { data: null, error: null },
      ];

      const responseRes = await respondToInformationRequest({
        requestId: "request-uuid",
        message: "Here are my bank statements.",
        documents: [
          {
            requirementId: "req-uuid",
            name: "Bank Statement.pdf",
            filePath: "applicant-uuid/bank.pdf",
            fileSize: 102456,
            mimeType: "application/pdf",
          },
        ],
      });
      expect(responseRes.success).toBe(true);
    });
  });
});
