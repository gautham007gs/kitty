
-- Drop the table if it exists to start fresh (optional, use with caution in production)
-- DROP TABLE IF EXISTS user_memories;

-- Create the user_memories table
CREATE TABLE IF NOT EXISTS user_memories (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  memories JSONB DEFAULT '{}'::jsonb,
  persona_narrative JSONB DEFAULT '{}'::jsonb,
  personality_profile JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to call the function before any update
DO
$$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_timestamp' AND tgrelid = 'user_memories'::regclass
  ) THEN
    CREATE TRIGGER set_timestamp
    BEFORE UPDATE ON user_memories
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_timestamp();
  END IF;
END
$$;

-- Add comments to explain the purpose of each column
COMMENT ON TABLE user_memories IS 'Stores long-term memories, narratives, and personality profiles for the AI for each user.';
COMMENT ON COLUMN user_memories.user_id IS 'The unique identifier for the user.';
COMMENT ON COLUMN user_memories.memories IS 'Stores key-value pairs of memories about the user (e.g., {"name": "Alex", "likes": "hiking"}).';
COMMENT ON COLUMN user_memories.persona_narrative IS 'Stores Kruthika''s ongoing life stories and state for this user (e.g., {"current_event": "feeling sad about a movie", "mentioned_friend": "Priya"}).';
COMMENT ON COLUMN user_memories.personality_profile IS 'Stores the AI''s analysis of the user''s personality (e.g., {"type": "flirty", "engagement_style": "asks_questions"}).';
