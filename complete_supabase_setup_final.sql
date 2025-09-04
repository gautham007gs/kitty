
-- Complete Supabase Database Setup for Maya Chat Application
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS messages_log CASCADE;
DROP TABLE IF EXISTS ai_profile_settings CASCADE;
DROP TABLE IF EXISTS ad_settings CASCADE;
DROP TABLE IF EXISTS ai_media_assets CASCADE;
DROP TABLE IF EXISTS daily_activity_log CASCADE;
DROP TABLE IF EXISTS app_configurations CASCADE;

-- Create messages_log table
CREATE TABLE messages_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id TEXT NOT NULL DEFAULT 'kruthika_chat',
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    text TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'audio', 'media')),
    media_url TEXT,
    media_caption TEXT,
    mood TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI profile settings table
CREATE TABLE ai_profile_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad settings table
CREATE TABLE ad_settings (
    id TEXT PRIMARY KEY DEFAULT 'default',
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI media assets table
CREATE TABLE ai_media_assets (
    id TEXT PRIMARY KEY DEFAULT 'default',
    assets JSONB NOT NULL DEFAULT '{"assets": []}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create daily activity log table
CREATE TABLE daily_activity_log (
    id BIGSERIAL PRIMARY KEY,
    user_pseudo_id TEXT NOT NULL,
    activity_date DATE NOT NULL,
    chat_id TEXT DEFAULT 'kruthika_chat',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_user_activity_per_day_per_chat UNIQUE (user_pseudo_id, activity_date, chat_id)
);

-- Create app configurations table (for backward compatibility)
CREATE TABLE app_configurations (
    id TEXT PRIMARY KEY,
    settings JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_messages_log_chat_id ON messages_log(chat_id);
CREATE INDEX idx_messages_log_created_at ON messages_log(created_at DESC);
CREATE INDEX idx_daily_activity_date ON daily_activity_log(activity_date);
CREATE INDEX idx_daily_activity_chat ON daily_activity_log(chat_id);

-- Enable Row Level Security
ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configurations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public access
CREATE POLICY "Allow public read access on messages_log" ON messages_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert on messages_log" ON messages_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on ai_profile_settings" ON ai_profile_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ai_profile_settings" ON ai_profile_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ai_profile_settings" ON ai_profile_settings FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on ad_settings" ON ad_settings FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ad_settings" ON ad_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ad_settings" ON ad_settings FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on ai_media_assets" ON ai_media_assets FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ai_media_assets" ON ai_media_assets FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ai_media_assets" ON ai_media_assets FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on daily_activity_log" ON daily_activity_log FOR SELECT USING (true);
CREATE POLICY "Allow public insert on daily_activity_log" ON daily_activity_log FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on app_configurations" ON app_configurations FOR SELECT USING (true);
CREATE POLICY "Allow public insert on app_configurations" ON app_configurations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on app_configurations" ON app_configurations FOR UPDATE USING (true);

-- Create helper functions
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
  GROUP BY dal.activity_date
  ORDER BY date ASC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_daily_message_counts(DATE) TO anon;
GRANT EXECUTE ON FUNCTION get_daily_active_user_counts(DATE) TO anon;

-- Insert default configurations
INSERT INTO ai_profile_settings (id, settings) 
VALUES ('default', '{
    "name": "Kruthika",
    "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "status": "🌸 Living my best life! Let'\''s chat! 🌸",
    "statusStoryText": "Ask me anything! 💬",
    "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
    "statusStoryHasUpdate": true
}') ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings;

INSERT INTO ad_settings (id, settings)
VALUES ('default', '{
    "adsEnabledGlobally": true,
    "adsterraDirectLink": "https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69",
    "adsterraDirectLinkEnabled": true,
    "adsterraBannerEnabled": false,
    "adsterraNativeBannerEnabled": false,
    "adsterraSocialBarEnabled": false,
    "adsterraPopunderEnabled": true,
    "adsterraPopunderCode": "<script type=\"text/javascript\">\\natOptions = {\\n\\t\"key\" : \"2dc1e58e3be02dd1e015a64b5d1d7d69\",\\n\\t\"format\" : \"iframe\",\\n\\t\"height\" : 50,\\n\\t\"width\" : 320,\\n\\t\"params\" : {}\\n};\\n</script>\\n<script type=\"text/javascript\" src=\"//www.highrevenuegate.com/2dc1e58e3be02dd1e015a64b5d1d7d69/invoke.js\"></script>",
    "monetagDirectLink": "https://www.profitablecpmgate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69",
    "monetagDirectLinkEnabled": false,
    "monetagBannerEnabled": false,
    "monetagNativeBannerEnabled": false,
    "monetagSocialBarEnabled": false,
    "monetagPopunderEnabled": false,
    "maxDirectLinkAdsPerDay": 6,
    "maxDirectLinkAdsPerSession": 3
}') ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings;

INSERT INTO ai_media_assets (id, assets)
VALUES ('default', '{
    "assets": [
        {
            "id": "img1",
            "type": "image",
            "url": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
            "description": "Profile photo"
        }
    ]
}') ON CONFLICT (id) DO UPDATE SET assets = EXCLUDED.assets;

-- For backward compatibility with app_configurations table
INSERT INTO app_configurations (id, settings)
VALUES ('ad_settings_kruthika_chat_v1', '{
    "adsEnabledGlobally": true,
    "adsterraDirectLink": "https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69",
    "adsterraDirectLinkEnabled": true,
    "maxDirectLinkAdsPerDay": 6,
    "maxDirectLinkAdsPerSession": 3
}') ON CONFLICT (id) DO UPDATE SET settings = EXCLUDED.settings;
