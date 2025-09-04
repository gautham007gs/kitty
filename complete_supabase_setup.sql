
-- ===================================================================
-- COMPLETE SUPABASE DATABASE SETUP FOR MAYA CHAT APPLICATION
-- Copy this entire script to your Supabase SQL Editor and run it
-- This setup enables global updates and admin panel functionality
-- ===================================================================

-- Drop all existing tables and functions for clean setup
DROP TABLE IF EXISTS messages_log CASCADE;
DROP TABLE IF EXISTS ai_profile_settings CASCADE;
DROP TABLE IF EXISTS ad_settings CASCADE;
DROP TABLE IF EXISTS ai_media_assets CASCADE;
DROP TABLE IF EXISTS daily_activity_log CASCADE;
DROP TABLE IF EXISTS app_configurations CASCADE;
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
-- CREATE MAIN TABLES FOR GLOBAL ADMIN FUNCTIONALITY
-- ===================================================================

-- Messages log table (comprehensive schema for Vertex AI integration)
CREATE TABLE messages_log (
    id BIGSERIAL PRIMARY KEY,
    message_id TEXT NOT NULL DEFAULT gen_random_uuid(),
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- AI profile settings table (enhanced for admin panel global updates)
CREATE TABLE ai_profile_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    name TEXT NOT NULL DEFAULT 'Kruthika',
    avatar_url TEXT,
    status TEXT,
    status_story_text TEXT,
    status_story_image_url TEXT,
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

-- Ad settings table (comprehensive ad management with global updates)
CREATE TABLE ad_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    ads_enabled_globally BOOLEAN DEFAULT true,
    show_ads_after_message_count INTEGER DEFAULT 8,
    ad_display_duration_ms INTEGER DEFAULT 5000,
    popunder_cooldown_hours INTEGER DEFAULT 24,
    max_direct_link_ads_per_day INTEGER DEFAULT 6,
    max_direct_link_ads_per_session INTEGER DEFAULT 3,
    adsterra_direct_link TEXT,
    adsterra_direct_link_enabled BOOLEAN DEFAULT true,
    adsterra_banner_enabled BOOLEAN DEFAULT true,
    adsterra_native_banner_enabled BOOLEAN DEFAULT false,
    adsterra_social_bar_enabled BOOLEAN DEFAULT true,
    adsterra_popunder_enabled BOOLEAN DEFAULT true,
    adsterra_popunder_code TEXT,
    adsterra_banner_code TEXT,
    adsterra_native_banner_code TEXT,
    adsterra_social_bar_code TEXT,
    monetag_direct_link TEXT,
    monetag_direct_link_enabled BOOLEAN DEFAULT false,
    monetag_banner_enabled BOOLEAN DEFAULT false,
    monetag_native_banner_enabled BOOLEAN DEFAULT false,
    monetag_social_bar_enabled BOOLEAN DEFAULT false,
    monetag_popunder_enabled BOOLEAN DEFAULT false,
    monetag_popunder_code TEXT,
    monetag_banner_code TEXT,
    monetag_native_banner_code TEXT,
    monetag_social_bar_code TEXT,
    ad_frequency TEXT DEFAULT 'moderate',
    target_audience TEXT DEFAULT 'global',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI media assets table (enhanced for multimedia support)
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

-- App configurations table (CRITICAL for admin global updates)
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

-- Daily activity log table (enhanced analytics)
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

-- Chat contexts table (for Vertex AI conversation context)
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
CREATE INDEX idx_messages_log_composite ON messages_log(chat_id, user_id, created_at DESC);
CREATE INDEX idx_messages_log_timestamp ON messages_log(timestamp);

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

-- App configurations indexes (CRITICAL for admin panel performance)
CREATE INDEX idx_app_configurations_id ON app_configurations(id);
CREATE INDEX idx_app_configurations_type ON app_configurations(config_type);
CREATE INDEX idx_app_configurations_active ON app_configurations(is_active);

-- ===================================================================
-- CREATE TRIGGERS FOR UPDATED_AT (ENABLES REAL-TIME UPDATES)
-- ===================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_messages_log_updated_at BEFORE UPDATE ON messages_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_profile_settings_updated_at BEFORE UPDATE ON ai_profile_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_settings_updated_at BEFORE UPDATE ON ad_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_media_assets_updated_at BEFORE UPDATE ON ai_media_assets
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
ALTER TABLE daily_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_contexts ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- CREATE RLS POLICIES FOR GLOBAL ADMIN FUNCTIONALITY
-- ===================================================================

-- Allow public access for most tables (development mode)
CREATE POLICY "Allow public access for messages_log" ON messages_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for ai_profile_settings" ON ai_profile_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for ad_settings" ON ad_settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for ai_media_assets" ON ai_media_assets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for daily_activity_log" ON daily_activity_log FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for analytics_data" ON analytics_data FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for user_sessions" ON user_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access for chat_contexts" ON chat_contexts FOR ALL USING (true) WITH CHECK (true);

-- Special policies for app_configurations (CRITICAL for admin global updates)
CREATE POLICY "Allow public read access on app_configurations" ON app_configurations
  FOR SELECT USING (true);

CREATE POLICY "Allow public write access on app_configurations" ON app_configurations
  FOR ALL USING (true) WITH CHECK (true);

-- ===================================================================
-- CREATE HELPER FUNCTIONS FOR ADMIN PANEL
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
-- GRANT PERMISSIONS FOR GLOBAL ACCESS
-- ===================================================================

GRANT EXECUTE ON FUNCTION get_daily_message_counts(DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_daily_active_user_counts(DATE) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION log_daily_activity_optimized(TEXT, TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_contexts() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_chat_analytics(INTEGER) TO anon, authenticated;

-- Grant table permissions for global access
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ===================================================================
-- INSERT DEFAULT DATA FOR GLOBAL CONFIGURATION
-- ===================================================================

-- Insert default AI profile settings
INSERT INTO ai_profile_settings (id, name, avatar_url, status, status_story_text, status_story_image_url, settings)
VALUES ('default', 'Kruthika', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', '🌸 Living my best life! Let''s chat! 🌸', 'Ask me anything! 💬', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', '{
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
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- Insert default ad settings with proper Adsterra configuration
INSERT INTO ad_settings (id, adsterra_direct_link, adsterra_popunder_code, adsterra_social_bar_code, settings)
VALUES ('default', 'https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69', 
'<script type="text/javascript">
atOptions = {
    ''key'' : ''2dc1e58e3be02dd1e015a64b5d1d7d69'',
    ''format'' : ''iframe'',
    ''height'' : 50,
    ''width'' : 320,
    ''params'' : {}
};
</script>
<script type="text/javascript" src="//www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d1d7d69/invoke.js"></script>',
'<script type="text/javascript">
atOptions = {
    ''key'' : ''2dc1e58e3be02dd1e015a64b5d1d7d69'',
    ''format'' : ''iframe'',
    ''height'' : 90,
    ''width'' : 728,
    ''params'' : {}
};
</script>
<script type="text/javascript" src="//www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d1d7d69/invoke.js"></script>',
'{
    "version": "v2",
    "lastUpdated": "2024-01-01",
    "environment": "production"
}')
ON CONFLICT (id) DO UPDATE SET
  adsterra_direct_link = EXCLUDED.adsterra_direct_link,
  adsterra_popunder_code = EXCLUDED.adsterra_popunder_code,
  adsterra_social_bar_code = EXCLUDED.adsterra_social_bar_code,
  settings = EXCLUDED.settings,
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
    },
    {
        "id": "song_1",
        "url": "/media/song.mp3",
        "type": "background",
        "mood": "relaxed"
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
        "version": "2.0",
        "totalAssets": 4
    }
}')
ON CONFLICT (id) DO UPDATE SET
  available_images = EXCLUDED.available_images,
  available_audio = EXCLUDED.available_audio,
  assets = EXCLUDED.assets,
  updated_at = NOW();

-- Insert CRITICAL app configurations for global admin functionality
INSERT INTO app_configurations (id, config_type, settings)
VALUES
('ad_settings_kruthika_chat_v1', 'ads', '{
    "adsEnabledGlobally": true,
    "adsterraDirectLink": "https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69",
    "adsterraDirectLinkEnabled": true,
    "adsterraPopunderEnabled": true,
    "adsterraSocialBarEnabled": true,
    "adsterraBannerEnabled": true,
    "adsterraNativeBannerEnabled": false,
    "maxDirectLinkAdsPerDay": 6,
    "maxDirectLinkAdsPerSession": 3,
    "showAdsAfterMessageCount": 8,
    "adDisplayDurationMs": 5000,
    "popunderCooldownHours": 24,
    "adsterraPopunderCode": "<script type=\"text/javascript\">atOptions = {\"key\" : \"2dc1e58e3be02dd1e015a64b5d1d7d69\",\"format\" : \"iframe\",\"height\" : 50,\"width\" : 320,\"params\" : {}};document.write(\"<scr\"+\"ipt type=text/javascript src=//www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d1d7d69/invoke.js></scr\"+\"ipt>\");</script>",
    "adsterraSocialBarCode": "<script type=\"text/javascript\">atOptions = {\"key\" : \"2dc1e58e3be02dd1e015a64b5d1d7d69\",\"format\" : \"iframe\",\"height\" : 90,\"width\" : 728,\"params\" : {}};document.write(\"<scr\"+\"ipt type=text/javascript src=//www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d1d7d69/invoke.js></scr\"+\"ipt>\");</script>",
    "version": "v1"
}'),
('ai_profile', 'ai', '{
    "name": "Kruthika",
    "status": "🌸 Living my best life! Let''s chat! 🌸",
    "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryText": "Ask me anything! 💬",
    "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryHasUpdate": true,
    "personality": "friendly",
    "language": "multilingual",
    "responseStyle": "casual",
    "emotionEnabled": true
}'),
('ai_media_assets_config_v1', 'media', '{
    "availableImages": [
        "https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg",
        "https://i.postimg.cc/52S3BZrM/images-10.jpg"
    ],
    "availableAudio": [
        "/media/laugh.mp3",
        "/media/song.mp3"
    ]
}'),
('vertex_ai_config', 'ai', '{
    "model": "gemini-pro",
    "maxTokens": 1000,
    "temperature": 0.7,
    "topP": 0.9,
    "enabled": true,
    "fallbackModel": "gemini-1.5-flash"
}'),
('realtime_config', 'system', '{
    "enableRealtime": true,
    "adminPanelSync": true,
    "syncInterval": 1000,
    "cacheEnabled": true
}')
ON CONFLICT (id) DO UPDATE SET
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- ===================================================================
-- ENABLE REALTIME FOR ADMIN PANEL GLOBAL UPDATES
-- ===================================================================

-- Enable realtime for admin panel tables (CRITICAL for global updates)
ALTER PUBLICATION supabase_realtime ADD TABLE ai_profile_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE ad_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_media_assets;
ALTER PUBLICATION supabase_realtime ADD TABLE app_configurations;
ALTER PUBLICATION supabase_realtime ADD TABLE analytics_data;
ALTER PUBLICATION supabase_realtime ADD TABLE daily_activity_log;
ALTER PUBLICATION supabase_realtime ADD TABLE user_sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_contexts;

-- ===================================================================
-- SUCCESS MESSAGE
-- ===================================================================

SELECT 'Maya Chat Database Setup Completed Successfully!
✅ All tables created with comprehensive schema
✅ Global admin functionality enabled
✅ Real-time updates configured
✅ App configurations table ready for admin panel
✅ Vertex AI integration ready
✅ Performance indexes added
✅ Default data inserted with global settings
✅ Analytics and reporting functions created
✅ RLS policies configured for development
✅ Adsterra ads properly configured
✅ AI profile syncing enabled

🚀 Your admin panel can now make global updates that affect all users!

Key Features Enabled:
- Global AI profile updates via app_configurations table
- Real-time synchronization across all user sessions
- Comprehensive analytics and monitoring
- Global ad settings management with Adsterra integration
- Multi-user session tracking
- Proper avatar URL syncing between main page and chat

Next steps:
1. Test admin panel global updates
2. Verify real-time functionality
3. Check AI profile saving (should work now)
4. Verify Adsterra ads display
5. Review analytics dashboard' as setup_result;
