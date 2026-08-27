/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @tanstack/react-start server function wrapper to execute handlers directly
vi.mock("@tanstack/react-start", () => {
  const chain = {
    middleware: vi.fn().mockImplementation(() => chain),
    validator: vi.fn().mockImplementation(() => chain),
    handler: vi.fn().mockImplementation((handlerFn) => {
      const fn = vi.fn().mockImplementation(async (args: any) => {
        const context = { userId: "test-user-id" };
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
  saveUserPreferences,
  getUserPreferences,
  getRecommendations,
  submitRecommendationFeedback,
} from "../matching.functions";

// Mock Supabase Admin Client
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();
const mockSelect = vi.fn(() => ({
  eq: vi.fn(() => ({
    eq: vi.fn(() => ({
      maybeSingle: mockMaybeSingle,
      single: mockSingle,
    })),
    maybeSingle: mockMaybeSingle,
    single: mockSingle,
  })),
  not: vi.fn(() => ({
    in: vi.fn(() => ({
      gte: vi.fn(() => ({
        lte: vi.fn(() => ({
          limit: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  })),
  in: vi.fn(() => ({
    gte: vi.fn(() => ({
      lte: vi.fn(() => ({
        limit: vi.fn(() => ({
          data: [],
          error: null,
        })),
      })),
    })),
  })),
  maybeSingle: mockMaybeSingle,
  single: mockSingle,
}));

const mockInsert = vi.fn(() => ({
  select: vi.fn(() => ({
    single: mockSingle,
  })),
  error: null,
}));

const mockUpsert = vi.fn(() => ({
  error: null,
}));

vi.mock("@/integrations/supabase/client.server", () => {
  return {
    supabaseAdmin: {
      from: vi.fn((table) => {
        return {
          select: mockSelect,
          insert: mockInsert,
          upsert: mockUpsert,
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

describe("Phase 5 Intelligent Matching Server Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("saveUserPreferences", () => {
    it("successfully saves user preferences", async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });

      const result = await saveUserPreferences({
        preferredBudget: 25000,
        maxBudget: 35000,
        propertyTypes: ["APARTMENT"],
        bedrooms: 2,
        bedroomsRule: "MIN",
        bathrooms: 1,
        bathroomsRule: "MIN",
        preferredLocations: [{ county: "Nyeri", town: "Nyeri Town", priority: "HIGH" }],
        amenities: [{ amenity: "PARKING", priority: "PREFERRED" }],
        priorityWeights: {
          budget: "CRITICAL",
          location: "CRITICAL",
          bedrooms: "HIGH",
          bathrooms: "MEDIUM",
          amenities: "MEDIUM",
          propertyType: "HIGH",
        },
        furnishingPreference: "ANY",
        useBehavioralPersonalization: true,
      });

      expect(result.success).toBe(true);
    });
  });

  describe("getUserPreferences", () => {
    it("returns default values when no record exists", async () => {
      mockMaybeSingle.mockResolvedValueOnce({ data: null, error: null });

      const result = await getUserPreferences();
      expect(result.propertyTypes).toEqual([]);
      expect(result.furnishingPreference).toBe("ANY");
      expect(result.useBehavioralPersonalization).toBe(true);
    });
  });

  describe("submitRecommendationFeedback", () => {
    it("successfully creates feedback entry", async () => {
      mockUpsert.mockResolvedValueOnce({ error: null });

      const result = await submitRecommendationFeedback({
        listingId: "12345678-1234-1234-1234-123456789012",
        feedbackType: "SAVE",
      });

      expect(result.success).toBe(true);
    });
  });
});
