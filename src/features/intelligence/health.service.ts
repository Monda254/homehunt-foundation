import { supabaseAdmin as rawSupabaseAdmin } from "@/integrations/supabase/client.server";

const supabaseAdmin = rawSupabaseAdmin as any;

export type FreshnessStatus =
  | "FRESH"
  | "AGING"
  | "STALE"
  | "REQUIRES_RECONFIRMATION"
  | "UNAVAILABLE"
  | "ARCHIVED";

export interface ListingHealthBreakdown {
  freshnessPoints: number; // Max 20
  photoCompletenessPoints: number; // Max 15
  descriptionCompletenessPoints: number; // Max 15
  locationCompletenessPoints: number; // Max 10
  amenityCompletenessPoints: number; // Max 10
  verificationPoints: number; // Max 15
  reportHistoryPoints: number; // Max 10
  engagementPoints: number; // Max 5
}

export interface ListingHealthResult {
  listingId: string;
  healthScore: number;
  freshnessStatus: FreshnessStatus;
  breakdown: ListingHealthBreakdown;
  lastReconfirmedAt: string;
  updatedAt: string;
}

export async function computeListingHealthScore(listingId: string): Promise<ListingHealthResult | null> {
  try {
    const { data: listing, error } = await supabaseAdmin
      .from("listings")
      .select("*, properties(*)")
      .eq("id", listingId)
      .maybeSingle();

    if (error || !listing) {
      console.error("[HealthService] Listing not found or query error:", listingId, error);
      return null;
    }

    const { data: cachedHealth } = await supabaseAdmin
      .from("listing_health_scores")
      .select("last_reconfirmed_at")
      .eq("listing_id", listingId)
      .maybeSingle();

    const now = new Date();
    const lastReconfirmedDate = cachedHealth?.last_reconfirmed_at
      ? new Date(cachedHealth.last_reconfirmed_at)
      : new Date(listing.created_at || now.toISOString());

    const daysSinceReconfirmed = Math.max(
      0,
      Math.floor((now.getTime() - lastReconfirmedDate.getTime()) / (1000 * 60 * 60 * 24))
    );

    // 1. Freshness Points (Max 20)
    let freshnessPoints = 20;
    let freshnessStatus: FreshnessStatus = "FRESH";

    if (daysSinceReconfirmed <= 7) {
      freshnessPoints = 20;
      freshnessStatus = "FRESH";
    } else if (daysSinceReconfirmed <= 21) {
      freshnessPoints = 15;
      freshnessStatus = "AGING";
    } else if (daysSinceReconfirmed <= 45) {
      freshnessPoints = 8;
      freshnessStatus = "STALE";
    } else {
      freshnessPoints = 2;
      freshnessStatus = "REQUIRES_RECONFIRMATION";
    }

    if (listing.status === "RENTED" || listing.status === "UNAVAILABLE") {
      freshnessStatus = "UNAVAILABLE";
    } else if (listing.status === "ARCHIVED") {
      freshnessStatus = "ARCHIVED";
    }

    // 2. Photo Completeness (Max 15)
    const media = Array.isArray(listing.media) ? listing.media : [];
    let photoCompletenessPoints = 0;
    if (media.length >= 5) photoCompletenessPoints = 15;
    else if (media.length >= 3) photoCompletenessPoints = 10;
    else if (media.length >= 1) photoCompletenessPoints = 5;

    // 3. Description Completeness (Max 15)
    const desc = listing.description || "";
    const wordCount = desc.trim().split(/\s+/).filter(Boolean).length;
    let descriptionCompletenessPoints = 0;
    if (wordCount >= 50) descriptionCompletenessPoints = 15;
    else if (wordCount >= 20) descriptionCompletenessPoints = 10;
    else if (wordCount >= 5) descriptionCompletenessPoints = 5;

    // 4. Location Completeness (Max 10)
    const prop = listing.properties || {};
    let locationCompletenessPoints = 0;
    if (prop.latitude && prop.longitude && prop.address) locationCompletenessPoints = 10;
    else if (prop.town || prop.county) locationCompletenessPoints = 6;

    // 5. Amenity Completeness (Max 10)
    const amenities = Array.isArray(listing.amenities)
      ? listing.amenities
      : Array.isArray(prop.amenities)
      ? prop.amenities
      : [];
    let amenityCompletenessPoints = 0;
    if (amenities.length >= 4) amenityCompletenessPoints = 10;
    else if (amenities.length >= 2) amenityCompletenessPoints = 6;
    else if (amenities.length >= 1) amenityCompletenessPoints = 3;

    // 6. Verification Status (Max 15)
    let verificationPoints = 0;
    const vStatus = listing.verification_status || prop.verification_status;
    if (vStatus === "VERIFIED") verificationPoints = 15;
    else if (vStatus === "UNDER_REVIEW") verificationPoints = 8;
    else verificationPoints = 2;

    // 7. Report History (Max 10)
    const { count: reportCount } = await supabaseAdmin
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("event_name", "LISTING_REPORTED")
      .eq("entity_id", listingId);

    const rCount = reportCount || 0;
    let reportHistoryPoints = 10;
    if (rCount === 1) reportHistoryPoints = 5;
    else if (rCount >= 2) reportHistoryPoints = 0;

    // 8. Engagement Points (Max 5)
    const { data: metrics } = await supabaseAdmin
      .from("analytics_listing_metrics")
      .select("view_count, viewing_request_count, application_count")
      .eq("listing_id", listingId)
      .maybeSingle();

    let engagementPoints = 0;
    if (metrics) {
      if (metrics.application_count > 0 || metrics.viewing_request_count > 0) engagementPoints = 5;
      else if (metrics.view_count > 10) engagementPoints = 3;
    }

    const healthScore = Math.min(
      100,
      freshnessPoints +
        photoCompletenessPoints +
        descriptionCompletenessPoints +
        locationCompletenessPoints +
        amenityCompletenessPoints +
        verificationPoints +
        reportHistoryPoints +
        engagementPoints
    );

    const breakdown: ListingHealthBreakdown = {
      freshnessPoints,
      photoCompletenessPoints,
      descriptionCompletenessPoints,
      locationCompletenessPoints,
      amenityCompletenessPoints,
      verificationPoints,
      reportHistoryPoints,
      engagementPoints,
    };

    const record = {
      listing_id: listingId,
      health_score: healthScore,
      freshness_status: freshnessStatus,
      breakdown,
      last_reconfirmed_at: lastReconfirmedDate.toISOString(),
      updated_at: new Date().toISOString(),
    };

    await supabaseAdmin.from("listing_health_scores").upsert(record);

    return {
      listingId,
      healthScore,
      freshnessStatus,
      breakdown,
      lastReconfirmedAt: record.last_reconfirmed_at,
      updatedAt: record.updated_at,
    };
  } catch (err) {
    console.error("[HealthService] Error computing health score:", err);
    return null;
  }
}

