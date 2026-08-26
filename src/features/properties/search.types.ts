import { z } from "zod";

export const PropertyTypeEnum = z.enum([
  "APARTMENT",
  "HOUSE",
  "BEDSITTER",
  "STUDIO",
  "MAISONETTE",
  "TOWNHOUSE",
  "VILLA",
  "BUNGALOW",
  "ROOM",
  "SHARED_ACCOMMODATION",
  "OTHER",
]);

export const UnitTypeEnum = z.enum([
  "BEDSITTER",
  "STUDIO",
  "ONE_BEDROOM",
  "TWO_BEDROOM",
  "THREE_BEDROOM",
  "FOUR_PLUS_BEDROOM",
  "ROOM",
  "SHARED",
  "HOUSE",
  "OTHER",
]);

export const SearchListingsSchema = z.object({
  q: z.string().optional(),
  county: z.string().optional(),
  town: z.string().optional(),
  neighborhood: z.string().optional(),
  estate: z.string().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  propertyType: PropertyTypeEnum.optional(),
  unitType: UnitTypeEnum.optional(),
  bedrooms: z.coerce.number().nonnegative().optional(),
  bathrooms: z.coerce.number().nonnegative().optional(),
  amenities: z.array(z.string()).default([]),
  availabilityDate: z.string().optional(),
  bounds: z
    .object({
      north: z.coerce.number(),
      south: z.coerce.number(),
      east: z.coerce.number(),
      west: z.coerce.number(),
    })
    .optional(),
  sort: z
    .enum(["NEWEST", "PRICE_ASC", "PRICE_DESC", "AVAILABILITY", "RECOMMENDED"])
    .default("RECOMMENDED"),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(20),
});

export type SearchFilters = z.infer<typeof SearchListingsSchema>;

export interface ListingSearchResult {
  id: string;
  title: string;
  description: string | null;
  listingType: string;
  price: number;
  currency: string;
  billingPeriod: string;
  depositAmount: number | null;
  availabilityDate: string;
  publishedAt: string | null;
  propertyId: string;
  propertyType: string;
  propertyName: string;
  county: string;
  town: string;
  neighborhood: string | null;
  estate: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  displayLatitude: number | null;
  displayLongitude: number | null;
  landmarkDescription: string | null;
  unitId: string | null;
  unitType: string | null;
  floor: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area: number | null;
  propertyAmenities: string[];
  primaryImageUrl: string | null;
}

export interface SearchListingsResponse {
  items: ListingSearchResult[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}
