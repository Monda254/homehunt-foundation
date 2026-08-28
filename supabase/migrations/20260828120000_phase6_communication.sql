-- =============================================================
-- HomeHunt Phase 6 — Communication & Viewing Management Migrations
-- =============================================================

-- Helper function for triggers (created if not exists)
CREATE OR REPLACE FUNCTION public.handle_update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Create Tables

-- Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  seeker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status VARCHAR NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ARCHIVED', 'BLOCKED', 'CLOSED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_seeker_provider_diff CHECK (seeker_id <> provider_id),
  CONSTRAINT unique_listing_seeker_provider UNIQUE (listing_id, seeker_id, provider_id)
);

-- Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_type VARCHAR NOT NULL DEFAULT 'TEXT', -- 'TEXT', 'SYSTEM', 'VIEWING_REQUEST', 'VIEWING_CONFIRMATION', 'VIEWING_RESCHEDULE', 'VIEWING_CANCELLATION'
  content TEXT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'SENT', -- 'SENT', 'DELIVERED', 'READ', 'FAILED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Viewings
CREATE TABLE IF NOT EXISTS public.viewings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  seeker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  requested_start TIMESTAMPTZ NOT NULL,
  requested_end TIMESTAMPTZ NOT NULL,
  confirmed_start TIMESTAMPTZ,
  confirmed_end TIMESTAMPTZ,
  status VARCHAR NOT NULL DEFAULT 'REQUESTED', -- 'REQUESTED', 'PENDING', 'CONFIRMED', 'RESCHEDULE_REQUESTED', 'RESCHEDULED', 'CANCELLED', 'COMPLETED', 'NO_SHOW', 'DECLINED'
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Viewing Availabilities (Slots)
CREATE TABLE IF NOT EXISTS public.viewing_availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Blocks
CREATE TABLE IF NOT EXISTS public.blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_blocker_blocked UNIQUE (blocker_id, blocked_id)
);

-- Communication Reports
CREATE TABLE IF NOT EXISTS public.communication_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL,
  reason VARCHAR NOT NULL, -- 'HARASSMENT', 'SPAM', 'SCAM', 'INAPPROPRIATE', 'MISLEADING', 'OTHER'
  description TEXT NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'UNDER_REVIEW', 'RESOLVED'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_type VARCHAR NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Notification Preferences
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel VARCHAR NOT NULL, -- 'IN_APP', 'EMAIL', 'SMS', 'PUSH'
  notification_type VARCHAR NOT NULL, -- 'messages', 'viewing_reminders', 'recommendations', 'marketing'
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_channel_type UNIQUE (user_id, channel, notification_type)
);

-- 2. Triggers for updated_at

CREATE OR REPLACE TRIGGER set_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_viewings_updated_at
  BEFORE UPDATE ON public.viewings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_viewing_availabilities_updated_at
  BEFORE UPDATE ON public.viewing_availabilities
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_communication_reports_updated_at
  BEFORE UPDATE ON public.communication_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

CREATE OR REPLACE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_update_timestamp();

-- 3. Enable Row Level Security (RLS)

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.viewing_availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Conversations: Seeker or Provider or Platform Admin can access
CREATE POLICY "conversations_select_policy" ON public.conversations
  FOR SELECT TO authenticated
  USING (
    seeker_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "conversations_insert_policy" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    seeker_id = auth.uid()
  );

CREATE POLICY "conversations_update_policy" ON public.conversations
  FOR UPDATE TO authenticated
  USING (
    seeker_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

-- Messages: Thread participants can read/write
CREATE POLICY "messages_select_policy" ON public.messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND (
        c.seeker_id = auth.uid() OR
        c.provider_id = auth.uid()
      )
    ) OR
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "messages_insert_policy" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations c
      WHERE c.id = conversation_id AND (
        c.seeker_id = auth.uid() OR
        c.provider_id = auth.uid()
      )
    )
  );

