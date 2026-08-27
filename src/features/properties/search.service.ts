import { ListingSearchRepository } from "./search.repository";
import {
  type SearchFilters,
  type ListingSearchResult,
  type SearchListingsResponse,
  SearchListingsSchema,
} from "./search.types";

export class ListingSearchService {
  private repository = new ListingSearchRepository();

  async search(rawFilters: unknown): Promise<SearchListingsResponse> {
    // 1. Validate inputs
    const filters = SearchListingsSchema.parse(rawFilters);

    // 2. Perform database search
    const { items: dbItems, count } = await this.repository.search(filters);

    // 3. Map database results to DTOs & Fuzz Coordinates for public location privacy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mappedItems: ListingSearchResult[] = dbItems.map((item: any) => {
      const displayLat = this.getDisplayCoordinate(item.listing_id, item.latitude);
      const displayLng = this.getDisplayCoordinate(item.listing_id, item.longitude);

      return {
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
        address: item.address,
        latitude: item.latitude ? Number(item.latitude) : null,
        longitude: item.longitude ? Number(item.longitude) : null,
        displayLatitude: displayLat,
        displayLongitude: displayLng,
        landmarkDescription: item.landmark_description,
        unitId: item.unit_id,
        unitType: item.unit_type,
        floor: item.floor,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        area: item.area ? Number(item.area) : null,
        propertyAmenities: item.property_amenities || [],
        primaryImageUrl: item.primary_image_url,
        propertyVerificationStatus: item.property_verification_status || "UNVERIFIED",
        listingVerificationStatus: item.listing_verification_status || "UNVERIFIED",
        freshnessStatus: item.listing_freshness_status || "CURRENT",
        ownerIdentityVerified: item.owner_identity_verified || false,
        ownerAgentVerified: item.owner_agent_verified || false,
      };
    });

    const limit = Math.min(filters.limit || 20, 50);
    const page = filters.page || 1;
    const totalPages = Math.ceil(count / limit);

    return {
      items: mappedItems,
      total: count,
      page,
      totalPages,
      limit,
    };
  }

  async getSuggestions(q: string) {
    if (!q || q.trim().length < 2) return [];
    const results = await this.repository.getLocations(q);

    // Format suggestions cleanly
    const suggestions: string[] = [];
    results.forEach((row) => {
      if (row.neighborhood) {
        suggestions.push(`${row.neighborhood}, ${row.town}`);
      }
      if (row.town) {
        suggestions.push(`${row.town}, ${row.county}`);
      }
      if (row.county) {
        suggestions.push(`${row.county} County`);
      }
    });

    // De-duplicate and limit
    return Array.from(new Set(suggestions)).slice(0, 5);
  }

  async getReferences() {
    return this.repository.getReferenceData();
  }

  /**
   * Generates a stable, pseudo-random coordinate offset to protect landlord privacy on maps.
   */
  private getDisplayCoordinate(
    id: string,
    coord: number | string | null | undefined,
  ): number | null {
    if (coord === null || coord === undefined) return null;
    const numCoord = Number(coord);
    // Generate offset between -0.003 and +0.003 degrees (~300m)
    const hash = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const offset = ((hash % 100) / 100 - 0.5) * 0.006;
    return Number((numCoord + offset).toFixed(6));
  }
}
