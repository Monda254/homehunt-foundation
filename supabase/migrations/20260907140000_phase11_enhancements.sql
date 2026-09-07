-- =============================================================
-- HomeHunt Phase 11 — Intelligence Enhancements Migration
-- =============================================================

-- 1. Duplicate Listing Candidates Table
CREATE TABLE IF NOT EXISTS public.duplicate_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id_1 UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  listing_id_2 UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  similarity_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  reason TEXT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'CONFIRMED', 'DISMISSED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_duplicate_candidate_pair UNIQUE (listing_id_1, listing_id_2)
);

CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_status ON public.duplicate_candidates(status);
CREATE INDEX IF NOT EXISTS idx_duplicate_candidates_pair ON public.duplicate_candidates(listing_id_1, listing_id_2);

-- 2. User Privacy Preferences Table
CREATE TABLE IF NOT EXISTS public.user_privacy_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enable_personalization BOOLEAN NOT NULL DEFAULT true,
  enable_ai_assistance BOOLEAN NOT NULL DEFAULT true,
  enable_search_history BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Market Analytics Daily Aggregate Table
CREATE TABLE IF NOT EXISTS public.market_analytics_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  county VARCHAR NOT NULL,
  town VARCHAR NOT NULL,
  bedrooms INT NOT NULL DEFAULT 1,
  property_type VARCHAR NOT NULL DEFAULT 'Apartment',
  median_rent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  average_rent NUMERIC(12, 2) NOT NULL DEFAULT 0,
  total_listings INT NOT NULL DEFAULT 0,
  recorded_date DATE NOT NULL DEFAULT CURRENT_DATE,
  CONSTRAINT uq_market_analytics_daily UNIQUE (county, town, bedrooms, property_type, recorded_date)
);

CREATE INDEX IF NOT EXISTS idx_market_analytics_location ON public.market_analytics_daily(county, town);
CREATE INDEX IF NOT EXISTS idx_market_analytics_date ON public.market_analytics_daily(recorded_date);

-- Enable RLS
ALTER TABLE public.duplicate_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_analytics_daily ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Duplicate Candidates: Platform admins only
CREATE POLICY "duplicate_candidates_admin" ON public.duplicate_candidates
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- User Privacy Preferences: Users manage their own privacy options
CREATE POLICY "user_privacy_select" ON public.user_privacy_preferences
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()));

CREATE POLICY "user_privacy_insert" ON public.user_privacy_preferences
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "user_privacy_update" ON public.user_privacy_preferences
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Market Analytics Daily: Public read access for insights
CREATE POLICY "market_analytics_select" ON public.market_analytics_daily
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "market_analytics_admin" ON public.market_analytics_daily
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Grants
GRANT SELECT ON public.duplicate_candidates TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.user_privacy_preferences TO authenticated;
GRANT SELECT ON public.market_analytics_daily TO authenticated, anon;

GRANT ALL ON public.duplicate_candidates TO service_role;
GRANT ALL ON public.user_privacy_preferences TO service_role;
GRANT ALL ON public.market_analytics_daily TO service_role;
