/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Dynamic Query Builder Helper
const createQueryBuilder = (resolvedValue: any) => {
  const builder: any = {
    select: vi.fn().mockImplementation(() => builder),
    insert: vi.fn().mockImplementation(() => builder),
    update: vi.fn().mockImplementation(() => builder),
    delete: vi.fn().mockImplementation(() => builder),
    upsert: vi.fn().mockImplementation(() => builder),
    eq: vi.fn().mockImplementation(() => builder),
    ne: vi.fn().mockImplementation(() => builder),
    or: vi.fn().mockImplementation(() => builder),
    order: vi.fn().mockImplementation(() => builder),
    limit: vi.fn().mockImplementation(() => builder),
    lt: vi.fn().mockImplementation(() => builder),
    gt: vi.fn().mockImplementation(() => builder),
    in: vi.fn().mockImplementation(() => builder),
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
            data: { user: { email: "seeker@homehunt.co" } },
            error: null,
          }),
        },
      },
    },
  };
});

// Mock @tanstack/react-start server functions wrapper
vi.mock("@tanstack/react-start", () => {
  const chain = {
    middleware: vi.fn().mockImplementation(() => chain),
    validator: vi.fn().mockImplementation(() => chain),
    handler: vi.fn().mockImplementation((handlerFn) => {
      const fn = vi.fn().mockImplementation(async (args: any) => {
        const context = { userId: "seeker-user-uuid", claims: { roles: ["tenant"] } };
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
        "x-user-id": "seeker-user-uuid",
      }),
    }),
  };
});

import { createConversation, sendMessage } from "../communication.functions";
import { requestViewing } from "../viewing.functions";

describe("Phase 6 Communication & Viewings Server Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResults = [];
  });

  describe("createConversation", () => {
    it("successfully creates a new conversation thread and initial message", async () => {
      mockQueryResults = [
        // 1. Fetch listing and property
        {
          data: {
            id: "listing-uuid",
            title: "Stunning 2 Bed Apartment",
            properties: {
              id: "property-uuid",
              owner_user_id: "landlord-user-uuid",
              status: "ACTIVE",
            },
          },
          error: null,
        },
        // 2. Block check (none found)
        { data: null, error: null },
        // 3. Provider status check
        { data: { status: "ACTIVE" }, error: null },
        // 4. Check for existing thread (none found)
        { data: null, error: null },
        // 5. Conversation insert
        {
          data: {
            id: "conversation-uuid",
            seeker_id: "seeker-user-uuid",
            provider_id: "landlord-user-uuid",
          },
          error: null,
        },
        // 6. Message insert
        { data: { id: "msg-uuid" }, error: null },
      ];

      const result = await createConversation({
        listingId: "12345678-1234-1234-1234-123456789012",
        initialMessage: "Is this listing still available?",
      });

      expect(result.success).toBe(true);
      expect(result.conversationId).toBe("conversation-uuid");
    });

    it("prevents self-contact", async () => {
      mockQueryResults = [
        // 1. Fetch listing and property (owner is same as caller)
        {
          data: {
            id: "listing-uuid",
            properties: {
              id: "property-uuid",
              owner_user_id: "seeker-user-uuid",
              status: "ACTIVE",
            },
          },
          error: null,
        },
      ];

      await expect(
        createConversation({
          listingId: "12345678-1234-1234-1234-123456789012",
          initialMessage: "Hello self",
        }),
      ).rejects.toThrow(/cannot start a conversation with yourself/);
    });
  });

  describe("sendMessage", () => {
    it("blocks sending message if recipient has blocked sender", async () => {
      mockQueryResults = [
        // 1. Fetch conversation
        {
          data: {
            id: "conversation-uuid",
            seeker_id: "seeker-user-uuid",
            provider_id: "landlord-user-uuid",
            status: "ACTIVE",
          },
          error: null,
        },
        // 2. Block check (block exists)
        { data: { id: "block-uuid" }, error: null },
      ];

      await expect(
        sendMessage({
          conversationId: "12345678-1234-1234-1234-123456789012",
          content: "Hello there!",
          messageType: "TEXT",
        }),
      ).rejects.toThrow(/Unable to communicate/);
    });
  });

  describe("requestViewing", () => {
    it("submits viewing request and triggers system notification message", async () => {
      mockQueryResults = [
        // 1. Fetch listing
        {
          data: {
            id: "listing-uuid",
            title: "Sunny Studio",
            properties: {
              id: "property-uuid",
              owner_user_id: "landlord-user-uuid",
              status: "ACTIVE",
            },
          },
          error: null,
        },
        // 2. Provider availability slots (none defines means open schedule)
        { data: [], error: null },
        // 3. Conflict check (no conflicts)
        { data: [], error: null },
        // 4. Conversation fetch
        { data: { id: "conversation-uuid" }, error: null },
        // 5. Viewing insert
        { data: { id: "viewing-uuid" }, error: null },
        // 6. Message insert
        { data: { id: "message-uuid" }, error: null },
        // 7. Conversation update (touch)
        { data: null, error: null },
      ];

      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

      const result = await requestViewing({
        listingId: "12345678-1234-1234-1234-123456789012",
        requestedStart: futureDate,
        notes: "I'd like to inspect details.",
      });

      expect(result.success).toBe(true);
      expect(result.viewingId).toBe("viewing-uuid");
    });
  });
});
