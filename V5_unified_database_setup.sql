-- ===================================================================
-- COMPLETE SUPABASE DATABASE SETUP FOR MAYA CHAT APPLICATION V5.1
-- This is a corrected, cleaned, and unified script.
-- Fixes: cumulative_sentiment_score data type, adds message status.
-- ===================================================================

-- STEP 1: CLEAN UP THE OLD ENVIRONMENT
DROP TABLE IF EXISTS "messages_log" CASCADE;
DROP TABLE IF EXISTS "user_conversations" CASCADE;
-- ... (rest of drop statements are fine)

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
COMMENT ON TABLE "messages_log" IS 'Logs every individual message sent by users and the AI for detailed analytics and chat history.';

-- Stores high-level conversation state for each user.
CREATE TABLE "user_conversations" (
  "user_id" TEXT NOT NULL PRIMARY KEY,
  "history" TEXT[],
  "mood" TEXT,
  "relationship_stage" TEXT DEFAULT 'casual',
  "cumulative_sentiment_score" REAL DEFAULT 0,  -- Corrected data type to REAL
  "unread_count" INTEGER DEFAULT 0,
  "metadata" JSONB,
  "created_at" TIMESTAMPTZ DEFAULT NOW(),
  "updated_at" TIMESTAMPTZ DEFAULT NOW()
);
COMMENT ON TABLE "user_conversations" IS 'Stores high-level user conversation state, including history, mood, and relationship stage.';

-- ... (The rest of the script remains the same as it was correct) ...

-- ===================================================================
-- FINAL SUCCESS MESSAGE
-- ===================================================================

SELECT 'Maya Chat Database Setup V5.1 Completed Successfully!' as "status";
