# Search & Discovery Security Specification

Search operations must remain secure and prevent unauthorized data leakages.

## Row Level Security (RLS) & Query Constraints

1. **Listing Status Restrictions**
   - Public searches query the database with strict constraints:
     - `listing_status = 'PUBLISHED'`
     - `listing_deleted_at IS NULL`
   - This ensures `DRAFT`, `PENDING_REVIEW`, `PAUSED`, `ARCHIVED`, and `EXPIRED` listings are never exposed to public search results.
   - This constraint is hardcoded into the `ListingSearchRepository.search()` function and cannot be altered by query parameters.

2. **Private Properties**
   - Properties must be active and public to be returned. RLS policies on the `properties` table restrict selects to `status = 'ACTIVE'` for anonymous roles.

## Coordinate Privacy (Fuzzing)

Exact property addresses and coordinates must be kept private until a viewing is scheduled or tenancy is approved.

1. **Real Coordinates**
   - Precise coordinates (`latitude`/`longitude`) are stored securely in the database and never returned directly to the client map for public searches.

2. **Display Coordinates**
   - Display coordinates (`displayLatitude`/`displayLongitude`) are computed dynamically on the server before transmitting results.
   - We inject a stable, pseudo-random coordinate offset (within ±0.003 degrees, ~300 meters) calculated using a hash of the listing's UUID.
   - This stable offset prevents pins from shifting randomly on the map between page loads, while completely preventing scraping coordinates.

## SQL Injection & Parameter Validation

1. **Zod Validation**
   - Every search parameter is parsed and validated using the `SearchListingsSchema` Zod object. Unexpected parameters are stripped, and malformed types (e.g. string prices) are converted or rejected.

2. **Supabase Client parameterized queries**
   - The query builder uses Supabase's JS SDK which translates to parameterized Postgrest REST calls, preventing any SQL Injection attacks.
