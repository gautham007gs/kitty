
-- Create admin user and set up RLS policies
-- Run this in your Supabase SQL Editor

-- First, ensure the admin user exists in auth.users
-- This should be done through Supabase Dashboard > Authentication > Users
-- Add user: gamingguruji095@gmail.com with password: root007

-- Set up RLS policies for admin access
ALTER TABLE app_configurations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow admin full access" ON app_configurations;
DROP POLICY IF EXISTS "Allow public read access" ON app_configurations;

-- Create new policies
CREATE POLICY "Allow public read access" ON app_configurations
  FOR SELECT USING (true);

CREATE POLICY "Allow admin full access" ON app_configurations
  FOR ALL USING (
    auth.uid() IN (
      SELECT id FROM auth.users 
      WHERE email = 'gamingguruji095@gmail.com'
    )
  );

-- Ensure tables exist
CREATE TABLE IF NOT EXISTS app_configurations (
  id TEXT PRIMARY KEY,
  settings JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_configurations_id ON app_configurations(id);
CREATE INDEX IF NOT EXISTS idx_app_configurations_updated_at ON app_configurations(updated_at);
