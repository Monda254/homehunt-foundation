import { describe, it, expect, vi } from "vitest";
import { ListingSearchService } from "../search.service";
import { SearchListingsSchema } from "../search.types";

// Mock the search repository
vi.mock("../search.repository", () => {
  return {
    ListingSearchRepository: vi.fn().mockImplementation(() => {
      return {
        search: vi.fn().mockResolvedValue({
          items: [
            {
              listing_id: "listing-1",
              listing_title: "Beautiful 2 Bedroom Kilimani",
              listing_description: "A gorgeous modern apartment",
              listing_type: "FOR_RENT",
              listing_status: "PUBLISHED",
              price: 45000,
              currency: "KES",
              billing_period: "MONTHLY",
              availability_date: "2026-09-01",
              latitude: -1.2921,
              longitude: 36.8219,
              property_id: "prop-1",
              property_type: "APARTMENT",
              property_name: "Azura Residences",
              county: "Nairobi",
              town: "Nairobi",
              neighborhood: "Kilimani",
              bedrooms: 2,
              bathrooms: 2,
              property_amenities: ["PARKING", "SECURITY"],
              primary_image_url: "https://example.com/image.jpg",
            },
          ],
          count: 1,
        }),
        getLocations: vi
          .fn()
          .mockResolvedValue([{ county: "Nairobi", town: "Nairobi", neighborhood: "Kilimani" }]),
        getReferenceData: vi.fn().mockResolvedValue({
          counties: ["Nairobi", "Nyeri"],
          towns: ["Nairobi", "Nyeri Town"],
          amenities: ["PARKING", "SECURITY"],
        }),
      };
    }),
  };
});

describe("Search Engine DTO Validation", () => {
  it("should successfully parse and validate valid search criteria inputs", () => {
    const validCriteria = {
      q: "Kilimani",
      county: "Nairobi",
      minPrice: 30000,
      maxPrice: 60000,
      propertyType: "APARTMENT",
      bedrooms: 2,
      amenities: ["PARKING"],
      sort: "PRICE_ASC",
      page: 1,
      limit: 20,
    };

    const parsed = SearchListingsSchema.parse(validCriteria);
    expect(parsed.q).toBe("Kilimani");
    expect(parsed.minPrice).toBe(30000);
    expect(parsed.bedrooms).toBe(2);
    expect(parsed.sort).toBe("PRICE_ASC");
  });

  it("should throw validation error for invalid enum parameters", () => {
    const invalidCriteria = {
      propertyType: "SKYSCRAPER", // Invalid property type enum
    };

    expect(() => SearchListingsSchema.parse(invalidCriteria)).toThrow();
  });

  it("should enforce page and limit defaults correctly", () => {
    const emptyCriteria = {};
    const parsed = SearchListingsSchema.parse(emptyCriteria);
    expect(parsed.page).toBe(1);
    expect(parsed.limit).toBe(20);
    expect(parsed.sort).toBe("RECOMMENDED");
  });
});

describe("ListingSearchService & Coordinates Fuzzing", () => {
  const service = new ListingSearchService();

  it("should format coordinates using stable pseudo-random fuzzing to protect listing location privacy", async () => {
    const res = await service.search({ q: "Kilimani" });

    expect(res.items).toHaveLength(1);
    const listing = res.items[0];

    // Check fuzzed coordinate presence
    expect(listing.displayLatitude).toBeDefined();
    expect(listing.displayLongitude).toBeDefined();

    // Verify offset makes them different from real coordinates
    expect(listing.displayLatitude).not.toBe(listing.latitude);
    expect(listing.displayLongitude).not.toBe(listing.longitude);

    // Verify display coords are stable (calling search again yields the same display coords)
    const secondRes = await service.search({ q: "Kilimani" });
    const secondListing = secondRes.items[0];
    expect(secondListing.displayLatitude).toBe(listing.displayLatitude);
    expect(secondListing.displayLongitude).toBe(listing.displayLongitude);

    // Verify coordinate offset is within ~0.003 degrees bounds
    const latDiff = Math.abs(listing.displayLatitude! - listing.latitude!);
    const lngDiff = Math.abs(listing.displayLongitude! - listing.longitude!);
    expect(latDiff).toBeLessThanOrEqual(0.003);
    expect(lngDiff).toBeLessThanOrEqual(0.003);
  });

  it("should map suggestion labels correctly from search suggestions results", async () => {
    const suggestions = await service.getSuggestions("Kili");
    expect(suggestions).toContain("Kilimani, Nairobi");
    expect(suggestions).toContain("Nairobi, Nairobi");
    expect(suggestions).toContain("Nairobi County");
  });
});
