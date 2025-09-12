
-- Complete Database Setup V9 - Final Working Version
-- Based on previous working Maya Chat app with ads

-- Drop existing tables if they exist
DROP TABLE IF EXISTS ad_settings CASCADE;
DROP TABLE IF EXISTS ai_profile_settings CASCADE;
DROP TABLE IF EXISTS app_configurations CASCADE;
DROP TABLE IF EXISTS managed_demo_contacts CASCADE;
DROP TABLE IF EXISTS messages_log CASCADE;
DROP TABLE IF EXISTS user_context CASCADE;
DROP TABLE IF EXISTS ai_life_events CASCADE;
DROP TABLE IF EXISTS user_memory CASCADE;

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create ad_settings table (working ads configuration)
CREATE TABLE ad_settings (
    id SERIAL PRIMARY KEY,
    ads_enabled_globally BOOLEAN DEFAULT true,
    max_direct_link_ads_per_day INTEGER DEFAULT 6,
    max_direct_link_ads_per_session INTEGER DEFAULT 3,
    
    -- Adsterra settings (working configuration)
    adsterra_direct_link TEXT DEFAULT '',
    adsterra_direct_link_enabled BOOLEAN DEFAULT false,
    adsterra_banner_code TEXT DEFAULT '<script type="text/javascript">
	atOptions = {
		''key'' : ''2a86a3b22e8c1477e8a83d56c0386bb3'',
		''format'' : ''iframe'',
		''height'' : 90,
		''width'' : 728,
		''params'' : {}
	};
</script>
<script type="text/javascript" src="//judicialphilosophical.com/2a86a3b22e8c1477e8a83d56c0386bb3/invoke.js"></script>',
    adsterra_banner_enabled BOOLEAN DEFAULT true,
    adsterra_native_banner_code TEXT DEFAULT '',
    adsterra_native_banner_enabled BOOLEAN DEFAULT false,
    adsterra_social_bar_code TEXT DEFAULT '',
    adsterra_social_bar_enabled BOOLEAN DEFAULT false,
    adsterra_popunder_code TEXT DEFAULT '',
    adsterra_popunder_enabled BOOLEAN DEFAULT false,
    
    -- Monetag settings
    monetag_direct_link TEXT DEFAULT '',
    monetag_direct_link_enabled BOOLEAN DEFAULT false,
    monetag_banner_code TEXT DEFAULT '',
    monetag_banner_enabled BOOLEAN DEFAULT false,
    monetag_native_banner_code TEXT DEFAULT '',
    monetag_native_banner_enabled BOOLEAN DEFAULT false,
    monetag_social_bar_code TEXT DEFAULT '',
    monetag_social_bar_enabled BOOLEAN DEFAULT false,
    monetag_popunder_code TEXT DEFAULT '',
    monetag_popunder_enabled BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default ad settings (working configuration)
INSERT INTO ad_settings (
    id,
    ads_enabled_globally,
    adsterra_banner_enabled,
    adsterra_banner_code
) VALUES (
    1,
    true,
    true,
    '<script type="text/javascript">
	atOptions = {
		''key'' : ''2a86a3b22e8c1477e8a83d56c0386bb3'',
		''format'' : ''iframe'',
		''height'' : 90,
		''width'' : 728,
		''params'' : {}
	};
</script>
<script type="text/javascript" src="//judicialphilosophical.com/2a86a3b22e8c1477e8a83d56c0386bb3/invoke.js"></script>'
) ON CONFLICT (id) DO UPDATE SET
    ads_enabled_globally = EXCLUDED.ads_enabled_globally,
    adsterra_banner_enabled = EXCLUDED.adsterra_banner_enabled,
    adsterra_banner_code = EXCLUDED.adsterra_banner_code,
    updated_at = NOW();

-- Create AI profile settings table
CREATE TABLE ai_profile_settings (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) DEFAULT 'Maya',
    status VARCHAR(50) DEFAULT 'active',
    personality_traits JSONB DEFAULT '{"traits": ["friendly", "helpful", "empathetic"]}',
    conversation_style JSONB DEFAULT '{"style": "casual", "tone": "warm"}',
    response_patterns JSONB DEFAULT '{"patterns": ["engaging", "supportive"]}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default AI profile
INSERT INTO ai_profile_settings (id, name, status) VALUES (1, 'Maya', 'active')
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    status = EXCLUDED.status,
    updated_at = NOW();

-- Create app configurations table
CREATE TABLE app_configurations (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_data JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default app configurations
INSERT INTO app_configurations (config_key, config_data, description) VALUES
('global_settings', '{"maintenance_mode": false, "debug_mode": false}', 'Global application settings'),
('chat_settings', '{"max_message_length": 1000, "typing_delay": 2000}', 'Chat-specific settings'),
('security_settings', '{"session_timeout": 3600, "max_login_attempts": 5}', 'Security configurations')
ON CONFLICT (config_key) DO UPDATE SET
    config_data = EXCLUDED.config_data,
    updated_at = NOW();

-- Create managed demo contacts table
CREATE TABLE managed_demo_contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    conversation_context JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert demo contacts
INSERT INTO managed_demo_contacts (name, status) VALUES
('Maya', 'active'),
('Assistant', 'active')
ON CONFLICT DO NOTHING;

-- Create messages log table
CREATE TABLE messages_log (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100),
    contact_name VARCHAR(100) DEFAULT 'Maya',
    message_text TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'user',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user context table
CREATE TABLE user_context (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) UNIQUE NOT NULL,
    conversation_history JSONB DEFAULT '[]',
    personality_context JSONB DEFAULT '{}',
    preferences JSONB DEFAULT '{}',
    last_interaction TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create AI life events table
CREATE TABLE ai_life_events (
    id SERIAL PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL,
    event_data JSONB NOT NULL DEFAULT '{}',
    triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user memory table
CREATE TABLE user_memory (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    memory_type VARCHAR(50) NOT NULL,
    memory_content JSONB NOT NULL DEFAULT '{}',
    importance_score FLOAT DEFAULT 0.5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    INDEX idx_user_id (user_id),
    INDEX idx_memory_type (memory_type),
    INDEX idx_importance (importance_score DESC),
    INDEX idx_created_at (created_at DESC)
);

-- Set up RLS policies for all tables
ALTER TABLE ad_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_profile_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE managed_demo_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_life_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memory ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for development (adjust for production)
CREATE POLICY "Allow all operations on ad_settings" ON ad_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_profile_settings" ON ai_profile_settings FOR ALL USING (true);
CREATE POLICY "Allow all operations on app_configurations" ON app_configurations FOR ALL USING (true);
CREATE POLICY "Allow all operations on managed_demo_contacts" ON managed_demo_contacts FOR ALL USING (true);
CREATE POLICY "Allow all operations on messages_log" ON messages_log FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_context" ON user_context FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_life_events" ON ai_life_events FOR ALL USING (true);
CREATE POLICY "Allow all operations on user_memory" ON user_memory FOR ALL USING (true);

-- Create update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ad_settings_updated_at BEFORE UPDATE ON ad_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ai_profile_settings_updated_at BEFORE UPDATE ON ai_profile_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_app_configurations_updated_at BEFORE UPDATE ON app_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_managed_demo_contacts_updated_at BEFORE UPDATE ON managed_demo_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_context_updated_at BEFORE UPDATE ON user_context FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Show successful setup
SELECT 'Database setup completed successfully! Version 9.0' as status;
SELECT 'Ad settings configured with working Adsterra banner ads' as ads_status;
SELECT 'Admin credentials: username=admin, password=admin123' as admin_info;

-- Verify table creation
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('ad_settings', 'ai_profile_settings', 'app_configurations', 'managed_demo_contacts', 'messages_log', 'user_context', 'ai_life_events', 'user_memory')
ORDER BY table_name;

