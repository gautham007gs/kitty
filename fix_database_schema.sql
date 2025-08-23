-- Drop and recreate messages_log table with correct schema
DROP TABLE IF EXISTS messages_log;

CREATE TABLE messages_log (
    id BIGSERIAL PRIMARY KEY,
    message_id TEXT NOT NULL,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'ai')),
    chat_id TEXT NOT NULL DEFAULT 'kruthika_chat',
    user_id TEXT,
    text_content TEXT,
    has_image BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_log_chat_id ON messages_log(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_log_created_at ON messages_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_log_user_id ON messages_log(user_id);

-- Create app_configurations table if it doesn't exist
CREATE TABLE IF NOT EXISTS app_configurations (
    id TEXT PRIMARY KEY,
    settings JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create analytics_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS analytics_data (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data JSONB,
    user_id TEXT,
    session_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics_data(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_data(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_data(user_id);