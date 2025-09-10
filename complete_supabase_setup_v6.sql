-- ===================================================================
-- COMPLETE SUPABASE DATABASE SETUP FOR MAYA CHAT APPLICATION V6
-- This is a corrected, cleaned, and unified script.
-- Instructions: Copy this entire script to your Supabase SQL Editor and run it.
-- This will perform a clean setup of your database.
-- ===================================================================

-- STEP 1: CLEAN UP THE OLD ENVIRONMENT
-- Drop all existing tables, functions, and types to ensure a clean slate.
DROP TABLE IF EXISTS "messages_log" CASCADE;
DROP TABLE IF EXISTS "ai_profile_settings" CASCADE;
DROP TABLE IF EXISTS "ad_settings" CASCADE;
DROP TABLE IF EXISTS "ai_media_assets" CASCADE;
DROP TABLE IF EXISTS "daily_activity_log" CASCADE;
DROP TABLE IF EXISTS "app_configurations" CASCADE;
DROP TABLE IF EXISTS "admin_status_display" CASCADE;
DROP TABLE IF EXISTS "managed_demo_contacts" CASCADE;
DROP TABLE IF EXISTS "analytics_data" CASCADE;
DROP TABLE IF EXISTS "user_sessions" CASCADE;
DROP TABLE IF EXISTS "chat_contexts" CASCADE;
DROP TABLE IF EXISTS "user_conversations" CASCADE;

DROP FUNCTION IF EXISTS "update_updated_at_column"() CASCADE;
DROP FUNCTION IF EXISTS "get_daily_message_counts"(DATE) CASCADE;
DROP FUNCTION IF EXISTS "get_daily_active_user_counts"(DATE) CASCADE;
DROP FUNCTION IF EXISTS "log_daily_activity_optimized"(TEXT, TEXT, TEXT) CASCADE;
DROP FUNCTION IF EXISTS "cleanup_expired_contexts"() CASCADE;
DROP FUNCTION IF EXISTS "get_chat_analytics"(INTEGER) CASCADE;

-- ===================================================================
-- STEP 2: ENABLE EXTENSIONS
-- ===================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===================================================================
-- STEP 3: CREATE ALL TABLES WITH UNIFIED DEFINITIONS
-- ===================================================================

-- Stores individual chat messages for logging and pagination.
CREATE TABLE "messages_log" (
    "id" BIGSERIAL PRIMARY KEY,
    "message_id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "sender_type" TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
    "chat_id" TEXT NOT NULL DEFAULT 'kruthika_chat',
    "user_id" TEXT,
    "session_id" TEXT,
    "user_pseudo_id" TEXT,
    "text_content" TEXT,
    "status" TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read')),
    "has_image" BOOLEAN DEFAULT FALSE,
    "has_audio" BOOLEAN DEFAULT FALSE,
    "message_type" TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'media', 'system')),
    "media_url" TEXT,
    "mood" TEXT,
    "response_time_ms" INTEGER,
    "model_used" TEXT DEFAULT 'vertex-ai',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores AI profile configuration.
