/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";
import { recordAuditEvent, auditMetadataFromRequest } from "@/core/audit/audit.server";
import { resolveRequestId } from "@/core/observability/request-id";
import { AppError, ERROR_CODES } from "@/core/errors/api-error";
import {
  UserPreferencesInputSchema,
  RecommendationFeedbackSchema,
  SaveSearchSchema,
  DEFAULT_PRIORITY_SCORES,
  type MatchCategory,
  type MatchReason,
  type MatchResultDto,
} from "./matching.types";

const supabaseAdmin = rawSupabaseAdmin as any;

// Helper: Resolve context details
function getContextMeta() {
  const request = getRequest();
  const requestId = resolveRequestId(request?.headers);
  const meta = auditMetadataFromRequest(request);
  return { requestId, meta };
}

// =============================================================
// PREFERENCES OPERATIONS
// =============================================================

const fnSaveUserPreferences = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(UserPreferencesInputSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const payload = {
      user_id: userId,
      min_budget: data.minBudget ?? null,
      max_budget: data.maxBudget ?? null,
      preferred_budget: data.preferredBudget ?? null,
      property_types: data.propertyTypes,
      bedrooms: data.bedrooms ?? null,
      bedrooms_rule: data.bedroomsRule,
      bathrooms: data.bathrooms ?? null,
      bathrooms_rule: data.bathroomsRule,
      move_in_date: data.moveInDate || null,
      preferred_locations: JSON.stringify(data.preferredLocations),
      amenities: JSON.stringify(data.amenities),
      furnishing_preference: data.furnishingPreference,
      priority_weights: JSON.stringify(data.priorityWeights),
      use_behavioral_personalization: data.useBehavioralPersonalization,
    };

    const { error } = await supabaseAdmin
      .from("user_preferences")
      .upsert(payload, { onConflict: "user_id" });

    if (error) {
      throw new AppError(
        ERROR_CODES.BAD_REQUEST,
        error.message || "Failed to save user housing preferences.",
      );
    }

    await recordAuditEvent({
      actorId: userId,
      action: "PREFERENCE_CHANGED",
      resourceType: "user_preferences",
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true };
  });

export const saveUserPreferences = (data: z.infer<typeof UserPreferencesInputSchema>) =>
  fnSaveUserPreferences({ data });

async function getUserPreferencesInternal(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve user preferences.");
  }

  if (!data) {
    return {
      propertyTypes: [],
      bedroomsRule: "MIN",
      bathroomsRule: "MIN",
      preferredLocations: [],
      amenities: [],
      furnishingPreference: "ANY",
      priorityWeights: {
        budget: "CRITICAL",
        location: "CRITICAL",
        bedrooms: "HIGH",
        bathrooms: "MEDIUM",
        amenities: "MEDIUM",
        propertyType: "HIGH",
      },
      useBehavioralPersonalization: true,
    };
  }

  const preferredLocations =
    typeof data.preferred_locations === "string"
      ? JSON.parse(data.preferred_locations)
      : data.preferred_locations || [];
  const amenities =
    typeof data.amenities === "string" ? JSON.parse(data.amenities) : data.amenities || [];
  const priorityWeights =
    typeof data.priority_weights === "string"
      ? JSON.parse(data.priority_weights)
      : data.priority_weights || {};

  return {
    minBudget: data.min_budget ? Number(data.min_budget) : undefined,
    maxBudget: data.max_budget ? Number(data.max_budget) : undefined,
    preferredBudget: data.preferred_budget ? Number(data.preferred_budget) : undefined,
    propertyTypes: data.property_types || [],
    bedrooms: data.bedrooms !== null ? Number(data.bedrooms) : undefined,
    bedroomsRule: data.bedrooms_rule || "MIN",
    bathrooms: data.bathrooms !== null ? Number(data.bathrooms) : undefined,
    bathroomsRule: data.bathrooms_rule || "MIN",
    moveInDate: data.move_in_date || undefined,
    preferredLocations,
    amenities,
    furnishingPreference: data.furnishing_preference || "ANY",
    priorityWeights,
    useBehavioralPersonalization: !!data.use_behavioral_personalization,
  };
}