export async function getOrCalculateListingHealth(listingId: string): Promise<ListingHealthResult | null> {
  try {
    const { data: cached } = await supabaseAdmin
      .from("listing_health_scores")
      .select("*")
      .eq("listing_id", listingId)
      .maybeSingle();

    if (cached) {
      return {
        listingId: cached.listing_id,
        healthScore: cached.health_score,
        freshnessStatus: cached.freshness_status as FreshnessStatus,
        breakdown: cached.breakdown,
        lastReconfirmedAt: cached.last_reconfirmed_at,
        updatedAt: cached.updated_at,
      };
    }

    return await computeListingHealthScore(listingId);
  } catch (err) {
    console.error("[HealthService] Error reading listing health:", err);
    return null;
  }
}

export async function reconfirmListingAvailability(listingId: string): Promise<boolean> {
  try {
    const nowIso = new Date().toISOString();
    const { error } = await supabaseAdmin.from("listing_health_scores").upsert({
      listing_id: listingId,
      last_reconfirmed_at: nowIso,
      freshness_status: "FRESH",
      updated_at: nowIso,
    });

    if (error) {
      console.error("[HealthService] Error reconfirming listing:", error.message);
      return false;
    }

    await computeListingHealthScore(listingId);
    return true;
  } catch (err) {
    console.error("[HealthService] Exception reconfirming listing:", err);
    return false;
  }
}
