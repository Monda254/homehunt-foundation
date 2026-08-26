# Search Result Ranking Specification

HomeHunt supports standard deterministic sorting algorithms to order search results.

## Implemented Sorting Algorithms

1. **Recommended (Default)**
   - Orders listings by `published_at DESC` (newest first). Falls back to `created_at DESC` for listings without a published timestamp.

2. **Newest Listings**
   - Explicitly orders by `published_at DESC` with fallback to `created_at DESC`.

3. **Price: Low to High**
   - Orders listings by the numeric `price ASC`. Tiebreaker defaults to `published_at DESC`.

4. **Price: High to Low**
   - Orders listings by the numeric `price DESC`. Tiebreaker defaults to `published_at DESC`.

5. **Availability Date**
   - Orders listings by `availability_date ASC` (earliest move-in date first).

## Future AI & Personalized Ranking

Subsequent phases of HomeHunt will introduce personalized discovery and listing quality scores. The architecture supports injecting these features directly into the DTO mapper:

1. **User Preference Vector Matching**
   - Store user preferences (locations, budget, layout) as a structured configuration.
   - Use cosine similarity or SQL joins to compute match weights.

2. **Listing Quality Scores**
   - Calculate quality weights based on:
     - Verified status (+20% weight)
     - High-resolution media presence (+10% weight)
     - Landlord response rate (+15% weight)
     - Profile completion score (+10% weight)
     - Freshness (decay factor based on days since `published_at`)

3. **Trust Signals Placeholder**
   - Visual badges ("Verified Landlord", "Property Checked") have pre-arranged slots in the `SearchListingCard` markup. They will render once Phase 4 (verification workflows) goes live.
