
-- Filename: upgrade_user_context.sql
-- Description: Adds relationship and streak tracking features to the user context table.

-- It's safer to alter the table than to drop and recreate it.
-- This ensures that no existing user data is lost.

-- Add relationship_level to track the user's bond with the AI
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='chat_contexts' AND column_name='relationship_level') THEN
    ALTER TABLE chat_contexts ADD COLUMN relationship_level TEXT DEFAULT 'new_user';
  END IF;
END $$;

-- Add chat_streak to track consecutive days of chatting
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='chat_contexts' AND column_name='chat_streak') THEN
    ALTER TABLE chat_contexts ADD COLUMN chat_streak INT DEFAULT 0;
  END IF;
END $$;

-- Add last_chat_date to know when the last conversation happened
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='chat_contexts' AND column_name='last_chat_date') THEN
    ALTER TABLE chat_contexts ADD COLUMN last_chat_date DATE;
  END IF;
END $$;

-- Add nickname for the user, given by the AI to build bonds
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name='chat_contexts' AND column_name='nickname') THEN
    ALTER TABLE chat_contexts ADD COLUMN nickname TEXT;
  END IF;
END $$;

COMMENT ON COLUMN chat_contexts.relationship_level IS 'Tracks the bond progression (e.g., new_user, familiar, attached, bestie).';
COMMENT ON COLUMN chat_contexts.chat_streak IS 'Counts consecutive days of interaction to build a daily habit.';
COMMENT ON COLUMN chat_contexts.last_chat_date IS 'The date of the last message to calculate the streak.';
COMMENT ON COLUMN chat_contexts.nickname IS 'A special name for the user, assigned by the AI to strengthen the bond.';

-- Note: Please run this script in your Supabase SQL Editor to safely update your table.
