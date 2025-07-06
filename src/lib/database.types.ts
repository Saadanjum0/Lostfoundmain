export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_actions: {
        Row: {
          id: string
          admin_id: string
          action: 'approve_item' | 'reject_item' | 'ban_user' | 'unban_user' | 'delete_item' | 'delete_message' | 'resolve_item'
          target_type: string
          target_id: string
          reason: string | null
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: 'approve_item' | 'reject_item' | 'ban_user' | 'unban_user' | 'delete_item' | 'delete_message' | 'resolve_item'
          target_type: string
          target_id: string
          reason?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: 'approve_item' | 'reject_item' | 'ban_user' | 'unban_user' | 'delete_item' | 'delete_message' | 'resolve_item'
          target_type?: string
          target_id?: string
          reason?: string | null
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          color: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          participant_1: string
          participant_2: string
          item_id: string | null
          last_message_id: string | null
          last_message_at: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_1: string
          participant_2: string
          item_id?: string | null
          last_message_id?: string | null
          last_message_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_1?: string
          participant_2?: string
          item_id?: string | null
          last_message_id?: string | null
          last_message_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      item_views: {
        Row: {
          id: string
          item_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          item_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
        Update: {
          id?: string
          item_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          viewed_at?: string
        }
      }
      items: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string
          item_type: 'lost' | 'found'
          category: string | null
          location: string | null
          specific_location: string | null
          date_lost_found: string
          time_lost_found: string | null
          images: string[] | null
          tags: string[] | null
          status: 'draft' | 'pending' | 'approved' | 'resolved' | 'expired' | 'rejected'
          reward_amount: number | null
          contact_phone: string | null
          contact_email: string | null
          is_urgent: boolean
          views_count: number
          resolved_at: string | null
          resolved_by: string | null
          admin_notes: string | null
          rejection_reason: string | null
          expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description: string
          item_type: 'lost' | 'found'
          category?: string | null
          location?: string | null
          specific_location?: string | null
          date_lost_found: string
          time_lost_found?: string | null
          images?: string[] | null
          tags?: string[] | null
          status?: 'draft' | 'pending' | 'approved' | 'resolved' | 'expired' | 'rejected'
          reward_amount?: number | null
          contact_phone?: string | null
          contact_email?: string | null
          is_urgent?: boolean
          views_count?: number
          resolved_at?: string | null
          resolved_by?: string | null
          admin_notes?: string | null
          rejection_reason?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          description?: string
          item_type?: 'lost' | 'found'
          category?: string | null
          location?: string | null
          specific_location?: string | null
          date_lost_found?: string
          time_lost_found?: string | null
          images?: string[] | null
          tags?: string[] | null
          status?: 'draft' | 'pending' | 'approved' | 'resolved' | 'expired' | 'rejected'
          reward_amount?: number | null
          contact_phone?: string | null
          contact_email?: string | null
          is_urgent?: boolean
          views_count?: number
          resolved_at?: string | null
          resolved_by?: string | null
          admin_notes?: string | null
          rejection_reason?: string | null
          expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          description: string | null
          building: string | null
          floor: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          building?: string | null
          floor?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          building?: string | null
          floor?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          item_id: string | null
          content: string
          images: string[] | null
          message_type: 'text' | 'image' | 'system'
          is_read: boolean
          is_deleted: boolean
          reply_to: string | null
          read_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          item_id?: string | null
          content: string
          images?: string[] | null
          message_type?: 'text' | 'image' | 'system'
          is_read?: boolean
          is_deleted?: boolean
          reply_to?: string | null
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          item_id?: string | null
          content?: string
          images?: string[] | null
          message_type?: 'text' | 'image' | 'system'
          is_read?: boolean
          is_deleted?: boolean
          reply_to?: string | null
          read_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'item_match' | 'message_received' | 'item_approved' | 'item_rejected' | 'item_resolved' | 'system_alert' | 'admin_action'
          title: string
          message: string
          data: Json | null
          is_read: boolean
          item_id: string | null
          sender_id: string | null
          action_url: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'item_match' | 'message_received' | 'item_approved' | 'item_rejected' | 'item_resolved' | 'system_alert' | 'admin_action'
          title: string
          message: string
          data?: Json | null
          is_read?: boolean
          item_id?: string | null
          sender_id?: string | null
          action_url?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'item_match' | 'message_received' | 'item_approved' | 'item_rejected' | 'item_resolved' | 'system_alert' | 'admin_action'
          title?: string
          message?: string
          data?: Json | null
          is_read?: boolean
          item_id?: string | null
          sender_id?: string | null
          action_url?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string
          avatar_url: string | null
          phone_number: string | null
          student_id: string | null
          department: string | null
          year_of_study: number | null
          role: 'student' | 'faculty' | 'admin' | 'super_admin'
          is_banned: boolean
          ban_reason: string | null
          email_verified: boolean
          notification_preferences: Json | null
          privacy_settings: Json | null
          last_active: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name: string
          avatar_url?: string | null
          phone_number?: string | null
          student_id?: string | null
          department?: string | null
          year_of_study?: number | null
          role?: 'student' | 'faculty' | 'admin' | 'super_admin'
          is_banned?: boolean
          ban_reason?: string | null
          email_verified?: boolean
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          last_active?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          avatar_url?: string | null
          phone_number?: string | null
          student_id?: string | null
          department?: string | null
          year_of_study?: number | null
          role?: 'student' | 'faculty' | 'admin' | 'super_admin'
          is_banned?: boolean
          ban_reason?: string | null
          email_verified?: boolean
          notification_preferences?: Json | null
          privacy_settings?: Json | null
          last_active?: string
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_id: string
          reported_user_id: string | null
          reported_item_id: string | null
          reported_message_id: string | null
          report_type: 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'other'
          reason: string
          status: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes: string | null
          resolved_by: string | null
          resolved_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id: string
          reported_user_id?: string | null
          reported_item_id?: string | null
          reported_message_id?: string | null
          report_type: 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'other'
          reason: string
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string
          reported_user_id?: string | null
          reported_item_id?: string | null
          reported_message_id?: string | null
          report_type?: 'spam' | 'inappropriate' | 'fake' | 'harassment' | 'other'
          reason?: string
          status?: 'pending' | 'reviewed' | 'resolved' | 'dismissed'
          admin_notes?: string | null
          resolved_by?: string | null
          resolved_at?: string | null
          created_at?: string
        }
      }
      saved_searches: {
        Row: {
          id: string
          user_id: string
          name: string
          search_params: Json
          is_active: boolean
          email_alerts: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          search_params: Json
          is_active?: boolean
          email_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          search_params?: Json
          is_active?: boolean
          email_alerts?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_items: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      cleanup_old_notifications: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      create_notification: {
        Args: {
          p_user_id: string
          p_type: 'item_match' | 'message_received' | 'item_approved' | 'item_rejected' | 'item_resolved' | 'system_alert' | 'admin_action'
          p_title: string
          p_message: string
          p_data?: Json
          p_item_id?: string
          p_sender_id?: string
          p_action_url?: string
        }
        Returns: string
      }
      get_or_create_conversation: {
        Args: {
          user1_id: string
          user2_id: string
          item_id: string
        }
        Returns: string
      }
      get_user_conversations: {
        Args: {
          user_id?: string
        }
        Returns: {
          conversation_id: string
          other_user_id: string
          other_user_name: string
          other_user_avatar: string
          item_id: string
          item_title: string
          item_type: string
          last_message: string
          last_message_at: string
          unread_count: number
        }[]
      }
      get_user_role: {
        Args: {
          user_id: string
        }
        Returns: 'student' | 'faculty' | 'admin' | 'super_admin'
      }
      is_admin: {
        Args: {
          user_id?: string
        }
        Returns: boolean
      }
      is_user_banned: {
        Args: {
          user_id?: string
        }
        Returns: boolean
      }
      search_items: {
        Args: {
          search_query?: string
          item_type_filter?: string
          category_filter?: string
          location_filter?: string
          date_from?: string
          date_to?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          id: string
          title: string
          description: string
          item_type: string
          category_name: string
          location_name: string
          date_lost_found: string
          images: string[]
          user_name: string
          created_at: string
          views_count: number
          rank: number
        }[]
      }
    }
    Enums: {
      admin_action_type: 'approve_item' | 'reject_item' | 'ban_user' | 'unban_user' | 'delete_item' | 'delete_message' | 'resolve_item'
      item_category: 'electronics' | 'clothing' | 'books' | 'accessories' | 'documents' | 'sports' | 'jewelry' | 'bags' | 'keys' | 'other'
      item_status: 'draft' | 'pending' | 'approved' | 'resolved' | 'expired' | 'rejected'
      notification_type: 'item_match' | 'message_received' | 'item_approved' | 'item_rejected' | 'item_resolved' | 'system_alert' | 'admin_action'
      user_role: 'student' | 'faculty' | 'admin' | 'super_admin'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier use
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Item = Database['public']['Tables']['items']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Location = Database['public']['Tables']['locations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type SavedSearch = Database['public']['Tables']['saved_searches']['Row']
export type Report = Database['public']['Tables']['reports']['Row']
export type AdminAction = Database['public']['Tables']['admin_actions']['Row']
export type ItemView = Database['public']['Tables']['item_views']['Row']

export type ItemInsert = Database['public']['Tables']['items']['Insert']
export type ItemUpdate = Database['public']['Tables']['items']['Update']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']

export type UserRole = Database['public']['Enums']['user_role']
export type ItemStatus = Database['public']['Enums']['item_status']
export type NotificationType = Database['public']['Enums']['notification_type']
export type AdminActionType = Database['public']['Enums']['admin_action_type']

// Extended types with relations
export type ItemWithDetails = Item & {
  profiles?: Profile
}

export type ConversationWithDetails = Conversation & {
  participant_1_profile?: Profile
  participant_2_profile?: Profile
  item?: Item
  last_message?: Message
}

export type MessageWithSender = Message & {
  sender?: Profile
}

export type NotificationWithDetails = Notification & {
  item?: Item
  sender?: Profile
} 