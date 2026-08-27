-- =============================================================
-- HomeHunt Phase 2 — Property & Listing Management Migrations
-- =============================================================

-- 1. Create enum types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_status') THEN
    CREATE TYPE public.property_status AS ENUM (
      'DRAFT',
      'ACTIVE',
      'INACTIVE',
      'ARCHIVED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'property_type') THEN
    CREATE TYPE public.property_type AS ENUM (
      'APARTMENT',
      'HOUSE',
      'BEDSITTER',
      'STUDIO',
      'MAISONETTE',
      'TOWNHOUSE',
      'VILLA',
      'BUNGALOW',
      'ROOM',
      'SHARED_ACCOMMODATION',
      'OTHER'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_status') THEN
    CREATE TYPE public.unit_status AS ENUM (
      'DRAFT',
      'AVAILABLE',
      'RESERVED',
      'OCCUPIED',
      'MAINTENANCE',
      'UNAVAILABLE',
      'ARCHIVED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'unit_type') THEN
    CREATE TYPE public.unit_type AS ENUM (
      'BEDSITTER',
      'STUDIO',
      'ONE_BEDROOM',
      'TWO_BEDROOM',
      'THREE_BEDROOM',
      'FOUR_PLUS_BEDROOM',
      'ROOM',
      'SHARED',
      'HOUSE',
      'OTHER'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_status') THEN
    CREATE TYPE public.listing_status AS ENUM (
      'DRAFT',
      'PENDING_REVIEW',
      'PUBLISHED',
      'PAUSED',
      'EXPIRED',
      'ARCHIVED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_type') THEN
    CREATE TYPE public.listing_type AS ENUM (
      'FOR_RENT',
      'FOR_SALE'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_period') THEN
    CREATE TYPE public.billing_period AS ENUM (
      'MONTHLY',
      'WEEKLY',
      'DAILY',
      'YEARLY'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
    CREATE TYPE public.relationship_type AS ENUM (
      'OWNER',
      'AGENT',
      'PROPERTY_MANAGER'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_status') THEN
    CREATE TYPE public.relationship_status AS ENUM (
      'ACTIVE',
      'PENDING',
      'REVOKED'
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'media_type') THEN
    CREATE TYPE public.media_type AS ENUM (
      'IMAGE',
      'VIDEO',
      'FLOOR_PLAN',
      'DOCUMENT'
    );
  END IF;
END$$;

-- 2. Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_type public.property_type NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status public.property_status NOT NULL DEFAULT 'DRAFT',
  owner_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Geographic location
  country TEXT NOT NULL DEFAULT 'Kenya',
  county TEXT NOT NULL,
  town TEXT NOT NULL,
  neighborhood TEXT,
  estate TEXT,
  address TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  landmark_description TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT properties_name_length CHECK (char_length(name) BETWEEN 3 AND 100),
  CONSTRAINT properties_county_length CHECK (char_length(county) BETWEEN 2 AND 60),
  CONSTRAINT properties_town_length CHECK (char_length(town) BETWEEN 2 AND 60),
  CONSTRAINT properties_latitude_range CHECK (latitude IS NULL OR (latitude BETWEEN -90.0 AND 90.0)),
  CONSTRAINT properties_longitude_range CHECK (longitude IS NULL OR (longitude BETWEEN -180.0 AND 180.0))
);

CREATE INDEX properties_owner_idx ON public.properties (owner_user_id);
CREATE INDEX properties_status_idx ON public.properties (status);
CREATE INDEX properties_type_idx ON public.properties (property_type);
CREATE INDEX properties_county_town_idx ON public.properties (county, town);

-- 3. Create buildings table
CREATE TABLE IF NOT EXISTS public.buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  floors INTEGER CHECK (floors IS NULL OR floors > 0),
  year_built INTEGER CHECK (year_built IS NULL OR (year_built BETWEEN 1900 AND 2100)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT buildings_name_length CHECK (char_length(name) BETWEEN 1 AND 100)
);

CREATE INDEX buildings_property_idx ON public.buildings (property_id);

-- 4. Create units table
CREATE TABLE IF NOT EXISTS public.units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  unit_number TEXT NOT NULL,
  unit_type public.unit_type NOT NULL,
  floor INTEGER,
  bedrooms INTEGER NOT NULL DEFAULT 0 CHECK (bedrooms >= 0),
  bathrooms INTEGER NOT NULL DEFAULT 0 CHECK (bathrooms >= 0),
  area NUMERIC CHECK (area IS NULL OR area > 0),
  status public.unit_status NOT NULL DEFAULT 'DRAFT',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT units_number_length CHECK (char_length(unit_number) BETWEEN 1 AND 30)
);

-- Unique index to prevent duplicate unit numbers within the same property/building
CREATE UNIQUE INDEX units_property_building_number_idx ON public.units (
  property_id, 
  COALESCE(building_id, '00000000-0000-0000-0000-000000000000'::uuid), 
  unit_number
) WHERE (deleted_at IS NULL);

CREATE INDEX units_property_idx ON public.units (property_id);
CREATE INDEX units_building_idx ON public.units (building_id);
CREATE INDEX units_status_idx ON public.units (status);

-- 5. Create property_amenities table (normalized many-to-many)
CREATE TABLE IF NOT EXISTS public.property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (property_id, amenity)
);

-- 6. Create unit_amenities table
CREATE TABLE IF NOT EXISTS public.unit_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES public.units(id) ON DELETE CASCADE,
  amenity TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (unit_id, amenity)
);

-- 7. Create property_parties table
CREATE TABLE IF NOT EXISTS public.property_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_type public.relationship_type NOT NULL,
  status public.relationship_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE (property_id, user_id, relationship_type)
);

CREATE INDEX property_parties_property_user_idx ON public.property_parties (property_id, user_id);

-- 8. Create listings table
CREATE TABLE IF NOT EXISTS public.listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  listing_type public.listing_type NOT NULL DEFAULT 'FOR_RENT',
  status public.listing_status NOT NULL DEFAULT 'DRAFT',
  price NUMERIC NOT NULL CHECK (price >= 0),
  currency TEXT NOT NULL DEFAULT 'KES',
  billing_period public.billing_period NOT NULL DEFAULT 'MONTHLY',
  deposit_amount NUMERIC CHECK (deposit_amount IS NULL OR deposit_amount >= 0),
  availability_date DATE NOT NULL,
  published_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_by_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT listings_title_length CHECK (char_length(title) BETWEEN 5 AND 120),
  CONSTRAINT listings_currency_length CHECK (char_length(currency) = 3)
);

CREATE INDEX listings_property_idx ON public.listings (property_id);
CREATE INDEX listings_unit_idx ON public.listings (unit_id);
CREATE INDEX listings_status_idx ON public.listings (status);
CREATE INDEX listings_price_idx ON public.listings (price);
CREATE INDEX listings_availability_idx ON public.listings (availability_date);

-- 9. Create property_media table
CREATE TABLE IF NOT EXISTS public.property_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  media_type public.media_type NOT NULL DEFAULT 'IMAGE',
  url TEXT NOT NULL,
  storage_key TEXT,
  caption TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT property_media_owner_presence CHECK (
    (property_id IS NOT NULL) OR 
    (unit_id IS NOT NULL) OR 
    (listing_id IS NOT NULL)
  ),
  CONSTRAINT property_media_url_check CHECK (url LIKE 'http%')
);

