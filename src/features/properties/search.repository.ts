import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { SearchFilters } from "./search.types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabaseAdmin as any;

export class ListingSearchRepository {
  async search(filters: SearchFilters) {
    let query = db.from("listings_search_view").select("*", { count: "exact" });

    // 1. Enforce public visibility constraints
    query = query.eq("listing_status", "PUBLISHED");
    query = query.is("listing_deleted_at", null);

    // 2. Keyword Search
    if (filters.q && filters.q.trim()) {
      const escaped = filters.q.trim().replace(/[\\%_]/g, "\\$&"); // Escape wildcard chars
      const term = `%${escaped}%`;
      query = query.or(
        `county.ilike.${term},town.ilike.${term},neighborhood.ilike.${term},estate.ilike.${term},landmark_description.ilike.${term},listing_title.ilike.${term},property_name.ilike.${term}`,
      );
    }

    // 3. Location Filters
    if (filters.county) {
      query = query.eq("county", filters.county);
    }
    if (filters.town) {
      query = query.eq("town", filters.town);
    }
    if (filters.neighborhood) {
      query = query.eq("neighborhood", filters.neighborhood);
    }
    if (filters.estate) {
      query = query.eq("estate", filters.estate);
    }

    // 4. Price Filters
    if (filters.minPrice !== undefined) {
      query = query.gte("price", filters.minPrice);
    }
    if (filters.maxPrice !== undefined) {
      query = query.lte("price", filters.maxPrice);
    }

    // 5. Property & Unit Type Filters
    if (filters.propertyType) {
      query = query.eq("property_type", filters.propertyType);
    }
    if (filters.unitType) {
      query = query.eq("unit_type", filters.unitType);
    }

    // 6. Bedrooms & Bathrooms (GTE filtering)
    if (filters.bedrooms !== undefined) {
      query = query.gte("bedrooms", filters.bedrooms);
    }
    if (filters.bathrooms !== undefined) {
      query = query.gte("bathrooms", filters.bathrooms);
    }

    // 7. Amenity Filters (AND Semantics)
    if (filters.amenities && filters.amenities.length > 0) {
      query = query.contains("property_amenities", filters.amenities);
    }

    // 8. Availability Filter (available on or before input date)
    if (filters.availabilityDate) {
      query = query.lte("availability_date", filters.availabilityDate);
    }

    // 9. Viewport Bounds Filter
    if (filters.bounds) {
      query = query
        .gte("latitude", filters.bounds.south)
        .lte("latitude", filters.bounds.north)
        .gte("longitude", filters.bounds.west)
        .lte("longitude", filters.bounds.east);
    }

    // 10. Sorting
    switch (filters.sort) {
      case "NEWEST":
        query = query
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("listing_created_at", { ascending: false });
        break;
      case "PRICE_ASC":
        query = query
          .order("price", { ascending: true })
          .order("published_at", { ascending: false, nullsFirst: false });
        break;
      case "PRICE_DESC":
        query = query
          .order("price", { ascending: false })
          .order("published_at", { ascending: false, nullsFirst: false });
        break;
      case "AVAILABILITY":
        query = query
          .order("availability_date", { ascending: true })
          .order("published_at", { ascending: false, nullsFirst: false });
        break;
      case "RECOMMENDED":
      default:
        // Default sort: newest published
        query = query
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("listing_created_at", { ascending: false });
        break;
    }

    // 11. Pagination Offset Math
    const limit = Math.min(filters.limit || 20, 50);
    const page = filters.page || 1;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    query = query.range(from, to);

    const { data, count, error } = await query;
    if (error) {
      console.error("[ListingSearchRepository] Query error:", error);
      throw error;
    }

    return {
      items: data || [],
      count: count || 0,
    };
  }

  async getLocations(q: string) {
    // Dynamic structured location auto-suggestions (distinct county/town combos)
    const escaped = q.trim().replace(/[\\%_]/g, "\\$&");
    const term = `%${escaped}%`;

    const { data, error } = await supabaseAdmin
      .from("properties")
      .select("county, town, neighborhood")
      .eq("status", "ACTIVE")
      .or(`county.ilike.${term},town.ilike.${term},neighborhood.ilike.${term}`)
      .limit(10);

    if (error) throw error;
    return data || [];
  }

  async getReferenceData() {
    // Retrieve distinct counties, towns, amenities dynamically for filter selects
    const [propertiesRes, amenitiesRes] = await Promise.all([
      supabaseAdmin.from("properties").select("county, town").eq("status", "ACTIVE"),
      supabaseAdmin.from("property_amenities").select("amenity"),
    ]);

    if (propertiesRes.error) throw propertiesRes.error;
    if (amenitiesRes.error) throw amenitiesRes.error;

    const counties = Array.from(new Set(propertiesRes.data.map((p) => p.county)));
    const towns = Array.from(new Set(propertiesRes.data.map((p) => p.town)));
    const amenities = Array.from(new Set(amenitiesRes.data.map((a) => a.amenity)));

    return {
      counties,
      towns,
      amenities,
    };
  }
}
