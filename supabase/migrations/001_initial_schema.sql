-- Kisloty Database Schema
-- Initial migration for MVP

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create enum types
create type time_frame_type as enum ('now', 'scheduled', 'someday');
create type activity_type as enum ('micro', 'hobby', 'bucket');
create type visibility_scope as enum ('private', 'friends', 'public');
create type activity_status as enum ('planned', 'in_progress', 'done');
create type friendship_status as enum ('pending', 'accepted', 'blocked');

-- =====================================================
-- PROFILES TABLE
-- =====================================================
create table profiles (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  display_name text not null,
  avatar_url text,
  city text,
  timezone text default 'UTC',
  onboarding_complete boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- ACTIVITY TEMPLATES TABLE
-- Pre-defined activity templates (micro-actions, hobbies, bucket items)
-- =====================================================
create table activity_templates (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  emoji text not null,
  type activity_type not null,
  is_active boolean default true,
  created_at timestamptz default now() not null
);

-- =====================================================
-- ACTIVITIES TABLE
-- User-created activities with flexible time framing
-- =====================================================
create table activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  template_id uuid references activity_templates(id) on delete set null,
  title text not null,
  description text,
  time_frame_type time_frame_type not null default 'now',
  scheduled_at timestamptz,
  duration_minutes integer,
  location text,
  visibility visibility_scope default 'friends',
  status activity_status default 'planned',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Constraints
  constraint scheduled_activities_must_have_time check (
    (time_frame_type = 'scheduled' and scheduled_at is not null) or
    (time_frame_type != 'scheduled')
  ),
  constraint scheduled_within_30_days check (
    (time_frame_type != 'scheduled') or
    (scheduled_at <= now() + interval '30 days')
  )
);

-- =====================================================
-- PREFERENCES TABLE
-- User preferences and onboarding data stored as JSONB
-- =====================================================
create table preferences (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  favorite_micro_actions jsonb default '[]'::jsonb,
  favorite_hobbies jsonb default '[]'::jsonb,
  time_preferences jsonb default '{}'::jsonb,
  bucket_list jsonb default '[]'::jsonb,
  typical_available_time text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- FRIENDSHIPS TABLE
-- Undirected friendship graph
-- =====================================================
create table friendships (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null,
  friend_id uuid references auth.users(id) on delete cascade not null,
  status friendship_status default 'pending',
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null,

  -- Prevent self-friendship
  constraint no_self_friendship check (user_id != friend_id),

  -- Ensure unique friendship pairs (undirected)
  constraint unique_friendship unique (least(user_id, friend_id), greatest(user_id, friend_id))
);

-- =====================================================
-- WEEKLY DIGEST SETTINGS TABLE
-- =====================================================
create table weekly_digest_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  enabled boolean default false,
  day_of_week integer check (day_of_week >= 0 and day_of_week <= 6),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
create index idx_profiles_user_id on profiles(user_id);
create index idx_activities_user_id on activities(user_id);
create index idx_activities_scheduled_at on activities(scheduled_at) where time_frame_type = 'scheduled';
create index idx_activities_time_frame_type on activities(time_frame_type);
create index idx_activities_visibility on activities(visibility);
create index idx_friendships_user_id on friendships(user_id);
create index idx_friendships_friend_id on friendships(friend_id);
create index idx_friendships_status on friendships(status);

-- =====================================================
-- UPDATED_AT TRIGGER FUNCTION
-- =====================================================
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at triggers
create trigger update_profiles_updated_at before update on profiles
  for each row execute function update_updated_at_column();

create trigger update_activities_updated_at before update on activities
  for each row execute function update_updated_at_column();

create trigger update_preferences_updated_at before update on preferences
  for each row execute function update_updated_at_column();

create trigger update_friendships_updated_at before update on friendships
  for each row execute function update_updated_at_column();

create trigger update_weekly_digest_settings_updated_at before update on weekly_digest_settings
  for each row execute function update_updated_at_column();

-- =====================================================
-- SEED ACTIVITY TEMPLATES
-- =====================================================
insert into activity_templates (label, emoji, type) values
  -- Micro actions
  ('Grab a coffee', '☕', 'micro'),
  ('Quick walk', '🚶', 'micro'),
  ('Read for 20 mins', '📖', 'micro'),
  ('Quick tidy', '🧹', 'micro'),
  ('Stretch break', '🧘', 'micro'),
  ('Call a friend', '📞', 'micro'),
  ('Write in journal', '📝', 'micro'),
  ('Listen to music', '🎵', 'micro'),

  -- Hobbies
  ('Cinema', '🎬', 'hobby'),
  ('Visit a market', '🛍️', 'hobby'),
  ('Go to the gym', '💪', 'hobby'),
  ('Yoga class', '🧘‍♀️', 'hobby'),
  ('Rock climbing', '🧗', 'hobby'),
  ('Pottery session', '🏺', 'hobby'),
  ('Cook something new', '👨‍🍳', 'hobby'),
  ('Visit a museum', '🏛️', 'hobby'),
  ('Board game night', '🎲', 'hobby'),
  ('Karaoke', '🎤', 'hobby'),
  ('Photography walk', '📷', 'hobby'),
  ('Dance class', '💃', 'hobby');
