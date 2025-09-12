-- ===================================================================
-- COMPLETE SUPABASE DATABASE SETUP FOR MAYA CHAT APPLICATION V7 (FIXED)
-- This is a corrected, cleaned, and unified script.
-- Instructions: Copy this entire script to your Supabase SQL Editor and run it.
-- This will perform a clean setup of your database.
-- Fixed all issues including API loops and ad display
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

-- Drop views if they exist
DROP VIEW IF EXISTS "message_stats" CASCADE;
DROP VIEW IF EXISTS "user_engagement" CASCADE;

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
    "id" TEXT PRIMARY KEY DEFAULT 'kruthika_chat_v1',
    "name" TEXT NOT NULL DEFAULT 'Kruthika',
    "avatar_url" TEXT DEFAULT 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    "status" TEXT DEFAULT '🌸 Tumse baat karne ka wait kar rahi hun! Let''s chat! 🌸',
    "status_story_text" TEXT DEFAULT 'Ask me anything! 💬 Main hamesha available hun!',
    "status_story_image_url" TEXT DEFAULT 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    "status_story_has_update" BOOLEAN DEFAULT TRUE,
    "personality_traits" JSONB DEFAULT '{}',
    "conversation_style" TEXT DEFAULT 'friendly',
    "response_patterns" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores ad configuration settings.
