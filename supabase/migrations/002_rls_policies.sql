-- Row Level Security Policies for Kisloty

-- =====================================================
-- PROFILES RLS
-- =====================================================
alter table profiles enable row level security;

-- Users can read all profiles (needed for displaying friend activities)
create policy "Profiles are viewable by authenticated users"
  on profiles for select
  to authenticated
  using (true);

-- Users can insert their own profile
create policy "Users can insert their own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own profile
create policy "Users can update their own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- ACTIVITY TEMPLATES RLS
-- =====================================================
alter table activity_templates enable row level security;

-- Everyone can read active templates
create policy "Active templates are viewable by authenticated users"
  on activity_templates for select
  to authenticated
  using (is_active = true);

-- =====================================================
-- ACTIVITIES RLS
-- =====================================================
alter table activities enable row level security;

-- Users can read their own activities
create policy "Users can view their own activities"
  on activities for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can read activities from their friends (if visibility is 'friends')
create policy "Users can view friends' activities"
  on activities for select
  to authenticated
  using (
    visibility = 'friends' and
    exists (
      select 1 from friendships
      where status = 'accepted'
        and (
          (friendships.user_id = auth.uid() and friendships.friend_id = activities.user_id) or
          (friendships.friend_id = auth.uid() and friendships.user_id = activities.user_id)
        )
    )
  );

-- Users can read public activities
create policy "Users can view public activities"
  on activities for select
  to authenticated
  using (visibility = 'public');

-- Users can insert their own activities
create policy "Users can insert their own activities"
  on activities for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own activities
create policy "Users can update their own activities"
  on activities for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Users can delete their own activities
create policy "Users can delete their own activities"
  on activities for delete
  to authenticated
  using (auth.uid() = user_id);

-- =====================================================
-- PREFERENCES RLS
-- =====================================================
alter table preferences enable row level security;

-- Users can read their own preferences
create policy "Users can view their own preferences"
  on preferences for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can insert their own preferences
create policy "Users can insert their own preferences"
  on preferences for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own preferences
create policy "Users can update their own preferences"
  on preferences for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =====================================================
-- FRIENDSHIPS RLS
-- =====================================================
alter table friendships enable row level security;

-- Users can read friendships where they are involved
create policy "Users can view their own friendships"
  on friendships for select
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- Users can create friendships where they are the initiator
create policy "Users can create friendships"
  on friendships for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update friendships where they are involved
create policy "Users can update their friendships"
  on friendships for update
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id)
  with check (auth.uid() = user_id or auth.uid() = friend_id);

-- Users can delete friendships where they are involved
create policy "Users can delete their friendships"
  on friendships for delete
  to authenticated
  using (auth.uid() = user_id or auth.uid() = friend_id);

-- =====================================================
-- WEEKLY DIGEST SETTINGS RLS
-- =====================================================
alter table weekly_digest_settings enable row level security;

-- Users can read their own digest settings
create policy "Users can view their own digest settings"
  on weekly_digest_settings for select
  to authenticated
  using (auth.uid() = user_id);

-- Users can insert their own digest settings
create policy "Users can insert their own digest settings"
  on weekly_digest_settings for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can update their own digest settings
create policy "Users can update their own digest settings"
  on weekly_digest_settings for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