CREATE TABLE "ai_profile_settings" (
    "id" TEXT PRIMARY KEY DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT 'Maya',
    "avatar_url" TEXT DEFAULT 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    "status" TEXT DEFAULT '🌸 Living my best life! Lets chat! 🌸',
    "status_story_text" TEXT DEFAULT 'Ask me anything! 💬',
    "status_story_image_url" TEXT DEFAULT 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    "status_story_has_update" BOOLEAN DEFAULT true,
    "personality" TEXT DEFAULT 'friendly',
    "language_preference" TEXT DEFAULT 'multilingual',
    "response_style" TEXT DEFAULT 'casual',
    "emotion_enabled" BOOLEAN DEFAULT true,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores ad configuration settings.
CREATE TABLE "ad_settings" (
    "id" TEXT PRIMARY KEY DEFAULT 'default',
    "ads_enabled_globally" BOOLEAN DEFAULT true,
    "show_ads_after_message_count" INTEGER DEFAULT 8,
    "ad_display_duration_ms" INTEGER DEFAULT 5000,
    "max_direct_link_ads_per_day" INTEGER DEFAULT 6,
    "max_direct_link_ads_per_session" INTEGER DEFAULT 3,
    "adsterra_direct_link" TEXT DEFAULT 'https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69',
    "adsterra_direct_link_enabled" BOOLEAN DEFAULT true,
    "adsterra_banner_code" TEXT DEFAULT '',
    "adsterra_banner_enabled" BOOLEAN DEFAULT false,
    "adsterra_native_banner_code" TEXT DEFAULT '',
    "adsterra_native_banner_enabled" BOOLEAN DEFAULT false,
    "adsterra_social_bar_code" TEXT DEFAULT '',
    "adsterra_social_bar_enabled" BOOLEAN DEFAULT false,
    "adsterra_popunder_code" TEXT DEFAULT '',
    "adsterra_popunder_enabled" BOOLEAN DEFAULT true,
    "monetag_direct_link" TEXT DEFAULT '',
    "monetag_direct_link_enabled" BOOLEAN DEFAULT false,
    "monetag_banner_code" TEXT DEFAULT '',
    "monetag_banner_enabled" BOOLEAN DEFAULT false,
    "monetag_native_banner_code" TEXT DEFAULT '',
    "monetag_native_banner_enabled" BOOLEAN DEFAULT false,
    "monetag_social_bar_code" TEXT DEFAULT '',
    "monetag_social_bar_enabled" BOOLEAN DEFAULT false,
    "monetag_popunder_code" TEXT DEFAULT '',
    "monetag_popunder_enabled" BOOLEAN DEFAULT false,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores AI media assets configuration.
CREATE TABLE "ai_media_assets" (
    "id" TEXT PRIMARY KEY DEFAULT 'default',
    "available_images" JSONB DEFAULT '[]',
    "available_audio" JSONB DEFAULT '[]',
    "available_videos" JSONB DEFAULT '[]',
    "profile_images" JSONB DEFAULT '[]',
    "status_images" JSONB DEFAULT '[]',
    "emotion_assets" JSONB DEFAULT '{}',
    "assets" JSONB NOT NULL DEFAULT '{"assets": []}',
    "metadata" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores admin status display configuration.
CREATE TABLE "admin_status_display" (
    "id" TEXT PRIMARY KEY DEFAULT 'default',
    "name" TEXT NOT NULL DEFAULT 'My Status',
    "avatar_url" TEXT DEFAULT 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    "status_text" TEXT DEFAULT 'Hey there! I am using WhatsApp.',
    "status_image_url" TEXT,
    "has_update" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores managed demo contacts for status page.
CREATE TABLE "managed_demo_contacts" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT NOT NULL,
    "status_text" TEXT DEFAULT '',
    "status_image_url" TEXT,
    "has_update" BOOLEAN DEFAULT false,
    "enabled" BOOLEAN DEFAULT true,
    "data_ai_hint" TEXT DEFAULT 'profile person',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores daily activity logs.
CREATE TABLE "daily_activity_log" (
    "id" BIGSERIAL PRIMARY KEY,
    "user_pseudo_id" TEXT NOT NULL,
    "activity_date" DATE NOT NULL,
    "chat_id" TEXT DEFAULT 'kruthika_chat',
    "session_id" TEXT,
    "activity_count" INTEGER DEFAULT 1,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT "unique_user_activity_per_day_per_chat" UNIQUE ("user_pseudo_id", "activity_date", "chat_id")
);

-- Stores application configurations
CREATE TABLE "app_configurations" (
    "id" TEXT PRIMARY KEY DEFAULT 'default',
    "settings" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores user session information.
CREATE TABLE "user_sessions" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "session_id" TEXT UNIQUE NOT NULL,
    "user_pseudo_id" TEXT,
    "chat_id" TEXT DEFAULT 'kruthika_chat',
    "started_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "last_activity" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "is_active" BOOLEAN DEFAULT true
);

-- Stores chat contexts for sessions.
CREATE TABLE "chat_contexts" (
    "id" UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "session_id" TEXT NOT NULL,
    "context_data" JSONB NOT NULL DEFAULT '{}',
    "conversation_history" JSONB DEFAULT '[]',
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "expires_at" TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Stores user conversation state and history.
CREATE TABLE "user_conversations" (
    "user_id" TEXT PRIMARY KEY,
    "history" JSONB DEFAULT '[]',
    "mood" TEXT DEFAULT 'neutral',
    "relationship_stage" TEXT DEFAULT 'stranger',
    "cumulative_sentiment_score" REAL DEFAULT 0.0,
    "metadata" JSONB DEFAULT '{}',
    "unread_count" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ===================================================================
CREATE INDEX "idx_messages_log_chat_id" ON "messages_log"("chat_id");
CREATE INDEX "idx_messages_log_sender_type" ON "messages_log"("sender_type");
CREATE INDEX "idx_messages_log_created_at" ON "messages_log"("created_at" DESC);
CREATE INDEX "idx_messages_log_session_id" ON "messages_log"("session_id");
CREATE INDEX "idx_messages_log_user_id" ON "messages_log"("user_id");
CREATE INDEX "idx_daily_activity_date" ON "daily_activity_log"("activity_date" DESC);
CREATE INDEX "idx_user_sessions_session_id" ON "user_sessions"("session_id");
CREATE INDEX "idx_chat_contexts_session_id" ON "chat_contexts"("session_id");
CREATE INDEX "idx_chat_contexts_expires_at" ON "chat_contexts"("expires_at");
CREATE INDEX "idx_user_conversations_user_id" ON "user_conversations"("user_id");

-- ===================================================================
-- STEP 5: CREATE UTILITY FUNCTIONS
-- ===================================================================

-- Function to automatically update the updated_at column
CREATE OR REPLACE FUNCTION "update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Analytics function to get daily message counts
CREATE OR REPLACE FUNCTION "get_daily_message_counts"(start_date DATE)
RETURNS TABLE(date DATE, messages INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE(created_at) as date,
        COUNT(*)::INTEGER as messages
    FROM messages_log 
    WHERE DATE(created_at) >= start_date
    GROUP BY DATE(created_at)
    ORDER BY DATE(created_at);
END;
$$ LANGUAGE plpgsql;

-- Analytics function to get daily active user counts
CREATE OR REPLACE FUNCTION "get_daily_active_user_counts"(start_date DATE)
RETURNS TABLE(date DATE, active_users INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        activity_date as date,
        SUM(activity_count)::INTEGER as active_users
    FROM daily_activity_log 
    WHERE activity_date >= start_date
    GROUP BY activity_date
    ORDER BY activity_date;
END;
$$ LANGUAGE plpgsql;

-- Function to log daily activity
CREATE OR REPLACE FUNCTION "log_daily_activity_optimized"(
    p_user_pseudo_id TEXT,
    p_chat_id TEXT DEFAULT 'kruthika_chat',
    p_session_id TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO daily_activity_log (user_pseudo_id, activity_date, chat_id, session_id)
    VALUES (p_user_pseudo_id, CURRENT_DATE, p_chat_id, p_session_id)
    ON CONFLICT (user_pseudo_id, activity_date, chat_id)
    DO UPDATE SET 
        activity_count = daily_activity_log.activity_count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired contexts
CREATE OR REPLACE FUNCTION "cleanup_expired_contexts"()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM chat_contexts WHERE expires_at < NOW();
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to get comprehensive chat analytics
CREATE OR REPLACE FUNCTION "get_chat_analytics"(days_back INTEGER DEFAULT 30)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_messages', (
            SELECT COUNT(*) FROM messages_log 
            WHERE created_at >= NOW() - INTERVAL '1 day' * days_back
        ),
        'today_messages', (
            SELECT COUNT(*) FROM messages_log 
            WHERE DATE(created_at) = CURRENT_DATE
        ),
        'user_messages', (
            SELECT COUNT(*) FROM messages_log 
            WHERE sender_type = 'user' AND created_at >= NOW() - INTERVAL '1 day' * days_back
        ),
        'ai_messages', (
            SELECT COUNT(*) FROM messages_log 
            WHERE sender_type = 'ai' AND created_at >= NOW() - INTERVAL '1 day' * days_back
        ),
        'active_users_today', (
            SELECT COUNT(DISTINCT user_pseudo_id) FROM daily_activity_log 
            WHERE activity_date = CURRENT_DATE
        ),
        'total_sessions', (
            SELECT COUNT(*) FROM user_sessions 
            WHERE started_at >= NOW() - INTERVAL '1 day' * days_back
        ),
        'avg_response_time_ms', (
            SELECT COALESCE(AVG(response_time_ms), 0) FROM messages_log 
            WHERE sender_type = 'ai' AND response_time_ms IS NOT NULL 
            AND created_at >= NOW() - INTERVAL '1 day' * days_back
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ===================================================================
-- STEP 6: CREATE TRIGGERS FOR AUTOMATIC TIMESTAMPS
-- ===================================================================
CREATE TRIGGER update_messages_log_updated_at 
    BEFORE UPDATE ON "messages_log" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_profile_settings_updated_at 
    BEFORE UPDATE ON "ai_profile_settings" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ad_settings_updated_at 
    BEFORE UPDATE ON "ad_settings" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_media_assets_updated_at 
    BEFORE UPDATE ON "ai_media_assets" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_status_display_updated_at 
    BEFORE UPDATE ON "admin_status_display" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_managed_demo_contacts_updated_at 
    BEFORE UPDATE ON "managed_demo_contacts" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_activity_log_updated_at 
    BEFORE UPDATE ON "daily_activity_log" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_app_configurations_updated_at 
    BEFORE UPDATE ON "app_configurations" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_conversations_updated_at 
    BEFORE UPDATE ON "user_conversations" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- STEP 7: INSERT DEFAULT DATA
-- ===================================================================

-- Insert default AI profile settings
INSERT INTO "ai_profile_settings" (
    "id", "name", "avatar_url", "status", "status_story_text", "status_story_image_url", "status_story_has_update"
) VALUES (
    'default', 
    'Maya', 
    'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    '🌸 Living my best life! Let''s chat! 🌸',
    'Ask me anything! 💬',
    'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    true
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    status = EXCLUDED.status,
    status_story_text = EXCLUDED.status_story_text,
    status_story_image_url = EXCLUDED.status_story_image_url,
    status_story_has_update = EXCLUDED.status_story_has_update,
    updated_at = NOW();

-- Insert default ad settings
INSERT INTO "ad_settings" ("id") VALUES ('default') 
ON CONFLICT (id) DO NOTHING;

-- Insert default AI media assets
INSERT INTO "ai_media_assets" ("id") VALUES ('default') 
ON CONFLICT (id) DO NOTHING;

-- Insert default admin status display
INSERT INTO "admin_status_display" ("id") VALUES ('default') 
ON CONFLICT (id) DO NOTHING;

-- Insert default app configurations
INSERT INTO "app_configurations" ("id") VALUES ('default') 
ON CONFLICT (id) DO NOTHING;

-- Insert sample demo contacts
INSERT INTO "managed_demo_contacts" ("id", "name", "avatar_url", "status_text", "has_update", "enabled") VALUES
    ('contact_1', 'Sarah Chen', 'https://i.postimg.cc/4xFvGKcV/woman1.jpg', 'Just finished my morning workout! 💪', true, true),
    ('contact_2', 'Alex Johnson', 'https://i.postimg.cc/9FZ8w3pL/man1.jpg', 'Working on a new project 🚀', false, true),
    ('contact_3', 'Priya Sharma', 'https://i.postimg.cc/3RYhLKLx/woman2.jpg', 'Loving this weather! ☀️', true, true),
    ('contact_4', 'David Kim', 'https://i.postimg.cc/W4K8T5Zk/man2.jpg', 'Coffee time ☕', false, true),
    ('contact_5', 'Emma Wilson', 'https://i.postimg.cc/NGvPQLyK/woman3.jpg', 'Reading a great book 📚', true, true)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    avatar_url = EXCLUDED.avatar_url,
    status_text = EXCLUDED.status_text,
    has_update = EXCLUDED.has_update,
    enabled = EXCLUDED.enabled,
    updated_at = NOW();

-- ===================================================================
-- STEP 8: CREATE VIEWS FOR ANALYTICS
-- ===================================================================

-- View for message statistics
CREATE OR REPLACE VIEW "message_stats" AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_messages,
    COUNT(CASE WHEN sender_type = 'user' THEN 1 END) as user_messages,
    COUNT(CASE WHEN sender_type = 'ai' THEN 1 END) as ai_messages,
    COUNT(CASE WHEN has_image = true THEN 1 END) as image_messages,
    COUNT(CASE WHEN has_audio = true THEN 1 END) as audio_messages,
    AVG(CASE WHEN sender_type = 'ai' AND response_time_ms IS NOT NULL THEN response_time_ms END) as avg_response_time_ms
FROM messages_log
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- View for user engagement
CREATE OR REPLACE VIEW "user_engagement" AS
SELECT 
    activity_date as date,
    COUNT(DISTINCT user_pseudo_id) as unique_users,
    SUM(activity_count) as total_activities,
    AVG(activity_count) as avg_activities_per_user
FROM daily_activity_log
GROUP BY activity_date
ORDER BY activity_date DESC;

-- ===================================================================
-- STEP 9: SET UP ROW LEVEL SECURITY (RLS)
-- ===================================================================

-- Enable RLS on all tables
ALTER TABLE "messages_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_profile_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ad_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_media_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_activity_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_configurations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_status_display" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "managed_demo_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chat_contexts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_conversations" ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust as needed for your security requirements)
CREATE POLICY "Allow public read access" ON "messages_log" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON "messages_log" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON "ai_profile_settings" FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON "ai_profile_settings" FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON "ad_settings" FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON "ad_settings" FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON "ai_media_assets" FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON "ai_media_assets" FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON "daily_activity_log" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON "daily_activity_log" FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON "app_configurations" FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON "app_configurations" FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON "admin_status_display" FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON "admin_status_display" FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON "managed_demo_contacts" FOR SELECT USING (true);
CREATE POLICY "Allow public update access" ON "managed_demo_contacts" FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON "user_sessions" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON "user_sessions" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON "user_sessions" FOR UPDATE USING (true);

CREATE POLICY "Allow public read access" ON "chat_contexts" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON "chat_contexts" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON "chat_contexts" FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access" ON "chat_contexts" FOR DELETE USING (true);

CREATE POLICY "Allow public read access" ON "user_conversations" FOR SELECT USING (true);
CREATE POLICY "Allow public insert access" ON "user_conversations" FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access" ON "user_conversations" FOR UPDATE USING (true);

-- ===================================================================
-- STEP 10: VERIFY SETUP
-- ===================================================================

-- Test the setup by running some verification queries
SELECT 'Tables created successfully' as status;

SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN (
    'messages_log', 'ai_profile_settings', 'ad_settings', 'ai_media_assets',
    'daily_activity_log', 'app_configurations', 'admin_status_display',
    'managed_demo_contacts', 'user_sessions', 'chat_contexts', 'user_conversations'
) 
ORDER BY table_name, ordinal_position;

-- Test analytics function
SELECT get_chat_analytics(7) as weekly_analytics;

-- Show sample data
SELECT 'AI Profile Settings:' as section, * FROM ai_profile_settings;
SELECT 'Ad Settings:' as section, * FROM ad_settings;
SELECT 'Demo Contacts:' as section, * FROM managed_demo_contacts;

SELECT 'Database setup completed successfully!' as final_status;