# Database Indexing Strategy

This document outlines the indexing strategy implemented to optimize Phase 3 search queries.

## Performance Analysis & Indexes Created

We analyzed standard search filter workloads and created performance indexes targeting columns in search joins:

### 1. Property Location Indexes

- `properties_county_town_idx` (Composite `(county, town)`) - already present. Supports filtering by county/town.
- `properties_neighborhood_idx` (`(neighborhood)`) - added. Optimizes filtering/sorting by neighborhood name.
- `properties_estate_idx` (`(estate)`) - added. Optimizes filtering by estate name.

### 2. Unit Specs Indexes

- `units_bedrooms_idx` (`(bedrooms)`) - added. Optimizes bedroom counts constraints.
- `units_bathrooms_idx` (`(bathrooms)`) - added. Optimizes bathroom counts queries.
- `units_unit_type_idx` (`(unit_type)`) - added. Optimizes queries filtering by studio, bedsitter, etc.

### 3. Listing Search Indexes

- `listings_price_idx` (`(price)`) - already present. Supports price range filtering and sorting.
- `listings_availability_idx` (`(availability_date)`) - already present. Supports move-in date filtering.
- `listings_published_at_idx` (`(published_at)`) - added. SupportsRecommended/Newest sorting.
- `listings_created_at_idx` (`(created_at)`) - added. Tie-breaker sorting.

## View Join Performance

Since queries run on `listings_search_view`, PostgreSQL leverages indexes on the underlying tables (`listings`, `properties`, `units`) when resolving Joins:

- Joining `listings` and `properties` is accelerated by `properties_pkey` index.
- Left joining `units` is accelerated by `units_pkey` index.
- Loading primary image is accelerated by `property_media_listing_idx` and `property_media_property_idx`.
