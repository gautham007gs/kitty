
-- Fix database schema issues
-- First, check if messages_log table exists and fix column names
DO $$
BEGIN
    -- Check if messages_log table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'messages_log') THEN
        -- Check if message_content column exists, if not rename or add it
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'message_content') THEN
            -- Try to rename existing message column to message_content
            IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'message') THEN
                ALTER TABLE messages_log RENAME COLUMN message TO message_content;
            ELSE
                -- Add the missing column
                ALTER TABLE messages_log ADD COLUMN message_content TEXT;
            END IF;
        END IF;
        
        -- Ensure user_id column exists
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'user_id') THEN
            ALTER TABLE messages_log ADD COLUMN user_id TEXT;
        END IF;
        
        -- Add message status columns for read receipts
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'is_delivered') THEN
            ALTER TABLE messages_log ADD COLUMN is_delivered BOOLEAN DEFAULT TRUE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'is_read') THEN
            ALTER TABLE messages_log ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
        END IF;
        
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'messages_log' AND column_name = 'read_at') THEN
            ALTER TABLE messages_log ADD COLUMN read_at TIMESTAMP;
        END IF;
        
    ELSE
        -- Create messages_log table if it doesn't exist
        CREATE TABLE messages_log (
            id BIGSERIAL PRIMARY KEY,
            user_id TEXT,
            message_content TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            is_delivered BOOLEAN DEFAULT TRUE,
            is_read BOOLEAN DEFAULT FALSE,
            read_at TIMESTAMP,
            session_id TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create index for better performance
        CREATE INDEX IF NOT EXISTS idx_messages_log_user_id ON messages_log(user_id);
        CREATE INDEX IF NOT EXISTS idx_messages_log_timestamp ON messages_log(timestamp);
    END IF;
END
$$;

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
