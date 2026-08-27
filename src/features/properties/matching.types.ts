import { z } from "zod";

export const PRIORITY_LEVELS = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;
export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

export const AMENITY_PRIORITY_LEVELS = ["MUST_HAVE", "PREFERRED", "OPTIONAL"] as const;
export type AmenityPriorityLevel = (typeof AMENITY_PRIORITY_LEVELS)[number];

export const LocationPreferenceSchema = z.object({
  county: z.string().min(1, "County is required"),
  town: z.string().optional(),
  neighborhood: z.string().optional(),
  estate: z.string().optional(),
  priority: z.enum(PRIORITY_LEVELS).default("HIGH"),
});

export const AmenityPreferenceSchema = z.object({
  amenity: z.string().min(1, "Amenity name is required"),
  priority: z.enum(AMENITY_PRIORITY_LEVELS).default("PREFERRED"),
});

export const PriorityWeightsSchema = z.object({
  budget: z.enum(PRIORITY_LEVELS).default("CRITICAL"),
  location: z.enum(PRIORITY_LEVELS).default("CRITICAL"),
  bedrooms: z.enum(PRIORITY_LEVELS).default("HIGH"),
  bathrooms: z.enum(PRIORITY_LEVELS).default("MEDIUM"),
  amenities: z.enum(PRIORITY_LEVELS).default("MEDIUM"),
  propertyType: z.enum(PRIORITY_LEVELS).default("HIGH"),
});

export const UserPreferencesInputSchema = z.object({
  minBudget: z.coerce.number().nonnegative().optional(),
  maxBudget: z.coerce.number().nonnegative().optional(),
  preferredBudget: z.coerce.number().nonnegative().optional(),
  propertyTypes: z.array(z.string()).default([]),
  bedrooms: z.coerce.number().int().nonnegative().optional(),
  bedroomsRule: z.enum(["MIN", "MAX", "EXACT"]).default("MIN"),
  bathrooms: z.coerce.number().nonnegative().optional(),
  bathroomsRule: z.enum(["MIN", "MAX", "EXACT"]).default("MIN"),
  moveInDate: z.string().optional(),
  preferredLocations: z.array(LocationPreferenceSchema).default([]),
  amenities: z.array(AmenityPreferenceSchema).default([]),
  furnishingPreference: z.enum(["FURNISHED", "SEMI-FURNISHED", "UNFURNISHED", "ANY"]).default("ANY"),
  priorityWeights: PriorityWeightsSchema.default({}),
  useBehavioralPersonalization: z.boolean().default(true),
});

export const RecommendationFeedbackSchema = z.object({
  listingId: z.string().uuid(),
  feedbackType: z.enum(["LIKE", "SAVE", "DISLIKE", "HIDE", "NOT_RELEVANT"]),
});

export const SaveSearchSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  criteria: z.record(z.any()),
});

// Scoring Configuration
export const DEFAULT_PRIORITY_SCORES: Record<PriorityLevel, number> = {
  CRITICAL: 40,
  HIGH: 25,
  MEDIUM: 15,
  LOW: 10,
};

export const MATCH_CATEGORIES = ["BEST_MATCH", "STRONG_MATCH", "GOOD_MATCH", "CLOSE_MATCH"] as const;
export type MatchCategory = (typeof MATCH_CATEGORIES)[number];

export interface MatchReason {
  code: string;
  isPositive: boolean;
  message: string;
}

export interface MatchResultDto {
  listing: any;
  score: number;
  category: MatchCategory;
  reasons: MatchReason[];
  matchedPreferences: {
    budgetFit: boolean;
    locationFit: boolean;
    bedroomsFit: boolean;
    bathroomsFit: boolean;
    amenitiesFit: boolean;
    furnishingFit: boolean;
  };
  freshness: string;
  trust: {
    propertyVerified: boolean;
    contactVerified: boolean;
    listingVerified: boolean;
  };
}
