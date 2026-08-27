-- =============================================================
-- HomeHunt Phase 5 — Intelligent Housing Matching Migrations
-- =============================================================

-- 1. Create user_preferences table
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  min_budget NUMERIC,
  max_budget NUMERIC,
  preferred_budget NUMERIC,
  property_types VARCHAR[], -- e.g. ['APARTMENT', 'HOUSE']
  bedrooms INT,
  bedrooms_rule VARCHAR DEFAULT 'MIN', -- 'MIN', 'MAX', 'EXACT'
  bathrooms INT,
  bathrooms_rule VARCHAR DEFAULT 'MIN',
  move_in_date DATE,
  preferred_locations JSONB DEFAULT '[]'::jsonb, -- array of { county, town, neighborhood, estate, priority }
  amenities JSONB DEFAULT '[]'::jsonb, -- array of { amenity, priority }
  furnishing_preference VARCHAR DEFAULT 'ANY', -- 'FURNISHED', 'SEMI-FURNISHED', 'UNFURNISHED', 'ANY'
  priority_weights JSONB DEFAULT '{}'::jsonb, -- e.g. { budget: 'CRITICAL', location: 'CRITICAL', bedrooms: 'HIGH' }
  use_behavioral_personalization BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Create saved_searches table
CREATE TABLE IF NOT EXISTS public.saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  criteria JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create recommendation_feedback table
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  feedback_type VARCHAR NOT NULL, -- 'LIKE', 'SAVE', 'DISLIKE', 'HIDE', 'NOT_RELEVANT'
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_user_listing_feedback UNIQUE (user_id, listing_id, feedback_type)
);

-- 4. Create recommendation_history table
CREATE TABLE IF NOT EXISTS public.recommendation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  shown_at TIMESTAMPTZ DEFAULT now(),
  clicked_at TIMESTAMPTZ,
  saved_at TIMESTAMPTZ,
  hidden_at TIMESTAMPTZ
);

-- 5. Row Level Security Policies
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_searches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_history ENABLE ROW LEVEL SECURITY;

-- Policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Policies for saved_searches
CREATE POLICY "Users can view their own saved searches" ON public.saved_searches
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved searches" ON public.saved_searches
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved searches" ON public.saved_searches
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved searches" ON public.saved_searches
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for recommendation_feedback
CREATE POLICY "Users can view their own feedback" ON public.recommendation_feedback
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own feedback" ON public.recommendation_feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for recommendation_history
CREATE POLICY "Users can view their own history" ON public.recommendation_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own history" ON public.recommendation_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own history" ON public.recommendation_history
  FOR UPDATE USING (auth.uid() = user_id);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_saved_searches_updated_at
  BEFORE UPDATE ON public.saved_searches
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

-- 7. Grant Permissions to authenticated and service_role keys
GRANT ALL ON TABLE public.user_preferences TO authenticated, service_role;
GRANT ALL ON TABLE public.saved_searches TO authenticated, service_role;
GRANT ALL ON TABLE public.recommendation_feedback TO authenticated, service_role;
GRANT ALL ON TABLE public.recommendation_history TO authenticated, service_role;

-- 8. Indexes to optimize query speeds
CREATE INDEX IF NOT EXISTS idx_user_prefs_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_searches_user_id ON public.saved_searches(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_user_id ON public.recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_listing_id ON public.recommendation_feedback(listing_id);
CREATE INDEX IF NOT EXISTS idx_rec_history_user_id ON public.recommendation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_history_listing_id ON public.recommendation_history(listing_id);