-- Viewings: Seeker, Provider or Platform Admin can read/write
CREATE POLICY "viewings_select_policy" ON public.viewings
  FOR SELECT TO authenticated
  USING (
    seeker_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "viewings_insert_policy" ON public.viewings
  FOR INSERT TO authenticated
  WITH CHECK (
    seeker_id = auth.uid()
  );

CREATE POLICY "viewings_update_policy" ON public.viewings
  FOR UPDATE TO authenticated
  USING (
    seeker_id = auth.uid() OR
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

-- Viewing Availabilities: Provider or Platform Admin can write, anyone can read (to book)
CREATE POLICY "availabilities_select_policy" ON public.viewing_availabilities
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "availabilities_write_policy" ON public.viewing_availabilities
  FOR ALL TO authenticated
  USING (
    provider_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

-- Blocks: Blocker can do anything, no one else can touch
CREATE POLICY "blocks_policy" ON public.blocks
  FOR ALL TO authenticated
  USING (blocker_id = auth.uid())
  WITH CHECK (blocker_id = auth.uid());

-- Communication Reports
CREATE POLICY "reports_select_policy" ON public.communication_reports
  FOR SELECT TO authenticated
  USING (
    reporter_id = auth.uid() OR
    public.is_platform_admin(auth.uid())
  );

CREATE POLICY "reports_insert_policy" ON public.communication_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    reporter_id = auth.uid()
  );

-- Notifications
CREATE POLICY "notifications_select_policy" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notifications_update_policy" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- Notification Preferences
CREATE POLICY "pref_select_policy" ON public.notification_preferences
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "pref_write_policy" ON public.notification_preferences
  FOR ALL TO authenticated
  USING (user_id = auth.uid());

-- 5. Grant Permissions to roles
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversations TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.viewings TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.viewing_availabilities TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blocks TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.communication_reports TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_preferences TO authenticated, service_role;

-- 6. Seed Permissions and Role Mapping
INSERT INTO public.permissions (name, description) VALUES
  ('COMMUNICATION_VIEW_SELF', 'Can view their own conversations and messages'),
  ('COMMUNICATION_CREATE', 'Can start conversations and send messages'),
  ('COMMUNICATION_BLOCK', 'Can block and unblock users'),
  ('COMMUNICATION_REPORT', 'Can report users for moderation'),
  ('VIEWINGS_REQUEST', 'Can request property viewings'),
  ('VIEWINGS_MANAGE', 'Can confirm/decline/cancel viewings'),
  ('VIEWINGS_FEEDBACK', 'Can leave viewing feedback'),
  ('NOTIFICATIONS_VIEW', 'Can view notifications'),
  ('NOTIFICATIONS_UPDATE', 'Can update notification statuses/preferences')
ON CONFLICT (name) DO NOTHING;

-- Map to tenant
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('tenant', 'COMMUNICATION_VIEW_SELF'),
  ('tenant', 'COMMUNICATION_CREATE'),
  ('tenant', 'COMMUNICATION_BLOCK'),
  ('tenant', 'COMMUNICATION_REPORT'),
  ('tenant', 'VIEWINGS_REQUEST'),
  ('tenant', 'VIEWINGS_FEEDBACK'),
  ('tenant', 'NOTIFICATIONS_VIEW'),
  ('tenant', 'NOTIFICATIONS_UPDATE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to landlord
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('landlord', 'COMMUNICATION_VIEW_SELF'),
  ('landlord', 'COMMUNICATION_CREATE'),
  ('landlord', 'COMMUNICATION_BLOCK'),
  ('landlord', 'COMMUNICATION_REPORT'),
  ('landlord', 'VIEWINGS_MANAGE'),
  ('landlord', 'VIEWINGS_FEEDBACK'),
  ('landlord', 'NOTIFICATIONS_VIEW'),
  ('landlord', 'NOTIFICATIONS_UPDATE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to agent
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('agent', 'COMMUNICATION_VIEW_SELF'),
  ('agent', 'COMMUNICATION_CREATE'),
  ('agent', 'COMMUNICATION_BLOCK'),
  ('agent', 'COMMUNICATION_REPORT'),
  ('agent', 'VIEWINGS_MANAGE'),
  ('agent', 'VIEWINGS_FEEDBACK'),
  ('agent', 'NOTIFICATIONS_VIEW'),
  ('agent', 'NOTIFICATIONS_UPDATE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- Map to property_manager
INSERT INTO public.role_permissions (role, permission_name) VALUES
  ('property_manager', 'COMMUNICATION_VIEW_SELF'),
  ('property_manager', 'COMMUNICATION_CREATE'),
  ('property_manager', 'COMMUNICATION_BLOCK'),
  ('property_manager', 'COMMUNICATION_REPORT'),
  ('property_manager', 'VIEWINGS_MANAGE'),
  ('property_manager', 'VIEWINGS_FEEDBACK'),
  ('property_manager', 'NOTIFICATIONS_VIEW'),
  ('property_manager', 'NOTIFICATIONS_UPDATE')
ON CONFLICT (role, permission_name) DO NOTHING;

-- 7. Database Indexes to optimize queries
CREATE INDEX IF NOT EXISTS idx_conversations_seeker ON public.conversations (seeker_id);
CREATE INDEX IF NOT EXISTS idx_conversations_provider ON public.conversations (provider_id);
CREATE INDEX IF NOT EXISTS idx_conversations_listing ON public.conversations (listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv ON public.messages (conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_viewings_seeker ON public.viewings (seeker_id);
CREATE INDEX IF NOT EXISTS idx_viewings_provider ON public.viewings (provider_id);
CREATE INDEX IF NOT EXISTS idx_viewings_listing ON public.viewings (listing_id);
CREATE INDEX IF NOT EXISTS idx_viewings_start ON public.viewings (requested_start);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications (user_id) WHERE (is_read = false);
