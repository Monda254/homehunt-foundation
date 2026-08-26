# Search Engine Architecture

This document describes the design of the HomeHunt search and discovery backend.

## Search Flow

```
Raw URL Params
    ↓ (TanStack Router Search Schema)
Validated SearchFilters Object
    ↓ (Vite Server Function)
searchListings Server Function
    ↓
ListingSearchService.search()
    ↓
ListingSearchRepository.search()
    ↓
PostgreSQL View (listings_search_view)
```

## Search Result DTO Contract

The repository queries the `public.listings_search_view` view, which joins listing, property, and unit records, aggregating amenities and primary image URLs in the data layer to prevent N+1 queries.

```typescript
interface ListingSearchResult {
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
  displayLatitude: number | null; // Fuzzed for privacy
  displayLongitude: number | null; // Fuzzed for privacy
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
```

## Filter Semantics

- **Location**: Structured location fields are compared directly. Keyword searches do partial matching using `ILIKE` across all location fields.
- **Amenities**: Matches require **AND** semantics (the listing must contain all selected amenities) implemented using the PostgreSQL array containment operator (`@>`).
