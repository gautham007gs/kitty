-- Fix messages_log table schema to match application expectations
DO $$ 
BEGIN
    -- Check if messages_log table exists and fix column names
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages_log') THEN
        -- Add missing columns if they don't exist
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'message_content') THEN
            ALTER TABLE messages_log ADD COLUMN message_content TEXT;
        END IF;

        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'user_id') THEN
            ALTER TABLE messages_log ADD COLUMN user_id TEXT;
        END IF;

        -- Update existing content column to message_content if needed
        IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'content') 
           AND NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'message_content') THEN
            ALTER TABLE messages_log RENAME COLUMN content TO message_content;
        END IF;

        RAISE NOTICE 'messages_log table schema updated successfully';
    ELSE
        -- Create the table with correct schema
        CREATE TABLE messages_log (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id TEXT,
            session_id TEXT,
            message_content TEXT NOT NULL,
            sender_type TEXT CHECK (sender_type IN ('user', 'ai')) NOT NULL,
            has_image BOOLEAN DEFAULT false,
            tokens_used INTEGER DEFAULT 0,
            response_time_ms INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );

        -- Enable RLS
        ALTER TABLE messages_log ENABLE ROW LEVEL SECURITY;

        -- Create policy for public access
        CREATE POLICY "Allow public access to messages_log" ON messages_log
            FOR ALL USING (true);

        RAISE NOTICE 'messages_log table created successfully';
    END IF;
END $$;

-- Ensure proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_log_user_id ON messages_log(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_session_id ON messages_log(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_created_at ON messages_log(created_at);

-- Update existing ad settings to ensure they're properly configured
INSERT INTO public.app_configurations (id, settings) 
VALUES ('ad_settings', '{
  "adsEnabledGlobally": true,
  "maxDirectLinkAdsPerDay": 6,
  "maxDirectLinkAdsPerSession": 3,
  "adsterraDirectLinkEnabled": true,
  "monetagDirectLinkEnabled": true,
  "adsterraDirectLink": "https://www.highrevenuegate.com/direct/link",
  "monetagDirectLink": "https://www.monetag.com/direct/link",
  "adsterraBannerEnabled": true,
  "adsterraBannerCode": "<!-- Your Adsterra Banner Code Here -->",
  "adsterraNativeBannerEnabled": true,
  "adsterraNativeBannerCode": "<!-- Your Adsterra Native Banner Code Here -->",
  "adsterraPopunderEnabled": true,
  "adsterraPopunderCode": "<!-- Your Adsterra Popunder Code Here -->",
  "monetagBannerEnabled": true,
  "monetagBannerCode": "<!-- Your Monetag Banner Code Here -->",
  "monetagNativeBannerEnabled": true,
  "monetagNativeBannerCode": "<!-- Your Monetag Native Banner Code Here -->",
  "monetagPopunderEnabled": true,
  "monetagPopunderCode": "<!-- Your Monetag Popunder Code Here -->"
}') ON CONFLICT (id) DO UPDATE SET 
settings = EXCLUDED.settings;