CREATE TABLE "ad_settings" (
    "id" TEXT PRIMARY KEY DEFAULT 'default',
    "ads_enabled_globally" BOOLEAN DEFAULT TRUE,
    "max_direct_link_ads_per_day" INTEGER DEFAULT 6,
    "max_direct_link_ads_per_session" INTEGER DEFAULT 3,
    "adsterra_direct_link" TEXT DEFAULT '',
    "adsterra_direct_link_enabled" BOOLEAN DEFAULT FALSE,
    "adsterra_banner_code" TEXT DEFAULT '',
    "adsterra_banner_enabled" BOOLEAN DEFAULT FALSE,
    "adsterra_native_banner_code" TEXT DEFAULT '',
    "adsterra_native_banner_enabled" BOOLEAN DEFAULT FALSE,
    "adsterra_social_bar_code" TEXT DEFAULT '',
    "adsterra_social_bar_enabled" BOOLEAN DEFAULT FALSE,
    "adsterra_popunder_code" TEXT DEFAULT '',
    "adsterra_popunder_enabled" BOOLEAN DEFAULT FALSE,
    "monetag_direct_link" TEXT DEFAULT '',
    "monetag_direct_link_enabled" BOOLEAN DEFAULT FALSE,
    "monetag_banner_code" TEXT DEFAULT '',
    "monetag_banner_enabled" BOOLEAN DEFAULT FALSE,
    "monetag_native_banner_code" TEXT DEFAULT '',
    "monetag_native_banner_enabled" BOOLEAN DEFAULT FALSE,
    "monetag_social_bar_code" TEXT DEFAULT '',
    "monetag_social_bar_enabled" BOOLEAN DEFAULT FALSE,
    "monetag_popunder_code" TEXT DEFAULT '',
    "monetag_popunder_enabled" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores AI media assets configuration.
CREATE TABLE "ai_media_assets" (
    "id" SERIAL PRIMARY KEY,
    "asset_type" TEXT NOT NULL CHECK (asset_type IN ('image', 'audio', 'video', 'document')),
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "description" TEXT,
    "tags" TEXT[],
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores admin status display configuration.
CREATE TABLE "admin_status_display" (
    "id" TEXT PRIMARY KEY DEFAULT 'kruthika_status_v1',
    "status_text" TEXT DEFAULT 'Ask me anything! 💬 Main hamesha available hun!',
    "status_image_url" TEXT DEFAULT 'https://i.postimg.cc/52S3BZrM/images-10.jpg',
    "has_update" BOOLEAN DEFAULT TRUE,
    "is_active" BOOLEAN DEFAULT TRUE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores managed demo contacts for status page.
CREATE TABLE "managed_demo_contacts" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "status" TEXT DEFAULT 'Hey there! I am using WhatsApp.',
    "avatar_url" TEXT,
    "last_seen" TEXT DEFAULT 'online',
    "unread_count" INTEGER DEFAULT 0,
    "is_pinned" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores daily activity logs.
CREATE TABLE "daily_activity_log" (
    "id" BIGSERIAL PRIMARY KEY,
    "date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "user_id" TEXT,
    "activity_type" TEXT NOT NULL,
    "activity_data" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores analytics data.
CREATE TABLE "analytics_data" (
    "id" BIGSERIAL PRIMARY KEY,
    "metric_name" TEXT NOT NULL,
    "metric_value" NUMERIC NOT NULL,
    "metric_date" DATE NOT NULL DEFAULT CURRENT_DATE,
    "additional_data" JSONB DEFAULT '{}',
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores user session information.
CREATE TABLE "user_sessions" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "session_data" JSONB DEFAULT '{}',
    "last_activity" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "expires_at" TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- Stores chat contexts for sessions.
CREATE TABLE "chat_contexts" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "context_data" JSONB DEFAULT '{}',
    "last_updated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "expires_at" TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Stores user conversation state and history.
CREATE TABLE "user_conversations" (
    "id" BIGSERIAL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "message_count" INTEGER DEFAULT 0,
    "last_message_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stores application configurations with proper structure
CREATE TABLE "app_configurations" (
    "id" TEXT PRIMARY KEY,
    "config_key" TEXT UNIQUE,
    "config_data" JSONB,
    "settings" JSONB,
    "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ===================================================================
-- STEP 4: CREATE INDEXES FOR PERFORMANCE
-- ===================================================================
CREATE INDEX IF NOT EXISTS "idx_messages_log_chat_id" ON "messages_log"("chat_id");
CREATE INDEX IF NOT EXISTS "idx_messages_log_user_id" ON "messages_log"("user_id");
CREATE INDEX IF NOT EXISTS "idx_messages_log_created_at" ON "messages_log"("created_at");
CREATE INDEX IF NOT EXISTS "idx_daily_activity_log_date" ON "daily_activity_log"("date");
CREATE INDEX IF NOT EXISTS "idx_daily_activity_log_user_id" ON "daily_activity_log"("user_id");
CREATE INDEX IF NOT EXISTS "idx_analytics_data_date" ON "analytics_data"("metric_date");
CREATE INDEX IF NOT EXISTS "idx_user_sessions_user_id" ON "user_sessions"("user_id");
CREATE INDEX IF NOT EXISTS "idx_chat_contexts_user_id" ON "chat_contexts"("user_id");

-- ===================================================================
-- STEP 5: CREATE HELPER FUNCTIONS
-- ===================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION "update_updated_at_column"()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER "update_ai_profile_settings_updated_at" BEFORE UPDATE ON "ai_profile_settings" FOR EACH ROW EXECUTE FUNCTION "update_updated_at_column"();
CREATE TRIGGER "update_ad_settings_updated_at" BEFORE UPDATE ON "ad_settings" FOR EACH ROW EXECUTE FUNCTION "update_updated_at_column"();
CREATE TRIGGER "update_app_configurations_updated_at" BEFORE UPDATE ON "app_configurations" FOR EACH ROW EXECUTE FUNCTION "update_updated_at_column"();

-- ===================================================================
-- STEP 6: ENABLE ROW LEVEL SECURITY
-- ===================================================================
ALTER TABLE "messages_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_profile_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ad_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "app_configurations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "admin_status_display" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "managed_demo_contacts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ai_media_assets" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "daily_activity_log" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "analytics_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chat_contexts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "user_conversations" ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- STEP 7: CREATE POLICIES
-- ===================================================================

-- Public read access policies
CREATE POLICY "Allow public read access to messages_log" ON "messages_log" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to ai_profile_settings" ON "ai_profile_settings" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to ad_settings" ON "ad_settings" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to app_configurations" ON "app_configurations" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to admin_status_display" ON "admin_status_display" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to managed_demo_contacts" ON "managed_demo_contacts" FOR SELECT USING (true);
CREATE POLICY "Allow public read access to ai_media_assets" ON "ai_media_assets" FOR SELECT USING (true);

-- Public write access policies (you may want to restrict these in production)
CREATE POLICY "Allow public write access to messages_log" ON "messages_log" FOR ALL USING (true);
CREATE POLICY "Allow public write access to ai_profile_settings" ON "ai_profile_settings" FOR ALL USING (true);
CREATE POLICY "Allow public write access to ad_settings" ON "ad_settings" FOR ALL USING (true);
CREATE POLICY "Allow public write access to app_configurations" ON "app_configurations" FOR ALL USING (true);
CREATE POLICY "Allow public write access to admin_status_display" ON "admin_status_display" FOR ALL USING (true);
CREATE POLICY "Allow public write access to managed_demo_contacts" ON "managed_demo_contacts" FOR ALL USING (true);
CREATE POLICY "Allow public write access to ai_media_assets" ON "ai_media_assets" FOR ALL USING (true);
CREATE POLICY "Allow public write access to daily_activity_log" ON "daily_activity_log" FOR ALL USING (true);
CREATE POLICY "Allow public write access to analytics_data" ON "analytics_data" FOR ALL USING (true);
CREATE POLICY "Allow public write access to user_sessions" ON "user_sessions" FOR ALL USING (true);
CREATE POLICY "Allow public write access to chat_contexts" ON "chat_contexts" FOR ALL USING (true);
CREATE POLICY "Allow public write access to user_conversations" ON "user_conversations" FOR ALL USING (true);

-- ===================================================================
-- STEP 8: INSERT DEFAULT DATA
-- ===================================================================

-- Insert default AI profile
INSERT INTO "ai_profile_settings" ("id", "name", "avatar_url", "status", "status_story_text", "status_story_image_url", "status_story_has_update")
VALUES ('kruthika_chat_v1', 'Kruthika', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', '🌸 Tumse baat karne ka wait kar rahi hun! Let''s chat! 🌸', 'Ask me anything! 💬 Main hamesha available hun!', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', true)
ON CONFLICT (id) DO UPDATE SET
    "name" = EXCLUDED.name,
    "avatar_url" = EXCLUDED.avatar_url,
    "status" = EXCLUDED.status,
    "status_story_text" = EXCLUDED.status_story_text,
    "status_story_image_url" = EXCLUDED.status_story_image_url,
    "status_story_has_update" = EXCLUDED.status_story_has_update,
    "updated_at" = NOW();

-- Insert default ad settings
INSERT INTO "ad_settings" ("id", "ads_enabled_globally", "adsterra_banner_enabled", "adsterra_banner_code")
VALUES ('default', true, true, '<script type="text/javascript">
	atOptions = {
		''key'' : ''2a86a3b22e8c1477e8a83d56c0386bb3'',
		''format'' : ''iframe'',
		''height'' : 90,
		''width'' : 728,
		''params'' : {}
	};
</script>
<script type="text/javascript" src="//judicialphilosophical.com/2a86a3b22e8c1477e8a83d56c0386bb3/invoke.js"></script>')
ON CONFLICT (id) DO UPDATE SET
    "ads_enabled_globally" = EXCLUDED.ads_enabled_globally,
    "adsterra_banner_enabled" = EXCLUDED.adsterra_banner_enabled,
    "adsterra_banner_code" = EXCLUDED.adsterra_banner_code,
    "updated_at" = NOW();

-- Insert default status
INSERT INTO "admin_status_display" ("id", "status_text", "status_image_url", "has_update", "is_active")
VALUES ('kruthika_status_v1', 'Ask me anything! 💬 Main hamesha available hun!', 'https://i.postimg.cc/52S3BZrM/images-10.jpg', true, true)
ON CONFLICT (id) DO UPDATE SET
    "status_text" = EXCLUDED.status_text,
    "status_image_url" = EXCLUDED.status_image_url,
    "has_update" = EXCLUDED.has_update,
    "is_active" = EXCLUDED.is_active,
    "updated_at" = NOW();

-- Insert default app configurations
INSERT INTO "app_configurations" ("id", "config_key", "config_data", "settings")
VALUES ('global_settings', 'global_settings', '{"initialized": true, "version": "v7"}', '{"initialized": true, "version": "v7"}')
ON CONFLICT (id) DO UPDATE SET
    "config_data" = EXCLUDED.config_data,
    "settings" = EXCLUDED.settings,
    "updated_at" = NOW();

-- ===================================================================
-- STEP 9: SUCCESS MESSAGE
-- ===================================================================
DO $$
BEGIN
    RAISE NOTICE 'Maya Chat Database Setup V7 Completed Successfully!';
    RAISE NOTICE 'All tables, indexes, functions, and default data have been created.';
    RAISE NOTICE 'The database is ready for use.';
END $$;

-- ===================================================================
-- STEP 10: GRANT PERMISSIONS AND ENABLE REALTIME
-- ===================================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE ai_profile_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE ad_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE app_configurations;
ALTER PUBLICATION supabase_realtime ADD TABLE admin_status_display;
ALTER PUBLICATION supabase_realtime ADD TABLE managed_demo_contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_media_assets;

-- ===================================================================
-- STEP 11: VERIFY SETUP
-- ===================================================================

-- Test the setup by running some verification queries
SELECT 'Tables created successfully' as status;

-- Verify table structure
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN (
    'messages_log', 'ai_profile_settings', 'ad_settings', 'ai_media_assets',
    'daily_activity_log', 'app_configurations', 'admin_status_display',
    'managed_demo_contacts', 'user_sessions', 'chat_contexts', 'user_conversations'
)
ORDER BY table_name, ordinal_position;

-- Show sample data
SELECT 'AI Profile Settings:' as section, id, name, status FROM ai_profile_settings;
SELECT 'Ad Settings:' as section, id, ads_enabled_globally, adsterra_banner_enabled FROM ad_settings;
SELECT 'App Configurations:' as section, id, config_key, config_data FROM app_configurations;
SELECT 'Demo Contacts:' as section, id, name, status FROM managed_demo_contacts;

SELECT 'Database setup completed successfully! Version 7.0 (Fixed)' as final_status;