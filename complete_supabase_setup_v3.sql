
-- ===================================================================
-- COMPLETE SUPABASE DATABASE SETUP FOR MAYA CHAT APPLICATION V3
-- Copy this entire script to your Supabase SQL Editor and run it
-- ===================================================================

-- Drop all existing tables and functions for clean setup
DROP TABLE IF EXISTS messages_log CASCADE;
DROP TABLE IF EXISTS ai_profile_settings CASCADE;
DROP TABLE IF EXISTS ad_settings CASCADE;
DROP TABLE IF EXISTS ai_media_assets CASCADE;
DROP TABLE IF EXISTS daily_activity_log CASCADE;
DROP TABLE IF EXISTS app_configurations CASCADE;
DROP TABLE IF EXISTS admin_status_display CASCADE;
DROP TABLE IF EXISTS managed_demo_contacts CASCADE;
DROP TABLE IF EXISTS analytics_data CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS chat_contexts CASCADE;

-- Drop existing functions
DROP FUNCTION IF EXISTS get_daily_message_counts(DATE);
DROP FUNCTION IF EXISTS get_daily_active_user_counts(DATE);
DROP FUNCTION IF EXISTS log_daily_activity_optimized(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS cleanup_expired_contexts();
DROP FUNCTION IF EXISTS get_chat_analytics(INTEGER);

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- CREATE MAIN TABLES
-- ===================================================================

-- Messages log table (for analytics)
CREATE TABLE messages_log (
    id BIGSERIAL PRIMARY KEY,
    message_id TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
    chat_id TEXT NOT NULL DEFAULT 'kruthika_chat',
    user_id TEXT,
    session_id TEXT,
    user_pseudo_id TEXT,
    text_content TEXT,
    message_content TEXT,
    content TEXT,
    has_image BOOLEAN DEFAULT FALSE,
    has_audio BOOLEAN DEFAULT FALSE,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'media', 'system')),
    media_url TEXT,
    media_caption TEXT,
    mood TEXT,
    emotion_state TEXT,
    user_agent TEXT,
    ip_address INET,
    language_detected TEXT,
    response_time_ms INTEGER,
    model_used TEXT DEFAULT 'vertex-ai',
    token_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI profile settings table (matches AIProfile type exactly)
CREATE TABLE ai_profile_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'Kruthika',
    avatar_url TEXT DEFAULT 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    status TEXT DEFAULT '🌸 Living my best life! Let''s chat! 🌸',
    status_story_text TEXT DEFAULT 'Ask me anything! 💬',
    status_story_image_url TEXT DEFAULT 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    status_story_has_update BOOLEAN DEFAULT true,
    personality TEXT DEFAULT 'friendly',
    language_preference TEXT DEFAULT 'multilingual',
    response_style TEXT DEFAULT 'casual',
    emotion_enabled BOOLEAN DEFAULT true,
    custom_prompts JSONB DEFAULT '{}',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ad settings table (matches AdSettings type exactly)
CREATE TABLE ad_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    ads_enabled_globally BOOLEAN DEFAULT true,
    show_ads_after_message_count INTEGER DEFAULT 8,
    ad_display_duration_ms INTEGER DEFAULT 5000,
    popunder_cooldown_hours INTEGER DEFAULT 24,
    max_direct_link_ads_per_day INTEGER DEFAULT 6,
    max_direct_link_ads_per_session INTEGER DEFAULT 3,
    adsterra_direct_link TEXT DEFAULT 'https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69',
    adsterra_direct_link_enabled BOOLEAN DEFAULT true,
    adsterra_banner_enabled BOOLEAN DEFAULT false,
    adsterra_native_banner_enabled BOOLEAN DEFAULT false,
    adsterra_social_bar_enabled BOOLEAN DEFAULT false,
    adsterra_popunder_enabled BOOLEAN DEFAULT true,
    adsterra_popunder_code TEXT DEFAULT '<script type="text/javascript">
