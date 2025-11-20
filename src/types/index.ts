// Domain types for Kisloty

export type TimeFrameType = 'now' | 'scheduled' | 'someday'

export type ActivityType = 'micro' | 'hobby' | 'bucket'

export type VisibilityScope = 'private' | 'friends' | 'public'

export type ActivityStatus = 'planned' | 'in_progress' | 'done'

export type FriendshipStatus = 'pending' | 'accepted' | 'blocked'

export interface Profile {
  id: string
  user_id: string
  display_name: string
  avatar_url?: string
  city?: string
  timezone?: string
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface ActivityTemplate {
  id: string
  label: string
  emoji: string
  type: ActivityType
  is_active: boolean
  created_at: string
}

export interface Activity {
  id: string
  user_id: string
  template_id?: string
  title: string
  description?: string
  time_frame_type: TimeFrameType
  scheduled_at?: string
  duration_minutes?: number
  location?: string
  visibility: VisibilityScope
  status: ActivityStatus
  created_at: string
  updated_at: string
}

export interface Preferences {
  id: string
  user_id: string
  favorite_micro_actions: string[]
  favorite_hobbies: string[]
  time_preferences: {
    weekday_evenings?: boolean
    weekends?: boolean
    mornings?: boolean
    afternoons?: boolean
    evenings?: boolean
  }
  bucket_list: string[]
  typical_available_time?: '10-20' | '30-60' | '60-120'
  created_at: string
  updated_at: string
}

export interface Friendship {
  id: string
  user_id: string
  friend_id: string
  status: FriendshipStatus
  created_at: string
  updated_at: string
}

export interface WeeklyDigestSettings {
  id: string
  user_id: string
  enabled: boolean
  day_of_week?: number // 0-6, Sunday = 0
  created_at: string
  updated_at: string
}

// Extended types with relations
export interface ActivityWithProfile extends Activity {
  profile?: Profile
  template?: ActivityTemplate
}

export interface SuggestionTile {
  id: string
  type: 'suggestion'
  title: string
  category: string
  templateId?: string
}