CREATE INDEX property_media_property_idx ON public.property_media (property_id);
CREATE INDEX property_media_unit_idx ON public.property_media (unit_id);
CREATE INDEX property_media_listing_idx ON public.property_media (listing_id);

-- =============================================================
-- Row Level Security (RLS) Configuration
-- =============================================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unit_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;

-- Select helper policies to verify active property parties
CREATE OR REPLACE FUNCTION public.is_active_property_party(_property_id UUID, _user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.property_parties
    WHERE property_id = _property_id AND user_id = _user_id AND status = 'ACTIVE'
  );
$$;

-- Explicit Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.properties TO authenticated;
GRANT SELECT ON public.properties TO anon;
GRANT ALL ON public.properties TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.buildings TO authenticated;
GRANT SELECT ON public.buildings TO anon;
GRANT ALL ON public.buildings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.units TO authenticated;
GRANT SELECT ON public.units TO anon;
GRANT ALL ON public.units TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_amenities TO authenticated;
GRANT SELECT ON public.property_amenities TO anon;
GRANT ALL ON public.property_amenities TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.unit_amenities TO authenticated;
GRANT SELECT ON public.unit_amenities TO anon;
GRANT ALL ON public.unit_amenities TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_parties TO authenticated;
GRANT SELECT ON public.property_parties TO anon;
GRANT ALL ON public.property_parties TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.listings TO authenticated;
GRANT SELECT ON public.listings TO anon;
GRANT ALL ON public.listings TO service_role;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.property_media TO authenticated;
GRANT SELECT ON public.property_media TO anon;
GRANT ALL ON public.property_media TO service_role;