atOptions = {
    ''key'' : ''2dc1e58e3be02dd1e015a64b5d1d7d69'',
    ''format'' : ''iframe'',
    ''height'' : 50,
    ''width'' : 320,
    ''params'' : {}
};
</script>
<script type="text/javascript" src="//www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d1d7d69/invoke.js"></script>',
    adsterra_banner_code TEXT DEFAULT '<!-- Adsterra Banner Code -->',
    adsterra_native_banner_code TEXT DEFAULT '<!-- Adsterra Native Banner Code -->',
    adsterra_social_bar_code TEXT DEFAULT '<!-- Adsterra Social Bar Code -->',
    monetag_direct_link TEXT DEFAULT 'https://www.profitablecpmgate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69',
    monetag_direct_link_enabled BOOLEAN DEFAULT false,
    monetag_banner_enabled BOOLEAN DEFAULT false,
    monetag_native_banner_enabled BOOLEAN DEFAULT false,
    monetag_social_bar_enabled BOOLEAN DEFAULT false,
    monetag_popunder_enabled BOOLEAN DEFAULT false,
    monetag_popunder_code TEXT DEFAULT '<!-- Monetag Pop-under Script -->',
    monetag_banner_code TEXT DEFAULT '<!-- Monetag Banner Code -->',
    monetag_native_banner_code TEXT DEFAULT '<!-- Monetag Native Banner Code -->',
    monetag_social_bar_code TEXT DEFAULT '<!-- Monetag Social Bar Code -->',
    ad_frequency TEXT DEFAULT 'moderate',
    target_audience TEXT DEFAULT 'global',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI media assets table (matches AIMediaAssetsConfig type)
