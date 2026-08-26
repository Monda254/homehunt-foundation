-- =============================================================
-- HomeHunt Phase 3 — Discovery & Search Migrations
-- =============================================================

-- 1. Create tables

-- Saved Searches
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  filters JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT saved_searches_user_name_idx UNIQUE (user_id, name)
);

-- Favorites (Saved Homes)
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT favorites_user_listing_idx UNIQUE (user_id, listing_id)
);

-- Search Analytics Events
CREATE TABLE IF NOT EXISTS public.search_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_analytics_events ENABLE ROW LEVEL SECURITY;

-- Explicit Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_searches TO authenticated;
GRANT ALL ON public.saved_searches TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;

GRANT INSERT ON public.search_analytics_events TO public;
GRANT SELECT ON public.search_analytics_events TO service_role;

-- Policies

-- Saved Searches
CREATE POLICY "saved_searches_owner"
  ON public.saved_searches FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Favorites
CREATE POLICY "favorites_owner"
  ON public.favorites FOR ALL TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Analytics
CREATE POLICY "analytics_insert"
  ON public.search_analytics_events FOR INSERT TO public
  WITH CHECK (true);

-- 3. Create missing search indexes
CREATE INDEX IF NOT EXISTS properties_neighborhood_idx ON public.properties (neighborhood) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS properties_estate_idx ON public.properties (estate) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS units_bedrooms_idx ON public.units (bedrooms) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS units_bathrooms_idx ON public.units (bathrooms) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS units_unit_type_idx ON public.units (unit_type) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS listings_created_at_idx ON public.listings (created_at) WHERE (deleted_at IS NULL);
CREATE INDEX IF NOT EXISTS listings_published_at_idx ON public.listings (published_at) WHERE (deleted_at IS NULL);

-- 4. Create search view joining listing, property, and unit
CREATE OR REPLACE VIEW public.listings_search_view AS
SELECT
  l.id AS listing_id,
  l.title AS listing_title,
  l.description AS listing_description,
  l.listing_type,
  l.status AS listing_status,
  l.price,
  l.currency,
  l.billing_period,
  l.deposit_amount,
  l.availability_date,
  l.published_at,
  l.created_at AS listing_created_at,
  l.deleted_at AS listing_deleted_at,

  p.id AS property_id,
  p.property_type,
  p.name AS property_name,
  p.county,
  p.town,
  p.neighborhood,
  p.estate,
  p.address,
  p.latitude,
  p.longitude,
  p.landmark_description,

  u.id AS unit_id,
  u.unit_type,
  u.floor,
  u.bedrooms,
  u.bathrooms,
  u.area,
  u.status AS unit_status,

  COALESCE(
    (
      SELECT array_agg(pa.amenity)
      FROM public.property_amenities pa
      WHERE pa.property_id = p.id
    ),
    '{}'::text[]
  ) AS property_amenities,

  COALESCE(
    (
      SELECT pm.url
      FROM public.property_media pm
      WHERE pm.listing_id = l.id AND pm.is_primary = true
      LIMIT 1
    ),
    (
      SELECT pm.url
      FROM public.property_media pm
      WHERE pm.unit_id = u.id AND pm.is_primary = true
      LIMIT 1
    ),
    (
      SELECT pm.url
      FROM public.property_media pm
      WHERE pm.property_id = p.id AND pm.is_primary = true
      LIMIT 1
    )
  ) AS primary_image_url
FROM public.listings l
JOIN public.properties p ON l.property_id = p.id
LEFT JOIN public.units u ON l.unit_id = u.id;