-- 1. Properties RLS Policies
CREATE POLICY "properties_select_all"
  ON public.properties FOR SELECT TO public
  USING (
    status = 'ACTIVE' 
    OR owner_user_id = auth.uid() 
    OR created_by_user_id = auth.uid()
    OR public.is_active_property_party(id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "properties_insert"
  ON public.properties FOR INSERT TO authenticated
  WITH CHECK (
    owner_user_id = auth.uid()
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "properties_write"
  ON public.properties FOR UPDATE TO authenticated
  USING (
    owner_user_id = auth.uid()
    OR public.is_active_property_party(id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  )
  WITH CHECK (
    owner_user_id = auth.uid()
    OR public.is_active_property_party(id, auth.uid())
    OR public.is_platform_admin(auth.uid())
  );

-- 2. Buildings RLS Policies
CREATE POLICY "buildings_select_all"
  ON public.buildings FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id)
  );

CREATE POLICY "buildings_write"
  ON public.buildings FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

-- 3. Units RLS Policies
CREATE POLICY "units_select_all"
  ON public.units FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM public.properties p WHERE p.id = property_id)
  );

CREATE POLICY "units_write"
  ON public.units FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p 
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

-- 4. Property Amenities Policies
CREATE POLICY "prop_amenities_select"
  ON public.property_amenities FOR SELECT TO public
  USING (true);

CREATE POLICY "prop_amenities_write"
  ON public.property_amenities FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

-- 5. Unit Amenities Policies
CREATE POLICY "unit_amenities_select"
  ON public.unit_amenities FOR SELECT TO public
  USING (true);

CREATE POLICY "unit_amenities_write"
  ON public.unit_amenities FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON u.property_id = p.id
      WHERE u.id = unit_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

-- 6. Listings RLS Policies
CREATE POLICY "listings_select_all"
  ON public.listings FOR SELECT TO public
  USING (
    status = 'PUBLISHED'
    OR created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR public.is_platform_admin(auth.uid())
  );

CREATE POLICY "listings_write"
  ON public.listings FOR ALL TO authenticated
  USING (
    created_by_user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR public.is_platform_admin(auth.uid())
  );

-- 7. Property Media Policies
CREATE POLICY "media_select_all"
  ON public.property_media FOR SELECT TO public
  USING (true);

CREATE POLICY "media_write"
  ON public.property_media FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.units u
      JOIN public.properties p ON u.property_id = p.id
      WHERE u.id = unit_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR EXISTS (
      SELECT 1 FROM public.listings l
      JOIN public.properties p ON l.property_id = p.id
      WHERE l.id = listing_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_active_property_party(p.id, auth.uid())
      )
    )
    OR public.is_platform_admin(auth.uid())
  );

-- 8. Property Parties RLS Policies
CREATE POLICY "parties_select_all"
  ON public.property_parties FOR SELECT TO public
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_platform_admin(auth.uid())
      )
    )
  );

CREATE POLICY "parties_write"
  ON public.property_parties FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties p
      WHERE p.id = property_id AND (
        p.owner_user_id = auth.uid()
        OR public.is_platform_admin(auth.uid())
      )
    )
  );