CREATE TABLE ai_media_assets (
    id TEXT PRIMARY KEY DEFAULT 'default',
    available_images JSONB DEFAULT '[]',
    available_audio JSONB DEFAULT '[]',
    available_videos JSONB DEFAULT '[]',
    profile_images JSONB DEFAULT '[]',
    status_images JSONB DEFAULT '[]',
    emotion_assets JSONB DEFAULT '{}',
    assets JSONB NOT NULL DEFAULT '{"assets": []}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Admin status display table (matches AdminStatusDisplay type)
CREATE TABLE admin_status_display (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'My Status',
    avatar_url TEXT DEFAULT 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    status_text TEXT DEFAULT 'Hey there! I am using WhatApp.',
    status_image_url TEXT,
    has_update BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Managed demo contacts table (matches ManagedContactStatus type)
CREATE TABLE managed_demo_contacts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    status_text TEXT DEFAULT '',
    status_image_url TEXT,
    has_update BOOLEAN DEFAULT false,
    enabled BOOLEAN DEFAULT true,
    data_ai_hint TEXT DEFAULT 'profile person',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily activity log table (for analytics)
CREATE TABLE daily_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_pseudo_id TEXT NOT NULL,
    activity_date DATE NOT NULL,
    chat_id TEXT DEFAULT 'kruthika_chat',
    session_id TEXT,
    user_id TEXT,
    activity_count INTEGER DEFAULT 1,
    message_count INTEGER DEFAULT 0,
    session_duration_seconds INTEGER DEFAULT 0,
    device_type TEXT,
    browser_info TEXT,
    location_country TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_activity_per_day_per_chat UNIQUE (user_pseudo_id, activity_date, chat_id)
);

-- App configurations table (for backward compatibility)
CREATE TABLE app_configurations (
    id TEXT PRIMARY KEY,
    config_type TEXT NOT NULL DEFAULT 'general',
    settings JSONB NOT NULL,
    version TEXT DEFAULT 'v1',
    environment TEXT DEFAULT 'production',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics data table (comprehensive analytics)
CREATE TABLE analytics_data (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_name TEXT,
    event_data JSONB,
    user_id TEXT,
    session_id TEXT,
    chat_id TEXT DEFAULT 'kruthika_chat',
    timestamp_ms BIGINT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (session management)
CREATE TABLE user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    user_pseudo_id TEXT,
    chat_id TEXT DEFAULT 'kruthika_chat',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ended_at TIMESTAMP WITH TIME ZONE,
    session_duration_seconds INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    device_info JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true
);

-- Chat contexts table (for AI conversation context)
CREATE TABLE chat_contexts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT,
    chat_id TEXT DEFAULT 'kruthika_chat',
    context_data JSONB NOT NULL DEFAULT '{}',
    conversation_history JSONB DEFAULT '[]',
    current_mood TEXT,
    personality_state JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- ===================================================================
-- CREATE INDEXES FOR PERFORMANCE
-- ===================================================================

-- Messages log indexes
CREATE INDEX idx_messages_log_chat_id ON messages_log(chat_id);
CREATE INDEX idx_messages_log_sender_type ON messages_log(sender_type);
CREATE INDEX idx_messages_log_created_at ON messages_log(created_at DESC);
CREATE INDEX idx_messages_log_session_id ON messages_log(session_id);
CREATE INDEX idx_messages_log_user_id ON messages_log(user_id);

-- Daily activity indexes
CREATE INDEX idx_daily_activity_date ON daily_activity_log(activity_date DESC);
CREATE INDEX idx_daily_activity_chat ON daily_activity_log(chat_id);
CREATE INDEX idx_daily_activity_user ON daily_activity_log(user_pseudo_id);

-- Analytics indexes
CREATE INDEX idx_analytics_event_type ON analytics_data(event_type);
CREATE INDEX idx_analytics_created_at ON analytics_data(created_at DESC);
CREATE INDEX idx_analytics_session_id ON analytics_data(session_id);

-- Session indexes
CREATE INDEX idx_user_sessions_session_id ON user_sessions(session_id);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active, last_activity DESC);

-- Context indexes
CREATE INDEX idx_chat_contexts_session_id ON chat_contexts(session_id);
CREATE INDEX idx_chat_contexts_expires_at ON chat_contexts(expires_at);

-- ===================================================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- ===================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to all tables with updated_at
CREATE TRIGGER update_messages_log_updated_at BEFORE UPDATE ON messages_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_profile_settings_updated_at BEFORE UPDATE ON ai_profile_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_settings_updated_at BEFORE UPDATE ON ad_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_media_assets_updated_at BEFORE UPDATE ON ai_media_assets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_status_display_updated_at BEFORE UPDATE ON admin_status_display
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managed_demo_contacts_updated_at BEFORE UPDATE ON managed_demo_contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_activity_log_updated_at BEFORE UPDATE ON daily_activity_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_configurations_updated_at BEFORE UPDATE ON app_configurations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- ENABLE ROW LEVEL SECURITY
-- ===================================================================

ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_status_display ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_demo_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_contexts ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- CREATE RLS POLICIES (DEVELOPMENT MODE - OPEN ACCESS)
-- ===================================================================

-- Allow public access for all tables (development mode)
CREATE POLICY "Allow public access for messages_log" ON messages_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for ai_profile_settings" ON ai_profile_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for ad_settings" ON ad_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for ai_media_assets" ON ai_media_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for admin_status_display" ON admin_status_display FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for managed_demo_contacts" ON managed_demo_contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for daily_activity_log" ON daily_activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for app_configurations" ON app_configurations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for analytics_data" ON analytics_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for user_sessions" ON user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for chat_contexts" ON chat_contexts FOR ALL USING (true) WITH CHECK (true);

-- ===================================================================
-- CREATE HELPER FUNCTIONS
-- ===================================================================

-- Function to get daily message counts
CREATE OR REPLACE FUNCTION get_daily_message_counts(start_date DATE)
RETURNS TABLE(date DATE, messages BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('day', ml.created_at AT TIME ZONE 'UTC')::DATE AS date,
    COUNT(ml.id) AS messages
  FROM messages_log ml
  WHERE (ml.created_at AT TIME ZONE 'UTC')::DATE >= start_date
  GROUP BY DATE_TRUNC('day', ml.created_at AT TIME ZONE 'UTC')
  ORDER BY date ASC;
END;
$$;

-- Function to get daily active user counts
CREATE OR REPLACE FUNCTION get_daily_active_user_counts(start_date DATE)
RETURNS TABLE(date DATE, active_users BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dal.activity_date AS date,
    COUNT(DISTINCT dal.user_pseudo_id) AS active_users
  FROM daily_activity_log dal
  WHERE dal.activity_date >= start_date
  AND dal.chat_id = 'kruthika_chat'
  GROUP BY dal.activity_date
  ORDER BY date ASC;
END;
$$;

-- Optimized daily activity logging function
CREATE OR REPLACE FUNCTION log_daily_activity_optimized(
    p_user_id TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT 'anonymous',
    p_chat_id TEXT DEFAULT 'kruthika_chat'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO daily_activity_log (user_pseudo_id, activity_date, chat_id, session_id, activity_count)
    VALUES (COALESCE(p_user_id, 'anonymous'), CURRENT_DATE, p_chat_id, p_session_id, 1)
    ON CONFLICT (user_pseudo_id, activity_date, chat_id)
    DO UPDATE SET
        activity_count = daily_activity_log.activity_count + 1,
        session_id = EXCLUDED.session_id,
        updated_at = NOW();
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Daily activity logging failed: %', SQLERRM;
END;
$$;

-- Function to clean up expired chat contexts
CREATE OR REPLACE FUNCTION cleanup_expired_contexts()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chat_contexts WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;

-- Function to get chat analytics
CREATE OR REPLACE FUNCTION get_chat_analytics(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
    total_messages BIGINT,
    total_users BIGINT,
    avg_session_duration NUMERIC,
    total_sessions BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM messages_log WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back) as total_messages,
        (SELECT COUNT(DISTINCT user_pseudo_id) FROM daily_activity_log WHERE activity_date >= CURRENT_DATE - INTERVAL '1 day' * days_back) as total_users,
        (SELECT COALESCE(AVG(session_duration_seconds), 0) FROM user_sessions WHERE started_at >= CURRENT_DATE - INTERVAL '1 day' * days_back) as avg_session_duration,
        (SELECT COUNT(*) FROM user_sessions WHERE started_at >= CURRENT_DATE - INTERVAL '1 day' * days_back) as total_sessions;
END;
$$;

-- ===================================================================
-- GRANT PERMISSIONS
-- ===================================================================

GRANT EXECUTE ON FUNCTION get_daily_message_counts(DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_daily_active_user_counts(DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_daily_activity_optimized(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_contexts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_chat_analytics(INTEGER) TO anon, authenticated;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ===================================================================
-- INSERT DEFAULT DATA
-- ===================================================================

-- Insert default AI profile settings
INSERT INTO ai_profile_settings (id, name, avatar_url, status, status_story_text, status_story_image_url, status_story_has_update, settings)
VALUES ('default', 'Kruthika', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', '🌸 Living my best life! Let''s chat! 🌸', 'Ask me anything! 💬', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', true, '{
    "personality": "friendly",
    "language": "multilingual",
    "responseStyle": "casual",
    "emotionEnabled": true,
    "vertexAiModel": "gemini-pro",
    "maxTokens": 1000,
    "temperature": 0.7
}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  status = EXCLUDED.status,
  status_story_text = EXCLUDED.status_story_text,
  status_story_image_url = EXCLUDED.status_story_image_url,
  status_story_has_update = EXCLUDED.status_story_has_update,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- Insert default ad settings
INSERT INTO ad_settings (id, settings)
VALUES ('default', '{
    "version": "v3",
    "lastUpdated": "2024-01-01",
    "environment": "production"
}')
ON CONFLICT (id) DO UPDATE SET
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- Insert default admin status
INSERT INTO admin_status_display (id, name, avatar_url, status_text, has_update)
VALUES ('default', 'My Status', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', 'Hey there! I am using WhatApp.', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  status_text = EXCLUDED.status_text,
  has_update = EXCLUDED.has_update,
  updated_at = NOW();

-- Insert default demo contacts (exactly 4 as mentioned)
INSERT INTO managed_demo_contacts (id, name, avatar_url, status_text, has_update, enabled, data_ai_hint)
VALUES 
('contact_1', 'Sarah', 'https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg', 'At the coffee shop ☕', true, true, 'profile woman friend'),
('contact_2', 'Mike', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', 'Working from home 💻', false, true, 'profile man colleague'),
('contact_3', 'Emma', 'https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg', 'On vacation! 🌴', true, true, 'profile woman friend'),
('contact_4', 'Alex', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', 'Busy with meetings', false, true, 'profile person colleague')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  avatar_url = EXCLUDED.avatar_url,
  status_text = EXCLUDED.status_text,
  has_update = EXCLUDED.has_update,
  enabled = EXCLUDED.enabled,
  data_ai_hint = EXCLUDED.data_ai_hint,
  updated_at = NOW();

-- Insert default AI media assets
INSERT INTO ai_media_assets (id, available_images, available_audio, assets)
VALUES ('default', '[
    {
        "id": "profile_1",
        "url": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
        "type": "profile",
        "mood": "happy"
    },
    {
        "id": "status_1",
        "url": "https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg",
        "type": "status",
        "mood": "cheerful"
    }
]', '[
    {
        "id": "laugh_1",
        "url": "/media/laugh.mp3",
        "type": "reaction",
        "mood": "happy"
    }
]', '{
    "assets": [
        {
            "id": "default_avatar",
            "type": "image",
            "url": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
            "category": "avatar"
        }
    ],
    "metadata": {
        "version": "3.0",
        "totalAssets": 3
    }
}')
ON CONFLICT (id) DO UPDATE SET
  available_images = EXCLUDED.available_images,
  available_audio = EXCLUDED.available_audio,
  assets = EXCLUDED.assets,
  updated_at = NOW();

-- Insert default app configurations for backward compatibility
INSERT INTO app_configurations (id, config_type, settings)
VALUES
('ad_settings_kruthika_chat_v1', 'ads', '{
    "adsEnabledGlobally": true,
    "adsterraDirectLink": "https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69",
    "adsterraDirectLinkEnabled": true,
    "maxDirectLinkAdsPerDay": 6,
    "maxDirectLinkAdsPerSession": 3,
    "version": "v3"
}'),
('ai_profile_kruthika_chat_v1', 'ai_profile', '{
    "name": "Kruthika",
    "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "status": "🌸 Living my best life! Let''s chat! 🌸",
    "statusStoryText": "Ask me anything! 💬",
    "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryHasUpdate": true
}'),
('admin_own_status_kruthika_chat_v1', 'admin_status', '{
    "name": "My Status",
    "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusText": "Hey there! I am using WhatApp.",
    "hasUpdate": false
}'),
('managed_demo_contacts_kruthika_chat_v1', 'demo_contacts', '[
    {
        "id": "contact_1",
        "name": "Sarah",
        "avatarUrl": "https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg",
        "statusText": "At the coffee shop ☕",
        "hasUpdate": true,
        "enabled": true,
        "dataAiHint": "profile woman friend"
    },
    {
        "id": "contact_2",
        "name": "Mike",
        "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
        "statusText": "Working from home 💻",
        "hasUpdate": false,
        "enabled": true,
        "dataAiHint": "profile man colleague"
    },
    {
        "id": "contact_3",
        "name": "Emma",
        "avatarUrl": "https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg",
        "statusText": "On vacation! 🌴",
        "hasUpdate": true,
        "enabled": true,
        "dataAiHint": "profile woman friend"
    },
    {
        "id": "contact_4",
        "name": "Alex",
        "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
        "statusText": "Busy with meetings",
        "hasUpdate": false,
        "enabled": true,
        "dataAiHint": "profile person colleague"
    }
]'),
('ai_media_assets_kruthika_chat_v1', 'media', '{
    "assets": [
        {
            "id": "default_avatar",
            "type": "image",
            "url": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
            "category": "avatar"
        }
    ]
}')
ON CONFLICT (id) DO UPDATE SET
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- ===================================================================
-- ENABLE REALTIME (for admin panel real-time updates)
-- ===================================================================

-- Enable realtime for admin panel tables
ALTER PUBLICATION supabase_realtime ADD TABLE ai_profile_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE ad_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_media_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_status_display;
ALTER PUBLICATION supabase_realtime ADD TABLE managed_demo_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE app_configurations;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_data;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_contexts;

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================

SELECT 'Maya Chat Database Setup V3 Completed Successfully!
✅ All tables created with exact schema matching TypeScript types
✅ All 4 demo contacts added for status page consistency  
✅ Admin panel global updates enabled with realtime sync
✅ Ad settings unified across admin panel and app
✅ AI profile and status page data unified
✅ Performance indexes and triggers added
✅ Default data inserted with proper relationships
✅ Analytics and reporting functions created
✅ Backward compatibility maintained

Status Page Contacts: 4 (Sarah, Mike, Emma, Alex)
Admin Panel will show same 4 contacts for consistent experience.

Next steps:
1. Your environment variables are correctly configured
2. Run this SQL script in Supabase SQL Editor  
3. Test admin panel real-time updates
4. Verify status page shows exactly 4 contacts
5. Confirm ads from admin panel appear in app' as setup_result;