const fnGetUserPreferences = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    return getUserPreferencesInternal(context.userId);
  });

export const getUserPreferences = () => fnGetUserPreferences();

// =============================================================
// SAVED SEARCH OPERATIONS
// =============================================================

const fnSaveSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(SaveSearchSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;
    const { requestId, meta } = getContextMeta();

    const { data: savedSearch, error } = await supabaseAdmin
      .from("saved_searches")
      .insert({
        user_id: userId,
        name: data.name,
        criteria: JSON.stringify(data.criteria),
      })
      .select()
      .single();

    if (error || !savedSearch) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error?.message || "Failed to save search query.");
    }

    await recordAuditEvent({
      actorId: userId,
      action: "SAVED_SEARCH_CREATED",
      resourceType: "saved_search",
      resourceId: savedSearch.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
      requestId,
    });

    return { success: true, savedSearchId: savedSearch.id };
  });

export const saveSearch = (data: z.infer<typeof SaveSearchSchema>) => fnSaveSearch({ data });

const fnListSavedSearches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data, error } = await supabaseAdmin
      .from("saved_searches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve saved searches.");
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      name: row.name,
      criteria: typeof row.criteria === "string" ? JSON.parse(row.criteria) : row.criteria,
      createdAt: row.created_at,
    }));
  });

export const listSavedSearches = () => fnListSavedSearches();

const fnDeleteSavedSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: searchId, context }) => {
    const { userId } = context;

    const { error } = await supabaseAdmin
      .from("saved_searches")
      .delete()
      .eq("id", searchId)
      .eq("user_id", userId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to delete saved search.");
    }

    return { success: true };
  });

export const deleteSavedSearch = (searchId: string) => fnDeleteSavedSearch({ data: searchId });

// =============================================================
// RECOMMENDATION FEEDBACK OPERATIONS
// =============================================================

const fnSubmitRecommendationFeedback = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(RecommendationFeedbackSchema)
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { error } = await supabaseAdmin.from("recommendation_feedback").upsert(
      {
        user_id: userId,
        listing_id: data.listingId,
        feedback_type: data.feedbackType,
      },
      { onConflict: "user_id, listing_id, feedback_type" },
    );

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to submit recommendation feedback.");
    }

    // If feedback is HIDE or DISLIKE, log to history too
    if (data.feedbackType === "HIDE" || data.feedbackType === "DISLIKE") {
      await supabaseAdmin.from("recommendation_history").insert({
        user_id: userId,
        listing_id: data.listingId,
        hidden_at: new Date().toISOString(),
      });
    }

    return { success: true };
  });

export const submitRecommendationFeedback = (data: z.infer<typeof RecommendationFeedbackSchema>) =>
  fnSubmitRecommendationFeedback({ data });

// =============================================================
// RECOMMENDATION ENGINE CORE
// =============================================================

