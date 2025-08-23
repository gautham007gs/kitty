-- Complete database setup for Maya Chat Application
-- Run this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
DROP TABLE IF EXISTS messages_log CASCADE;
DROP TABLE IF EXISTS ai_profile_settings CASCADE;
DROP TABLE IF EXISTS ad_settings CASCADE;
DROP TABLE IF EXISTS ai_media_assets CASCADE;

-- Create messages_log table with correct column name
CREATE TABLE messages_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_id TEXT NOT NULL DEFAULT 'default',
    sender TEXT NOT NULL CHECK (sender IN ('user', 'ai')),
    message_content TEXT NOT NULL, -- Correct column name
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
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ad settings table
CREATE TABLE ad_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI media assets table
CREATE TABLE ai_media_assets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    assets JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_log_chat_id ON messages_log(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_created_at ON messages_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_log_sender ON messages_log(sender);
CREATE INDEX IF NOT EXISTS idx_messages_log_message_type ON messages_log(message_type);

-- Create triggers for updated_at
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

-- Insert default AI profile
INSERT INTO ai_profile_settings (settings) VALUES (
    '{
        "name": "Kruthika",
        "status": "🌸 Living my best life! Let'\''s chat! 🌸",
        "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
        "statusStoryText": "Ask me anything! 💬",
        "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
        "statusStoryHasUpdate": true
    }'::jsonb
);

-- Insert default ad settings
INSERT INTO ad_settings (settings) VALUES (
    '{
        "adsEnabledGlobally": true,
        "showAdsAfterMessageCount": 8,
        "adDisplayDurationMs": 5000,
        "popunderCooldownHours": 24,
        "adsterraPopunderEnabled": true,
        "monetagPopunderEnabled": false,
        "adsterraDirectLinkEnabled": true,
        "monetagDirectLinkEnabled": false,
        "bannerAdsEnabled": true,
        "socialBarAdsEnabled": true
    }'::jsonb
);

-- Insert default media assets
INSERT INTO ai_media_assets (assets) VALUES (
    '{
        "availableImages": [
            "https://i.postimg.cc/mZjVmd9c/IMG-20250607-102955.jpg",
            "https://i.postimg.cc/52S3BZrM/images-10.jpg"
        ],
        "availableAudio": [
            "/media/laugh.mp3",
            "/media/song.mp3"
        ]
    }'::jsonb
);

-- Enable Row Level Security (RLS) - Optional for security
ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_media_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed)
CREATE POLICY "Enable read access for all users" ON messages_log FOR SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON messages_log FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON messages_log FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON ai_profile_settings FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON ai_profile_settings FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON ad_settings FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON ad_settings FOR UPDATE USING (true);

CREATE POLICY "Enable read access for all users" ON ai_media_assets FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON ai_media_assets FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT ALL ON messages_log TO anon, authenticated;
GRANT ALL ON ai_profile_settings TO anon, authenticated;
GRANT ALL ON ad_settings TO anon, authenticated;
GRANT ALL ON ai_media_assets TO anon, authenticated;

-- Success message
SELECT 'Database setup completed successfully! All tables created with proper schema.' as result;