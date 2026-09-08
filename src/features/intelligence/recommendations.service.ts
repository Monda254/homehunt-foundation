/* eslint-disable @typescript-eslint/no-explicit-any */
import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";
import { getOrCalculateListingHealth } from "./health.service";

const supabaseAdmin = rawSupabaseAdmin as any;

export type RecommendationReasonType =
  | "BUDGET_MATCH"
  | "LOCATION_MATCH"
  | "PROPERTY_TYPE_MATCH"
  | "AMENITY_MATCH"
  | "VERIFIED_LANDLORD"
  | "FRESH_LISTING"
  | "SIMILAR_TO_SAVED"
  | "HIGH_HEALTH_SCORE";

export interface RecommendationReason {
  type: RecommendationReasonType;
  label: string;
  icon?: string;
}

export interface RecommendationItem {
  listingId: string;
  title: string;
  rentAmount: number;
  currency: string;
  town?: string;
  county?: string;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  media: string[];
  verificationStatus: string;
  matchScore: number; // 0-100
  reasons: RecommendationReason[];
  healthScore: number;
  freshnessStatus: string;
}

export type FeedbackType =
  | "NOT_INTERESTED"
  | "TOO_EXPENSIVE"
  | "WRONG_LOCATION"
  | "WRONG_PROPERTY_TYPE"
  | "ALREADY_RENTED"
  | "NOT_TRUSTED"
  | "SHOW_MORE_LIKE_THIS";

export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 6,
): Promise<RecommendationItem[]> {
  try {
    // 1. Fetch user negative feedback to filter out dismissed listings
    const { data: feedbackData } = await supabaseAdmin
      .from("recommendation_feedback")
      .select("listing_id")
      .eq("user_id", userId)
      .eq("feedback_type", "NOT_INTERESTED");

    const excludedListingIds = new Set((feedbackData || []).map((f: any) => f.listing_id));

    // 2. Fetch user's saved listings to extract preference signals
    const { data: savedListings } = await supabaseAdmin
      .from("saved_listings")
      .select("listing_id, listings(rent_amount, property_type, town, bedrooms)")
      .eq("user_id", userId);

    let maxBudget = 50000;
    let preferredTown: string | null = null;
    let preferredBedrooms: number | null = null;
    const savedPropertyTypes = new Set<string>();

    if (savedListings && savedListings.length > 0) {
      const rents: number[] = [];
      for (const s of savedListings) {
        if (s.listings) {
          if (s.listings.rent_amount) rents.push(s.listings.rent_amount);
          if (s.listings.town) preferredTown = String(s.listings.town);
          if (s.listings.bedrooms) preferredBedrooms = s.listings.bedrooms;
          if (s.listings.property_type) savedPropertyTypes.add(s.listings.property_type);
        }
      }
      if (rents.length > 0) {
        maxBudget = Math.max(...rents) * 1.15; // 15% ceiling flexibility
      }
    }

    // 3. Fetch active listings
    const { data: activeListings, error } = await supabaseAdmin
      .from("listings")
      .select("*, properties(*)")
      .eq("status", "AVAILABLE")
      .limit(30);

    if (error || !activeListings) {
      console.error("[RecommendationsService] Error fetching listings:", error);
      return [];
    }

    const items: RecommendationItem[] = [];

    for (const listing of activeListings) {
      if (excludedListingIds.has(listing.id)) continue;

      const prop = listing.properties || {};
      const rent = listing.rent_amount || prop.rent_amount || 0;
      const town = listing.town || prop.town || "Nairobi";
      const propType = listing.property_type || prop.property_type || "Apartment";
      const bedrooms = listing.bedrooms || prop.bedrooms || 1;
      const bathrooms = listing.bathrooms || prop.bathrooms || 1;
      const media = Array.isArray(listing.media) ? listing.media : [];
      const vStatus = listing.verification_status || prop.verification_status || "UNVERIFIED";

      // Calculate compatibility score & explainable reasons
      let matchScore = 50; // base score
      const reasons: RecommendationReason[] = [];

      // Budget Match
      if (rent <= maxBudget) {
        matchScore += 20;
        reasons.push({
          type: "BUDGET_MATCH",
          label: `✓ Fits within target budget (KSh ${rent.toLocaleString()}/mo)`,
        });
      }

      // Location Match
      if (preferredTown && town.toLowerCase() === preferredTown.toLowerCase()) {
        matchScore += 15;
        reasons.push({
          type: "LOCATION_MATCH",
          label: `✓ Located in your preferred area (${town})`,
        });
      } else {
        reasons.push({
          type: "LOCATION_MATCH",
          label: `✓ Convenient location in ${town}`,
        });
      }

      // Verified Landlord / Property
      if (vStatus === "VERIFIED") {
        matchScore += 15;
        reasons.push({
          type: "VERIFIED_LANDLORD",
          label: "✓ Verified landlord & property inspection",
        });
      }

      // Property Type / Saved match
      if (savedPropertyTypes.has(propType)) {
        matchScore += 10;
        reasons.push({
          type: "SIMILAR_TO_SAVED",
          label: `✓ Similar to ${propType} properties you saved`,
        });
      } else {
        reasons.push({
          type: "PROPERTY_TYPE_MATCH",
          label: `✓ ${bedrooms} Bed ${propType}`,
        });
      }

      // Health Score Calculation
      const healthObj = await getOrCalculateListingHealth(listing.id);
      const healthScore = healthObj?.healthScore ?? 80;
      const freshnessStatus = healthObj?.freshnessStatus ?? "FRESH";

      if (healthScore >= 80) {
        matchScore += 10;
        reasons.push({
          type: "HIGH_HEALTH_SCORE",
          label: `✓ High listing quality score (${healthScore}/100)`,
        });
      }

      if (freshnessStatus === "FRESH") {
        reasons.push({
          type: "FRESH_LISTING",
          label: "✓ Recently reconfirmed available",
        });
      }

      items.push({
        listingId: listing.id,
        title: listing.title || `${bedrooms} Bedroom ${propType} in ${town}`,
        rentAmount: rent,
        currency: listing.currency || "KES",
        town,
        county: listing.county || prop.county,
        propertyType: propType,
        bedrooms,
        bathrooms,
        media,
        verificationStatus: vStatus,
        matchScore: Math.min(100, matchScore),
        reasons,
        healthScore,
        freshnessStatus,
      });
    }

    // Sort by match score descending
    items.sort((a, b) => b.matchScore - a.matchScore);

    return items.slice(0, limit);
  } catch (err) {
    console.error("[RecommendationsService] Unexpected error:", err);
    return [];
  }
}

export async function recordRecommendationFeedback(
  userId: string,
  listingId: string,
  feedbackType: FeedbackType,
  notes?: string,
): Promise<{ success: boolean }> {
  try {
    const { error } = await supabaseAdmin.from("recommendation_feedback").upsert({
      user_id: userId,
      listing_id: listingId,
      feedback_type: feedbackType,
      notes: notes || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[RecommendationsService] Error recording feedback:", error.message);
      return { success: false };
    }

    return { success: true };
  } catch (err) {
    console.error("[RecommendationsService] Exception recording feedback:", err);
    return { success: false };
  }
}
