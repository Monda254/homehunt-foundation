import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { AppError, ERROR_CODES } from "@/core/errors/api-error";
import { ListingSearchService } from "./search.service";
import { z } from "zod";

const searchService = new ListingSearchService();

// =============================================================
// Public Search Operations
// =============================================================

export const searchListings = createServerFn({ method: "GET" })
  .validator((data: unknown) => data)
  .handler(async ({ data }) => {
    try {
      return await searchService.search(data);
    } catch (err: unknown) {
      console.error("[searchListings] Error:", err);
      const msg = err instanceof Error ? err.message : "Search failed.";
      throw new AppError(ERROR_CODES.BAD_REQUEST, msg);
    }
  });

export const getLocationSuggestions = createServerFn({ method: "GET" })
  .validator(z.string())
  .handler(async ({ data: q }) => {
    try {
      return await searchService.getSuggestions(q);
    } catch (err: unknown) {
      console.error("[getLocationSuggestions] Error:", err);
      return [];
    }
  });

export const getReferenceData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    return await searchService.getReferences();
  } catch (err: unknown) {
    console.error("[getReferenceData] Error:", err);
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Failed to retrieve reference data.");
  }
});

// =============================================================
// Analytics Logging
// =============================================================

export const logSearchAnalytics = createServerFn({ method: "POST" })
  .validator(
    z.object({
      eventType: z.enum([
        "SEARCH_PERFORMED",
        "FILTER_APPLIED",
        "FILTER_REMOVED",
        "LISTING_VIEWED",
        "MAP_OPENED",
        "MAP_AREA_CHANGED",
        "SORT_CHANGED",
      ]),
      payload: z.any(),
    }),
  )
  .handler(async ({ data, context }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (context as any)?.userId || null;
    try {
      await (supabaseAdmin as any).from("search_analytics_events").insert({
        user_id: userId,
        event_type: data.eventType,
        payload: data.payload,
      });
      return { success: true };
    } catch (err) {
      console.error("[logSearchAnalytics] Failed to record search event:", err);
      return { success: false };
    }
  });

// =============================================================
// Authenticated Saved Searches
// =============================================================

export const createSavedSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(
    z.object({
      name: z.string().min(1).max(100),
      filters: z.any(),
    }),
  )
  .handler(async ({ data, context }) => {
    const { userId } = context;

    const { data: saved, error } = await (supabaseAdmin as any)
      .from("saved_searches")
      .insert({
        user_id: userId,
        name: data.name,
        filters: data.filters,
      })
      .select("id")
      .single();

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
    }

    return { success: true, id: saved.id };
  });

export const getSavedSearches = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data, error } = await (supabaseAdmin as any)
      .from("saved_searches")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
    }

    return data || [];
  });

export const deleteSavedSearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: id, context }) => {
    const { userId } = context;

    const { error } = await (supabaseAdmin as any)
      .from("saved_searches")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
    }

    return { success: true };
  });

// =============================================================
// Authenticated Listing Favorites
// =============================================================

export const addFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: listingId, context }) => {
    const { userId } = context;

    const { error } = await (supabaseAdmin as any).from("favorites").insert({
      user_id: userId,
      listing_id: listingId,
    });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
    }

    return { success: true };
  });

export const removeFavorite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator(z.string().uuid())
  .handler(async ({ data: listingId, context }) => {
    const { userId } = context;

    const { error } = await (supabaseAdmin as any)
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", listingId);

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
    }

    return { success: true };
  });

export const getFavorites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;

    const { data, error } = await (supabaseAdmin as any)
      .from("favorites")
      .select(
        `
        id,
        listing_id,
        created_at,
        listings (
          id,
          title,
          price,
          currency,
          billing_period,
          availability_date,
          properties (
            property_type,
            county,
            town,
            neighborhood
          ),
          units (
            bedrooms,
            bathrooms
          )
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new AppError(ERROR_CODES.BAD_REQUEST, error.message);
    }

    // Resolve primary images for each favorite listing
    const listingIds = (data || []).map((f: any) => f.listing_id);
    const { data: mediaRows } = await supabaseAdmin
      .from("property_media")
      .select("listing_id, url")
      .in("listing_id", listingIds)
      .eq("is_primary", true);

    const mediaMap = (mediaRows || []).reduce(
      (acc, row) => {
        if (row.listing_id) acc[row.listing_id] = row.url;
        return acc;
      },
      {} as Record<string, string>,
    );

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data || []).map((fav: any) => ({
      id: fav.id,
      listingId: fav.listing_id,
      createdAt: fav.created_at,
      listing: fav.listings
        ? {
            ...fav.listings,
            primaryImageUrl: mediaMap[fav.listing_id] || null,
          }
        : null,
    }));
  });
