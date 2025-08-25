-- Complete Supabase Database Setup with all required tables and columns

-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Drop existing tables if they exist (for clean setup)
drop table if exists public.messages_log cascade;
drop table if exists public.user_sessions cascade;
drop table if exists public.ai_profiles cascade;
drop table if exists public.app_configurations cascade;
drop table if exists public.ai_media_assets cascade;
drop table if exists public.global_statuses cascade;
drop table if exists public.ad_settings cascade;

-- Create messages_log table with ALL required columns
create table public.messages_log (
  id uuid default uuid_generate_v4() primary key,
  session_id text not null,
  user_message text,
  ai_response text,
  sender_type text not null check (sender_type in ('user', 'ai')),
  text_content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  timestamp timestamp with time zone default timezone('utc'::text, now()) not null, -- Add this missing column
  metadata jsonb default '{}'::jsonb
);

-- Create user_sessions table
create table public.user_sessions (
  id uuid default uuid_generate_v4() primary key,
  session_id text unique not null,
  user_preferences jsonb default '{}'::jsonb,
  last_active timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create ai_profiles table
create table public.ai_profiles (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  avatar_url text,
  status text,
  status_story_text text,
  status_story_image_url text,
  status_story_has_update boolean default false,
  personality_config jsonb default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create app_configurations table
create table public.app_configurations (
  id uuid default uuid_generate_v4() primary key,
  key text unique not null,
  settings jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create ai_media_assets table
create table public.ai_media_assets (
  id uuid default uuid_generate_v4() primary key,
  asset_type text not null,
  asset_url text not null,
  metadata jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create global_statuses table
create table public.global_statuses (
  id uuid default uuid_generate_v4() primary key,
  status_text text not null,
  status_image_url text,
  is_active boolean default true,
  priority integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create ad_settings table
create table public.ad_settings (
  id uuid default uuid_generate_v4() primary key,
  setting_key text unique not null,
  setting_value jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create indexes for better performance
create index idx_messages_log_session_id on public.messages_log(session_id);
create index idx_messages_log_created_at on public.messages_log(created_at);
create index idx_messages_log_timestamp on public.messages_log(timestamp);
create index idx_user_sessions_session_id on public.user_sessions(session_id);
create index idx_app_configurations_key on public.app_configurations(key);

-- Enable Row Level Security (RLS)
alter table public.messages_log enable row level security;
alter table public.user_sessions enable row level security;
alter table public.ai_profiles enable row level security;
alter table public.app_configurations enable row level security;
alter table public.ai_media_assets enable row level security;
alter table public.global_statuses enable row level security;
alter table public.ad_settings enable row level security;

-- Create policies for public access (since this is a demo app)
create policy "Public access for messages_log" on public.messages_log for all using (true);
create policy "Public access for user_sessions" on public.user_sessions for all using (true);
create policy "Public access for ai_profiles" on public.ai_profiles for all using (true);
create policy "Public access for app_configurations" on public.app_configurations for all using (true);
create policy "Public access for ai_media_assets" on public.ai_media_assets for all using (true);
create policy "Public access for global_statuses" on public.global_statuses for all using (true);
create policy "Public access for ad_settings" on public.ad_settings for all using (true);

-- Insert default data
insert into public.ai_profiles (name, avatar_url, status, status_story_text, status_story_image_url, status_story_has_update)
values (
  'Kruthika',
  'https://i.postimg.cc/52S3BZrM/images-10.jpg',
  '🌸 Tumse baat karne ka wait kar rahi hun! Let''s chat! 🌸',
  'Ask me anything! 💬 Main hamesha available hun!',
  'https://i.postimg.cc/52S3BZrM/images-10.jpg',
  true
);

insert into public.app_configurations (key, settings)
values (
  'settings',
  '{
    "ai_personality": "friendly_indian_girl",
    "response_style": "hinglish",
    "max_conversation_length": 50,
    "cost_optimization": true
  }'::jsonb
);

-- Insert default ad settings
insert into public.ad_settings (setting_key, setting_value)
values
  ('adsterra_popunder_enabled', 'true'::jsonb),
  ('monetag_popunder_enabled', 'false'::jsonb),
  ('adsterra_link', '"https://www.highrevenuegate.com/p8ks4fn2?key=2dc1e58e3be02dd1e015a64b5d1d7d69"'::jsonb),
  ('monetag_link', '""'::jsonb);

-- Grant permissions
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all privileges on all tables in schema public to postgres, anon, authenticated, service_role;
grant all privileges on all sequences in schema public to postgres, anon, authenticated, service_role;

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Add triggers for updated_at
create trigger update_ai_profiles_updated_at before update on public.ai_profiles for each row execute function update_updated_at_column();
create trigger update_app_configurations_updated_at before update on public.app_configurations for each row execute function update_updated_at_column();
create trigger update_ad_settings_updated_at before update on public.ad_settings for each row execute function update_updated_at_column();

-- Success message
select 'Database setup completed successfully!' as result;