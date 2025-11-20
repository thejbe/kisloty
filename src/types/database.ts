// Supabase Database Types
// This file provides type-safe access to Supabase database

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          display_name: string
          avatar_url: string | null
          city: string | null
          timezone: string | null
          onboarding_complete: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          display_name: string
          avatar_url?: string | null
          city?: string | null
          timezone?: string | null
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          display_name?: string
          avatar_url?: string | null
          city?: string | null
          timezone?: string | null
          onboarding_complete?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      activity_templates: {
        Row: {
          id: string
          label: string
          emoji: string
          type: 'micro' | 'hobby' | 'bucket'
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          label: string
          emoji: string
          type: 'micro' | 'hobby' | 'bucket'
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          label?: string
          emoji?: string
          type?: 'micro' | 'hobby' | 'bucket'
          is_active?: boolean
          created_at?: string
        }
      }
      activities: {
        Row: {
          id: string
          user_id: string
          template_id: string | null
          title: string
          description: string | null
          time_frame_type: 'now' | 'scheduled' | 'someday'
          scheduled_at: string | null
          duration_minutes: number | null
          location: string | null
          visibility: 'private' | 'friends' | 'public'
          status: 'planned' | 'in_progress' | 'done'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id?: string | null
          title: string
          description?: string | null
          time_frame_type?: 'now' | 'scheduled' | 'someday'
          scheduled_at?: string | null
          duration_minutes?: number | null
          location?: string | null
          visibility?: 'private' | 'friends' | 'public'
          status?: 'planned' | 'in_progress' | 'done'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string | null
          title?: string
          description?: string | null
          time_frame_type?: 'now' | 'scheduled' | 'someday'
          scheduled_at?: string | null
          duration_minutes?: number | null
          location?: string | null
          visibility?: 'private' | 'friends' | 'public'
          status?: 'planned' | 'in_progress' | 'done'
          created_at?: string
          updated_at?: string
        }
      }
      preferences: {
        Row: {
          id: string
          user_id: string
          favorite_micro_actions: Json
          favorite_hobbies: Json
          time_preferences: Json
          bucket_list: Json
          typical_available_time: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          favorite_micro_actions?: Json
          favorite_hobbies?: Json
          time_preferences?: Json
          bucket_list?: Json
          typical_available_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          favorite_micro_actions?: Json
          favorite_hobbies?: Json
          time_preferences?: Json
          bucket_list?: Json
          typical_available_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
      }
      weekly_digest_settings: {
        Row: {
          id: string
          user_id: string
          enabled: boolean
          day_of_week: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          enabled?: boolean
          day_of_week?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          enabled?: boolean
          day_of_week?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
