# Geospatial Search & PostGIS Migration Path

This document outlines the current geospatial boundary approach and the future PostGIS migration pathway.

## Current Bounding-Box Filtering

Currently, viewport search is implemented using standard numeric constraints on the `latitude` and `longitude` fields in the `properties` table (which are exposed via `listings_search_view`).

```sql
WHERE latitude >= south
  AND latitude <= north
  AND longitude >= west
  AND longitude <= east
```

This bounding box filter is simple, highly performant for small-to-medium datasets, and does not require complex spatial configurations.

## Future PostGIS Migration

For spatial radius query matching (e.g. "homes within 2km of Westlands Stage"), HomeHunt is designed to transition to PostGIS spatial points.

### 1. Spatial Geometry Column addition

Add a `GEOGRAPHY(Point, 4326)` column to the `properties` table:

```sql
ALTER TABLE public.properties ADD COLUMN geom GEOGRAPHY(Point, 4326);
```

### 2. Synchronization Trigger

Create a database trigger to keep `latitude` and `longitude` numeric values synchronized with the `geom` point on insertion/updates:

```sql
CREATE OR REPLACE FUNCTION update_geom_point()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.latitude IS NOT NULL AND NEW.longitude IS NOT NULL THEN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  ELSE
    NEW.geom := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER sync_properties_geom
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW EXECUTE FUNCTION update_geom_point();
```

### 3. Spatial Indexing

Create a GIST spatial index on the geometry column:

```sql
CREATE INDEX properties_geom_gist ON public.properties USING GIST (geom);
```

### 4. Radius Search Query

To query listings within a specific radius (e.g., `radius_meters`) of a central point `(center_lng, center_lat)`:

```sql
SELECT listing_id, price
FROM public.listings_search_view
WHERE ST_DWithin(
  geom,
  ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography,
  radius_meters
)
ORDER BY geom <-> ST_SetSRID(ST_MakePoint(center_lng, center_lat), 4326)::geography;
```

_(The `<->` operator performs index-accelerated Nearest Neighbor sorting)_
