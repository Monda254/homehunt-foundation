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

import { getRentIntelligence, getSpatialDemandHeatmap } from "../market-insights.service";
import {
  scanForDuplicateListings,
  getOpenDuplicateCandidates,
  updateDuplicateCandidateStatus,
} from "../duplicate-detection.service";
import { getPropertyTrustTimeline } from "../trust-graph.service";
import { getUserPrivacyPreferences, updateUserPrivacyPreferences } from "../privacy.service";

describe("Phase 11 — Intelligence Layer Master Enhancements", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryResults = [];
  });

  describe("Market Rent & Spatial Intelligence Engine", () => {
    it("calculates median, average, and price bounds for location listings", async () => {
      mockQueryResults = [
        {
          data: [
            {
              rent_amount: 25000,
              town: "Kilimani",
              county: "Nairobi",
              bedrooms: 2,
              property_type: "Apartment",
            },
            {
              rent_amount: 35000,
              town: "Kilimani",
              county: "Nairobi",
              bedrooms: 2,
              property_type: "Apartment",
            },
            {
              rent_amount: 45000,
              town: "Kilimani",
              county: "Nairobi",
              bedrooms: 2,
              property_type: "Apartment",
            },
          ],
          error: null,
        },
      ];

      const insight = await getRentIntelligence("Nairobi", "Kilimani", 2);

      expect(insight.sampleSize).toBe(3);
      expect(insight.medianRent).toBe(35000);
      expect(insight.averageRent).toBe(35000);
      expect(insight.minRent).toBe(25000);
      expect(insight.maxRent).toBe(45000);
    });

    it("returns PostGIS spatial demand clusters with active view counts", async () => {
      mockQueryResults = [
        {
          data: [
            {
              id: "prop-1",
              town: "Kilimani",
              county: "Nairobi",
              latitude: -1.286,
              longitude: 36.817,
            },
          ],
          error: null,
        },
      ];

      const clusters = await getSpatialDemandHeatmap();
      expect(clusters.length).toBeGreaterThan(0);
      expect(clusters[0].town).toBe("Kilimani");
      expect(clusters[0].activeViews).toBeGreaterThan(0);
    });
  });

  describe("Candidate Duplicate Detection Engine", () => {
    it("flags duplicate candidate pair when rent and title match", async () => {
      mockQueryResults = [
        // 1. Target listing query
        {
          data: {
            id: "listing-1",
            title: "Luxury 2 Bedroom Apartment",
            rent_amount: 40000,
            town: "Nairobi",
            bedrooms: 2,
          },
          error: null,
        },
        // 2. Comparison listings query
        {
          data: [
            {
              id: "listing-2",
              title: "Luxury 2 Bedroom Apartment",
              rent_amount: 40000,
              town: "Nairobi",
              bedrooms: 2,
            },
          ],
          error: null,
        },
        // 3. Upsert duplicate candidate query
        { data: { id: "dup-pair-1", created_at: new Date().toISOString() }, error: null },
      ];

      const candidates = await scanForDuplicateListings("listing-1");

      expect(candidates.length).toBe(1);
      expect(candidates[0].similarityScore).toBeGreaterThanOrEqual(70);
      expect(candidates[0].reason).toContain("Identical rent amount");
    });

    it("updates candidate status upon admin confirmation or dismissal", async () => {
      mockQueryResults = [{ error: null }];
      const success = await updateDuplicateCandidateStatus("dup-pair-1", "CONFIRMED");
      expect(success).toBe(true);
    });
  });

  describe("Property Trust Timeline Audit Engine", () => {
    it("assembles chronological milestone events from property and listing lifecycle", async () => {
      const nowIso = new Date().toISOString();
      mockQueryResults = [
        // 1. Fetch property details
        {
          data: {
            id: "prop-100",
            address: "Argwings Kodhek",
            town: "Nairobi",
            created_at: nowIso,
            verification_status: "VERIFIED",
          },
          error: null,
        },
        // 2. Fetch listings for property
        {
          data: [
            { id: "list-100", title: "Spacious 2 Bed", status: "AVAILABLE", created_at: nowIso },
          ],
          error: null,
        },
      ];

      const timeline = await getPropertyTrustTimeline("prop-100");

      expect(timeline.length).toBeGreaterThanOrEqual(2);
      expect(timeline.some((e) => e.stage === "PROPERTY_CREATED")).toBe(true);
      expect(timeline.some((e) => e.stage === "VERIFIED")).toBe(true);
      expect(timeline.some((e) => e.stage === "LISTING_PUBLISHED")).toBe(true);
    });
  });

  describe("User Privacy & Opt-Out Preferences Engine", () => {
    it("fetches default privacy options and supports user consent toggles", async () => {
      mockQueryResults = [{ data: null, error: null }];

      const defaultPrefs = await getUserPrivacyPreferences("user-123");
      expect(defaultPrefs.enablePersonalization).toBe(true);
      expect(defaultPrefs.enableAiAssistance).toBe(true);

      mockQueryResults = [{ data: null, error: null }];

      const updated = await updateUserPrivacyPreferences("user-123", {
        enablePersonalization: false,
        enableAiAssistance: true,
      });

      expect(updated).toBe(true);
    });
  });
});
