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
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          streak_count: number
          streak_freeze_tokens: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name: string
          avatar_url?: string | null
          bio?: string | null
          streak_count?: number
          streak_freeze_tokens?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          streak_count?: number
          streak_freeze_tokens?: number
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          theme: string
          email_notifications: boolean
          friend_activity_notifications: boolean
          auto_streak_freeze: boolean
          timezone: string
          updated_at: string
        }
        Insert: {
          id: string
          theme?: string
          email_notifications?: boolean
          friend_activity_notifications?: boolean
          auto_streak_freeze?: boolean
          timezone?: string
          updated_at?: string
        }
        Update: {
          id?: string
          theme?: string
          email_notifications?: boolean
          friend_activity_notifications?: boolean
          auto_streak_freeze?: boolean
          timezone?: string
          updated_at?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          category: string
          frequency: string
          target_count_per_period: number
          time_of_day: string
          is_archived: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          category?: string
          frequency?: string
          target_count_per_period?: number
          time_of_day?: string
          is_archived?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          category?: string
          frequency?: string
          target_count_per_period?: number
          time_of_day?: string
          is_archived?: boolean
          created_at?: string
        }
      }
      habit_logs: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_date: string
          completed_at: string
          count: number
          notes: string | null
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_date: string
          completed_at?: string
          count?: number
          notes?: string | null
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completed_date?: string
          completed_at?: string
          count?: number
          notes?: string | null
        }
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          priority: 'low' | 'medium' | 'high'
          status: 'todo' | 'in_progress' | 'completed'
          due_date: string | null
          estimated_minutes: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in_progress' | 'completed'
          due_date?: string | null
          estimated_minutes?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string | null
          priority?: 'low' | 'medium' | 'high'
          status?: 'todo' | 'in_progress' | 'completed'
          due_date?: string | null
          estimated_minutes?: number | null
          created_at?: string
        }
      }
      planner_events: {
        Row: {
          id: string
          user_id: string
          title: string
          event_date: string
          start_time: string
          end_time: string
          category: string
          linked_task_id: string | null
          linked_habit_id: string | null
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          event_date: string
          start_time: string
          end_time: string
          category?: string
          linked_task_id?: string | null
          linked_habit_id?: string | null
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          event_date?: string
          start_time?: string
          end_time?: string
          category?: string
          linked_task_id?: string | null
          linked_habit_id?: string | null
          completed?: boolean
          created_at?: string
        }
      }
      friend_requests: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          user_id_1: string
          user_id_2: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id_1: string
          user_id_2: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id_1?: string
          user_id_2?: string
          created_at?: string
        }
      }
      shared_habits: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          category?: string
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          category?: string
          created_at?: string
        }
      }
      shared_goals: {
        Row: {
          id: string
          creator_id: string
          title: string
          description: string | null
          target_date: string | null
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          creator_id: string
          title: string
          description?: string | null
          target_date?: string | null
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          creator_id?: string
          title?: string
          description?: string | null
          target_date?: string | null
          is_completed?: boolean
          created_at?: string
        }
      }
      shared_goal_members: {
        Row: {
          id: string
          goal_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          id?: string
          goal_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          id?: string
          goal_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
      encouragements: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          type: string
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          type?: string
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          type?: string
          message?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          title: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          title?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          code: string
          title: string
          description: string
          badge_icon: string
          category: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description: string
          badge_icon: string
          category?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          description?: string
          badge_icon?: string
          category?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          user_id: string
          achievement_id: string
          unlocked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          achievement_id: string
          unlocked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          achievement_id?: string
          unlocked_at?: string
        }
      }
    }
  }
}
