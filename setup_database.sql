
-- =============================================================================
-- COMPLETE SUPABASE DATABASE SETUP FOR VERTEX AI CHATBOT
-- =============================================================================
-- This file contains all necessary SQL commands to set up your Supabase database
-- Copy and paste each section into Supabase SQL Editor and run them in order
-- =============================================================================

-- STEP 1: Clean up existing tables (if needed)
-- =============================================================================
DROP TABLE IF EXISTS public.messages_log CASCADE;
DROP TABLE IF EXISTS public.daily_activity_log CASCADE;
DROP TABLE IF EXISTS public.app_configurations CASCADE;

-- STEP 2: Create messages_log table for chat message storage
-- =============================================================================
-- This stores all chat messages between users and AI
CREATE TABLE public.messages_log (
    id BIGSERIAL PRIMARY KEY,
    message_id TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
    chat_id TEXT NOT NULL DEFAULT 'kruthika_chat',
    user_id TEXT,
    message_content TEXT NOT NULL, -- Fixed: using message_content instead of text_content
    has_image BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_log_chat_id ON public.messages_log(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_created_at ON public.messages_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_log_user_id ON public.messages_log(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_sender_type ON public.messages_log(sender_type);

-- STEP 3: Create daily_activity_log table for user analytics
-- =============================================================================
-- This tracks daily active users for analytics
CREATE TABLE public.daily_activity_log (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    user_id TEXT,
    session_id TEXT,
    first_visit_timestamp TIMESTAMPTZ DEFAULT NOW(),
    last_visit_timestamp TIMESTAMPTZ DEFAULT NOW(),
    activity_count INTEGER DEFAULT 1,
    chat_id TEXT DEFAULT 'kruthika_chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_activity_per_day UNIQUE(date, user_id)
);

-- Create indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_daily_activity_date ON public.daily_activity_log(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_activity_user_id ON public.daily_activity_log(user_id);

-- STEP 4: Create app_configurations table for global settings
-- =============================================================================
-- This stores AI profile, ad settings, and other global configurations
CREATE TABLE public.app_configurations (
    id TEXT PRIMARY KEY,
    settings JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for settings lookup
CREATE INDEX IF NOT EXISTS idx_app_configurations_id ON public.app_configurations(id);

-- STEP 5: Enable Row Level Security (RLS)
-- =============================================================================
ALTER TABLE public.messages_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_configurations ENABLE ROW LEVEL SECURITY;

-- STEP 6: Create RLS policies for public access
-- =============================================================================
-- WARNING: These policies are permissive for development. Tighten for production!

-- Allow all operations on messages_log (for chat functionality)
CREATE POLICY "Allow all operations on messages_log" 
ON public.messages_log FOR ALL 
USING (true) 
WITH CHECK (true);

-- Allow all operations on daily_activity_log (for analytics)
CREATE POLICY "Allow all operations on daily_activity_log" 
ON public.daily_activity_log FOR ALL 
USING (true) 
WITH CHECK (true);

-- Allow all operations on app_configurations (for settings)
CREATE POLICY "Allow all operations on app_configurations" 
ON public.app_configurations FOR ALL 
USING (true) 
WITH CHECK (true);

-- STEP 7: Create stored functions for optimized operations
-- =============================================================================

-- Function to log daily activity with conflict resolution
CREATE OR REPLACE FUNCTION log_daily_activity(
    p_user_id TEXT DEFAULT NULL,
    p_session_id TEXT DEFAULT 'anonymous',
    p_chat_id TEXT DEFAULT 'kruthika_chat'
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    INSERT INTO public.daily_activity_log (
        date, 
        user_id, 
        session_id, 
        chat_id, 
        activity_count,
        first_visit_timestamp,
        last_visit_timestamp
    )
    VALUES (
        CURRENT_DATE, 
        p_user_id, 
        p_session_id, 
        p_chat_id, 
        1,
        NOW(),
        NOW()
    )
    ON CONFLICT (date, user_id)
    DO UPDATE SET 
        activity_count = daily_activity_log.activity_count + 1,
        last_visit_timestamp = NOW(),
        session_id = p_session_id;
END;
$$;

-- Function to get daily message counts for analytics
CREATE OR REPLACE FUNCTION get_daily_message_counts(start_date DATE)
RETURNS TABLE(date DATE, messages BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        DATE_TRUNC('day', ml.created_at AT TIME ZONE 'UTC')::DATE AS date,
        COUNT(ml.id) AS messages
    FROM public.messages_log ml
    WHERE (ml.created_at AT TIME ZONE 'UTC')::DATE >= start_date
    GROUP BY DATE_TRUNC('day', ml.created_at AT TIME ZONE 'UTC')
    ORDER BY date ASC;
END;
$$;

-- Function to get daily active user counts for analytics
CREATE OR REPLACE FUNCTION get_daily_active_user_counts(start_date DATE)
RETURNS TABLE(date DATE, active_users BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        dal.date AS date,
        COUNT(DISTINCT dal.user_id) AS active_users
    FROM public.daily_activity_log dal
    WHERE dal.date >= start_date
    GROUP BY dal.date
    ORDER BY date ASC;
END;
$$;

-- STEP 8: Grant permissions for functions
-- =============================================================================
GRANT EXECUTE ON FUNCTION log_daily_activity(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION get_daily_message_counts(DATE) TO anon;
GRANT EXECUTE ON FUNCTION get_daily_active_user_counts(DATE) TO anon;

-- STEP 9: Insert default configurations
-- =============================================================================

-- Insert default AI profile configuration
INSERT INTO public.app_configurations (id, settings) 
VALUES ('ai_profile', '{
  "name": "Kruthika",
  "status": "🌸 Living my best life! Let''s chat! 🌸",
  "avatarUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  "statusStoryText": "Ask me anything! 💬",
  "statusStoryImageUrl": "https://i.postimg.cc/52S3BZrM/images-10.jpg",
  "statusStoryHasUpdate": true
}') 
ON CONFLICT (id) DO UPDATE SET 
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- Insert default ad settings configuration
INSERT INTO public.app_configurations (id, settings) 
VALUES ('ad_settings_kruthika_chat_v1', '{
  "adsEnabledGlobally": true,
  "maxDirectLinkAdsPerDay": 6,
  "maxDirectLinkAdsPerSession": 3,
  "adsterraDirectLinkEnabled": true,
  "monetagDirectLinkEnabled": true,
  "adsterraDirectLink": "https://judicialphilosophical.com/zd46rhxy0?key=3dad0e700ddba4c8c8ace4396dd31e8a",
  "monetagDirectLink": "https://otieu.com/4/9403276",
  "adsterraBannerEnabled": true,
  "adsterraBannerCode": "<!-- Adsterra Banner: Replace with actual script -->",
  "adsterraNativeBannerEnabled": true,
  "adsterraNativeBannerCode": "<!-- Adsterra Native Banner: Replace with actual script -->",
  "adsterraSocialBarEnabled": false,
  "adsterraSocialBarCode": "<!-- Adsterra Social Bar: Replace with actual script -->",
  "adsterraPopunderEnabled": true,
  "adsterraPopunderCode": "<script type=\"text/javascript\">\n    atOptions = {\n        ''key'' : ''your-adsterra-key'',\n        ''format'' : ''iframe'',\n        ''height'' : 50,\n        ''width'' : 320,\n        ''params'' : {}\n    };\n    document.write(''<scr'' + ''ipt type=\"text/javascript\" src=\"//www.topcreativeformat.com/'' + atOptions.key + ''/invoke.js\"></scr'' + ''ipt>'');\n</script>",
  "monetagBannerEnabled": false,
  "monetagBannerCode": "<!-- Monetag Banner: Replace with actual script -->",
  "monetagNativeBannerEnabled": false,
  "monetagNativeBannerCode": "<!-- Monetag Native Banner: Replace with actual script -->",
  "monetagSocialBarEnabled": false,
  "monetagSocialBarCode": "<!-- Monetag Social Bar: Replace with actual script -->",
  "monetagPopunderEnabled": false,
  "monetagPopunderCode": "<!-- Monetag Popunder: Replace with actual script -->"
}') 
ON CONFLICT (id) DO UPDATE SET 
    settings = EXCLUDED.settings,
    updated_at = NOW();

-- STEP 10: Verify setup
-- =============================================================================
-- Run these queries to verify everything is working:

-- Check if all tables exist
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('messages_log', 'daily_activity_log', 'app_configurations');

-- Check if all functions exist
SELECT 
    routine_name, 
    routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name IN ('log_daily_activity', 'get_daily_message_counts', 'get_daily_active_user_counts');

-- Check if configurations are loaded
SELECT id, settings FROM public.app_configurations;

-- =============================================================================
-- SETUP COMPLETE!
-- =============================================================================
-- Your database is now ready for the Vertex AI chatbot application.
-- Make sure to update your environment variables in .env.local:
-- NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
-- NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
-- =============================================================================
