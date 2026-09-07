-- =============================================================
-- HomeHunt Phase 11 — Intelligence, Analytics & AI Layer Migrations
-- =============================================================

-- 1. Analytics Events Table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name VARCHAR NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  anonymous_session_id VARCHAR,
  entity_type VARCHAR,
  entity_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  request_id VARCHAR,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for performance & aggregate queries
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON public.analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_user ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON public.analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_entity ON public.analytics_events(entity_type, entity_id);

-- 2. Aggregated Listing Metrics Table
CREATE TABLE IF NOT EXISTS public.analytics_listing_metrics (
  listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  view_count INT NOT NULL DEFAULT 0,
  save_count INT NOT NULL DEFAULT 0,
  viewing_request_count INT NOT NULL DEFAULT 0,
  application_count INT NOT NULL DEFAULT 0,
  lease_count INT NOT NULL DEFAULT 0,
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Listing Health & Freshness Scores Table
CREATE TABLE IF NOT EXISTS public.listing_health_scores (
  listing_id UUID PRIMARY KEY REFERENCES public.listings(id) ON DELETE CASCADE,
  health_score INT NOT NULL DEFAULT 0,
  freshness_status VARCHAR NOT NULL DEFAULT 'FRESH', -- 'FRESH', 'AGING', 'STALE', 'REQUIRES_RECONFIRMATION', 'UNAVAILABLE', 'ARCHIVED'
  breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_reconfirmed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_listing_health_score ON public.listing_health_scores(health_score);
CREATE INDEX IF NOT EXISTS idx_listing_freshness ON public.listing_health_scores(freshness_status);

-- 4. AI Usage Tracking Table
CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model VARCHAR NOT NULL,
  feature VARCHAR NOT NULL,
  prompt_version VARCHAR NOT NULL DEFAULT 'v1',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  estimated_cost NUMERIC(10, 6) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_feature ON public.ai_usage(feature);
CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON public.ai_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_created ON public.ai_usage(created_at);

-- 5. Recommendation Feedback Table
CREATE TABLE IF NOT EXISTS public.recommendation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  feedback_type VARCHAR NOT NULL, -- 'NOT_INTERESTED', 'TOO_EXPENSIVE', 'WRONG_LOCATION', 'WRONG_PROPERTY_TYPE', 'ALREADY_RENTED', 'NOT_TRUSTED', 'SHOW_MORE_LIKE_THIS'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_rec_feedback UNIQUE(user_id, listing_id, feedback_type)
);

CREATE INDEX IF NOT EXISTS idx_rec_feedback_user ON public.recommendation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_rec_feedback_listing ON public.recommendation_feedback(listing_id);

-- 6. Risk Signals & Anomaly Signals Table
CREATE TABLE IF NOT EXISTS public.risk_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR NOT NULL, -- 'LISTING', 'PROPERTY', 'USER', 'PAYMENT'
  entity_id UUID NOT NULL,
  signal_type VARCHAR NOT NULL, -- 'PRICE_ANOMALY', 'DUPLICATE_CONTENT', 'SUSPICIOUS_PAYMENT_RETRY', 'REPORT_SPIKE', 'INCOMPLETE_VERIFICATION'
  confidence VARCHAR NOT NULL DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH'
  reason TEXT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'INVESTIGATING', 'CONFIRMED', 'DISMISSED', 'RESOLVED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_risk_signals_entity ON public.risk_signals(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_risk_signals_status ON public.risk_signals(status);

-- 7. Feature Flags Table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key VARCHAR UNIQUE NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  rollout_percentage INT NOT NULL DEFAULT 100,
  allowed_roles JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed Initial Feature Flags
INSERT INTO public.feature_flags (flag_key, description, enabled, rollout_percentage)
VALUES 
  ('AI_PROPERTY_SUMMARY', 'Enables AI-assisted property summary and concern breakdown', true, 100),
  ('AI_RISK_ASSISTANT', 'Enables AI risk assessment for listings and reports', true, 100),
  ('RECOMMENDATION_ENGINE_V2', 'Enables explainable compatibility recommendation feed', true, 100),
  ('MARKET_INSIGHTS', 'Enables public/tenant aggregated market trends and pricing insights', true, 100),
  ('LISTING_HEALTH_SCORES', 'Enables 0-100 listing health calculation and display', true, 100)
ON CONFLICT (flag_key) DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_listing_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listing_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendation_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Analytics Events: Anyone can insert events (authenticated or anonymous tracking), admins can select
CREATE POLICY "analytics_events_insert_policy" ON public.analytics_events
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "analytics_events_select_policy" ON public.analytics_events
  FOR SELECT TO authenticated
  USING (
    public.is_platform_admin(auth.uid()) OR
    user_id = auth.uid()
  );

-- Analytics Listing Metrics: Public select, admin/service update
CREATE POLICY "analytics_listing_metrics_select" ON public.analytics_listing_metrics
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "analytics_listing_metrics_all" ON public.analytics_listing_metrics
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Listing Health Scores: Public select, admin update
CREATE POLICY "listing_health_scores_select" ON public.listing_health_scores
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "listing_health_scores_admin" ON public.listing_health_scores
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- AI Usage: Admins can select, authenticated users can insert own records
CREATE POLICY "ai_usage_insert" ON public.ai_usage
  FOR INSERT TO authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid() OR public.is_platform_admin(auth.uid()));

CREATE POLICY "ai_usage_select" ON public.ai_usage
  FOR SELECT TO authenticated
  USING (public.is_platform_admin(auth.uid()));

-- Recommendation Feedback: Users manage their own feedback
CREATE POLICY "rec_feedback_select" ON public.recommendation_feedback
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_platform_admin(auth.uid()));

CREATE POLICY "rec_feedback_insert" ON public.recommendation_feedback
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "rec_feedback_delete" ON public.recommendation_feedback
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Risk Signals: Admin only
CREATE POLICY "risk_signals_admin" ON public.risk_signals
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Feature Flags: Public select, admin manage
CREATE POLICY "feature_flags_select" ON public.feature_flags
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "feature_flags_admin" ON public.feature_flags
  FOR ALL TO authenticated
  USING (public.is_platform_admin(auth.uid()))
  WITH CHECK (public.is_platform_admin(auth.uid()));

-- Grants
GRANT SELECT, INSERT ON public.analytics_events TO authenticated, anon;
GRANT SELECT ON public.analytics_listing_metrics TO authenticated, anon;
GRANT SELECT ON public.listing_health_scores TO authenticated, anon;
GRANT SELECT, INSERT ON public.ai_usage TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.recommendation_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.risk_signals TO authenticated;
GRANT SELECT ON public.feature_flags TO authenticated, anon;

GRANT ALL ON public.analytics_events TO service_role;
GRANT ALL ON public.analytics_listing_metrics TO service_role;
GRANT ALL ON public.listing_health_scores TO service_role;
GRANT ALL ON public.ai_usage TO service_role;
GRANT ALL ON public.recommendation_feedback TO service_role;
GRANT ALL ON public.risk_signals TO service_role;
GRANT ALL ON public.feature_flags TO service_role;