const fnGetRecommendations = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    // 1. Fetch active preferences
    const prefs = await getUserPreferencesInternal(userId);

    // 2. Fetch feedback to filter out hidden items
    const { data: hiddenData } = await supabaseAdmin
      .from("recommendation_feedback")
      .select("listing_id")
      .eq("user_id", userId)
      .eq("feedback_type", "HIDE");
    const hiddenIds = (hiddenData || []).map((row: any) => row.listing_id);

    // 3. Build candidate generation query
    let query = supabaseAdmin
      .from("listings_search_view")
      .select("*")
      .eq("listing_status", "PUBLISHED");

    if (hiddenIds.length > 0) {
      query = query.not("listing_id", "in", `(${hiddenIds.join(",")})`);
    }

    // Apply basic pre-filtering (soft candidates logic)
    // Filter by property types if specified
    if (prefs.propertyTypes && prefs.propertyTypes.length > 0) {
      query = query.in("property_type", prefs.propertyTypes);
    }

    // Filter by bedrooms rule if specified
    if (prefs.bedrooms !== undefined) {
      if (prefs.bedroomsRule === "EXACT") {
        query = query.eq("bedrooms", prefs.bedrooms);
      } else if (prefs.bedroomsRule === "MIN") {
        query = query.gte("bedrooms", prefs.bedrooms);
      } else if (prefs.bedroomsRule === "MAX") {
        query = query.lte("bedrooms", prefs.bedrooms);
      }
    }

    // Initial budget filter: listings within 1.25x max budget (to support relaxation results/close matches)
    const upperLimit = prefs.maxBudget ? prefs.maxBudget * 1.25 : undefined;
    if (upperLimit !== undefined) {
      query = query.lte("price", upperLimit);
    }

    const { data: candidates, error } = await query.limit(100);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, "Failed to retrieve matching candidates.");
    }

    // If no candidates found, return empty array with Relaxation suggestions
    if (!candidates || candidates.length === 0) {
      return { items: [], total: 0 };
    }

    // 4. Compute Weighted Score & Category Segmentation
    const priorityWeights: Record<string, string> = prefs.priorityWeights || {};
    const getWeightPoints = (categoryKey: string): number => {
      const level = priorityWeights[categoryKey] || "MEDIUM";
      return DEFAULT_PRIORITY_SCORES[level as keyof typeof DEFAULT_PRIORITY_SCORES] || 15;
    };

    const budgetWeight = getWeightPoints("budget");
    const locationWeight = getWeightPoints("location");
    const bedroomsWeight = getWeightPoints("bedrooms");
    const bathroomsWeight = getWeightPoints("bathrooms");
    const amenitiesWeight = getWeightPoints("amenities");
    const propertyTypeWeight = getWeightPoints("propertyType");
    const totalWeights =
      budgetWeight +
      locationWeight +
      bedroomsWeight +
      bathroomsWeight +
      amenitiesWeight +
      propertyTypeWeight;

    const matchedItems: MatchResultDto[] = [];

    for (const item of candidates) {
      const reasons: MatchReason[] = [];
      let budgetFit = false;
      let locationFit = false;
      let bedroomsFit = false;
      let bathroomsFit = false;
      let amenitiesFit = false;
      let furnishingFit = false;

      // Dimension 1: Budget Scoring (0.0 to 1.0)
      let budgetScore = 0;
      const listingPrice = Number(item.price);
      if (prefs.preferredBudget !== undefined && prefs.maxBudget !== undefined) {
        if (listingPrice <= prefs.preferredBudget) {
          budgetScore = 1.0;
          budgetFit = true;
          reasons.push({
            code: "WITHIN_BUDGET",
            isPositive: true,
            message: "Fits within your target preferred budget.",
          });
        } else if (listingPrice <= prefs.maxBudget) {
          const range = prefs.maxBudget - prefs.preferredBudget;
          budgetScore = range > 0 ? 1.0 - (listingPrice - prefs.preferredBudget) / range : 1.0;
          budgetFit = true;
          reasons.push({
            code: "WITHIN_MAX_BUDGET",
            isPositive: true,
            message: "Fits within your maximum budget ceiling.",
          });
        } else {
          // Relaxed matching / Close Match
          budgetScore = 0.0;
          reasons.push({
            code: "EXCEEDS_BUDGET_SLIGHTLY",
            isPositive: false,
            message: `Exceeds your maximum budget limit by KES ${(listingPrice - prefs.maxBudget).toLocaleString()}.`,
          });
        }
      } else {
        budgetScore = 1.0;
        budgetFit = true;
      }

      // Dimension 2: Location Scoring (0.0 to 1.0)
      let locationScore = 0;
      if (prefs.preferredLocations && prefs.preferredLocations.length > 0) {
        let maxLocScore = 0;
        for (const loc of prefs.preferredLocations) {
          let score = 0;
          if (item.county?.toLowerCase() === loc.county?.toLowerCase()) {
            score = 0.2;
            if (loc.town && item.town?.toLowerCase() === loc.town?.toLowerCase()) {
              score = 0.6;
              if (
                loc.neighborhood &&
                item.neighborhood?.toLowerCase() === loc.neighborhood?.toLowerCase()
              ) {
                score = 0.9;
                if (loc.estate && item.estate?.toLowerCase() === loc.estate?.toLowerCase()) {
                  score = 1.0;
                }
              }
            }
          }
          if (score > maxLocScore) maxLocScore = score;
        }
        locationScore = maxLocScore;
        if (locationScore >= 0.6) {
          locationFit = true;
          reasons.push({
            code: "LOCATION_MATCH",
            isPositive: true,
            message: "Located in one of your preferred areas.",
          });
        } else if (locationScore > 0) {
          reasons.push({
            code: "LOCATION_NEAR",
            isPositive: true,
            message: "Close proximity to your preferred locations.",
          });
        } else {
          reasons.push({
            code: "LOCATION_MISMATCH",
            isPositive: false,
            message: "Outside your preferred geographic boundary.",
          });
        }
      } else {
        locationScore = 1.0;
        locationFit = true;
      }

      // Dimension 3: Bedroom Match (0.0 to 1.0)
      let bedroomScore = 0;
      if (prefs.bedrooms !== undefined) {
        const itemBeds = Number(item.bedrooms);
        if (itemBeds === prefs.bedrooms) {
          bedroomScore = 1.0;
          bedroomsFit = true;
          reasons.push({
            code: "BEDROOMS_EXACT",
            isPositive: true,
            message: "Matches your exact bedroom count requirement.",
          });
        } else if (prefs.bedroomsRule === "MIN" && itemBeds > prefs.bedrooms) {
          bedroomScore = 0.8; // higher room is okay but minor penalty
          bedroomsFit = true;
          reasons.push({
            code: "BEDROOMS_SUFFICIENT",
            isPositive: true,
            message: "Meets your minimum bedroom constraint.",
          });
        } else {
          bedroomScore = 0.0;
          reasons.push({
            code: "BEDROOMS_MISMATCH",
            isPositive: false,
            message: "Does not satisfy bedroom capacity.",
          });
        }
      } else {
        bedroomScore = 1.0;
        bedroomsFit = true;
      }

      // Dimension 4: Bathroom Match (0.0 to 1.0)
      let bathroomScore = 0;
      if (prefs.bathrooms !== undefined) {
        const itemBaths = Number(item.bathrooms);
        if (itemBaths >= prefs.bathrooms) {
          bathroomScore = 1.0;
          bathroomsFit = true;
        } else {
          bathroomScore = 0.0;
          reasons.push({
            code: "BATHROOMS_SHORTAGE",
            isPositive: false,
            message: "Has fewer bathrooms than requested.",
          });
        }
      } else {
        bathroomScore = 1.0;
        bathroomsFit = true;
      }

      // Dimension 5: Property Type Match (0.0 to 1.0)
      let typeScore = 0;
      if (prefs.propertyTypes && prefs.propertyTypes.length > 0) {
        if (prefs.propertyTypes.includes(item.property_type)) {
          typeScore = 1.0;
        } else {
          typeScore = 0.0;
        }
      } else {
        typeScore = 1.0;
      }

      // Dimension 6: Amenities Match (0.0 to 1.0)
      let amenityScore = 0;
      if (prefs.amenities && prefs.amenities.length > 0) {
        const itemAm = item.property_amenities || [];
        const requiredAms = prefs.amenities.filter((a: any) => a.priority === "MUST_HAVE");
        const preferredAms = prefs.amenities.filter((a: any) => a.priority !== "MUST_HAVE");

        let mustHaveSatisfied = true;
        for (const req of requiredAms) {
          if (!itemAm.includes(req.amenity)) {
            mustHaveSatisfied = false;
          }
        }

        const prefSatisfiedCount = preferredAms.filter((pref: any) =>
          itemAm.includes(pref.amenity),
        ).length;
        const totalPrefCount = preferredAms.length;

        if (mustHaveSatisfied) {
          amenityScore =
            totalPrefCount > 0 ? 0.7 + 0.3 * (prefSatisfiedCount / totalPrefCount) : 1.0;
          amenitiesFit = true;
          if (requiredAms.length > 0 || prefSatisfiedCount > 0) {
            reasons.push({
              code: "AMENITY_MATCH",
              isPositive: true,
              message: "Offers your required and preferred amenities.",
            });
          }
        } else {
          amenityScore = 0.0;
          reasons.push({
            code: "AMENITY_MISSING_REQUIRED",
            isPositive: false,
            message: "Lacks one or more MUST-HAVE amenities.",
          });
        }
      } else {
        amenityScore = 1.0;
        amenitiesFit = true;
      }

      // Dimension 7: Furnishing Preference
      if (prefs.furnishingPreference && prefs.furnishingPreference !== "ANY") {
        if (item.furnishing_status === prefs.furnishingPreference) {
          furnishingFit = true;
        }
      } else {
        furnishingFit = true;
      }

      // Calculate base score
      const weightedSum =
        budgetScore * budgetWeight +
        locationScore * locationWeight +
        bedroomScore * bedroomsWeight +
        bathroomScore * bathroomsWeight +
        typeScore * propertyTypeWeight +
        amenityScore * amenitiesWeight;

      const basePercent = (weightedSum / totalWeights) * 100;

      // Add Trust & Freshness Bonuses (up to 5 points)
      let bonus = 0;
      const isVerified =
        item.property_verification_status === "VERIFIED" ||
        item.listing_verification_status === "VERIFIED";

      if (isVerified) {
        bonus += 3;
      }
      if (item.listing_freshness_status === "CURRENT") {
        bonus += 2;
      }

      const finalScore = Math.min(100, Math.round(basePercent + bonus));

      // Determine match category
      let category: MatchCategory = "GOOD_MATCH";
      if (!budgetFit || !locationFit || !bedroomsFit || !amenitiesFit) {
        category = "CLOSE_MATCH";
      } else if (finalScore >= 90) {
        category = "BEST_MATCH";
      } else if (finalScore >= 75) {
        category = "STRONG_MATCH";
      }

      // Append verification indicators
      if (isVerified) {
        reasons.push({
          code: "VERIFIED_TRUST",
          isPositive: true,
          message: "Listing is verified by HomeHunt inspectors.",
        });
      }

      // Record recommendation exposure
      await supabaseAdmin.from("recommendation_history").insert({
        user_id: userId,
        listing_id: item.listing_id,
      });

      // Map DB object back to camelCase result schema
      const mappedListing = {
        id: item.listing_id,
        title: item.listing_title,
        description: item.listing_description,
        listingType: item.listing_type,
        price: Number(item.price),
        currency: item.currency,
        billingPeriod: item.billing_period,
        depositAmount: item.deposit_amount ? Number(item.deposit_amount) : null,
        availabilityDate: item.availability_date,
        publishedAt: item.published_at,
        propertyId: item.property_id,
        propertyType: item.property_type,
        propertyName: item.property_name,
        county: item.county,
        town: item.town,
        neighborhood: item.neighborhood,
        estate: item.estate,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        primaryImageUrl: item.primary_image_url,
        propertyAmenities: item.property_amenities || [],
      };

      matchedItems.push({
        listing: mappedListing,
        score: finalScore,
        category,
        reasons,
        matchedPreferences: {
          budgetFit,
          locationFit,
          bedroomsFit,
          bathroomsFit,
          amenitiesFit,
          furnishingFit,
        },
        freshness: item.listing_freshness_status || "CURRENT",
        trust: {
          propertyVerified: item.property_verification_status === "VERIFIED",
          contactVerified: !!item.owner_identity_verified,
          listingVerified: item.listing_verification_status === "VERIFIED",
        },
      });
    }

    // Sort by Category order (BEST -> STRONG -> GOOD -> CLOSE) and then score DESC
    const categoryOrder: Record<MatchCategory, number> = {
      BEST_MATCH: 1,
      STRONG_MATCH: 2,
      GOOD_MATCH: 3,
      CLOSE_MATCH: 4,
    };

    matchedItems.sort((a, b) => {
      const orderA = categoryOrder[a.category];
      const orderB = categoryOrder[b.category];
      if (orderA !== orderB) return orderA - orderB;
      return b.score - a.score;
    });

    return {
      items: matchedItems,
      total: matchedItems.length,
    };
  });

export const getRecommendations = () => fnGetRecommendations();
