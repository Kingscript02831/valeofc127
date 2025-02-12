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
      admin_permissions: {
        Row: {
          granted_at: string | null
          granted_by: string | null
          id: string
          is_active: boolean | null
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id: string | null
        }
        Insert: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id?: string | null
        }
        Update: {
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          is_active?: boolean | null
          permission?: Database["public"]["Enums"]["admin_permission"]
          user_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          background_color: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          page_type: string
          parent_id: string | null
          slug: string | null
          updated_at: string | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          page_type?: string
          parent_id?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Update: {
          background_color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          page_type?: string
          parent_id?: string | null
          slug?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_participants: {
        Row: {
          chat_id: string | null
          created_at: string | null
          id: string
          last_read_at: string | null
          user_id: string | null
        }
        Insert: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          user_id?: string | null
        }
        Update: {
          chat_id?: string | null
          created_at?: string | null
          id?: string
          last_read_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      chats: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          additional_photos: string[] | null
          button_color: string | null
          button_secondary_color: string | null
          category_id: string | null
          created_at: string | null
          description: string
          end_time: string
          entrance_fee: string | null
          event_date: string
          event_time: string
          id: string
          image: string | null
          images: string[] | null
          location: string | null
          maps_url: string | null
          numero_whatsapp_events: string | null
          owner_name: string | null
          phone: string | null
          social_media: Json | null
          title: string
          url_maps_events: string | null
          user_id: string | null
          video_url: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          additional_photos?: string[] | null
          button_color?: string | null
          button_secondary_color?: string | null
          category_id?: string | null
          created_at?: string | null
          description: string
          end_time: string
          entrance_fee?: string | null
          event_date: string
          event_time: string
          id?: string
          image?: string | null
          images?: string[] | null
          location?: string | null
          maps_url?: string | null
          numero_whatsapp_events?: string | null
          owner_name?: string | null
          phone?: string | null
          social_media?: Json | null
          title: string
          url_maps_events?: string | null
          user_id?: string | null
          video_url?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          additional_photos?: string[] | null
          button_color?: string | null
          button_secondary_color?: string | null
          category_id?: string | null
          created_at?: string | null
          description?: string
          end_time?: string
          entrance_fee?: string | null
          event_date?: string
          event_time?: string
          id?: string
          image?: string | null
          images?: string[] | null
          location?: string | null
          maps_url?: string | null
          numero_whatsapp_events?: string | null
          owner_name?: string | null
          phone?: string | null
          social_media?: Json | null
          title?: string
          url_maps_events?: string | null
          user_id?: string | null
          video_url?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_events_category"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          chat_id: string | null
          content: string
          created_at: string | null
          id: string
          read: boolean | null
          sender_id: string | null
        }
        Insert: {
          chat_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string | null
        }
        Update: {
          chat_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          read?: boolean | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
        ]
      }
      news: {
        Row: {
          button_color: string | null
          button_secondary_color: string | null
          category_id: string | null
          content: string
          created_at: string | null
          date: string
          id: string
          image: string | null
          instagram_media: Json | null
          title: string
          updated_at: string | null
          user_id: string | null
          video: string | null
        }
        Insert: {
          button_color?: string | null
          button_secondary_color?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          date?: string
          id?: string
          image?: string | null
          instagram_media?: Json | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          video?: string | null
        }
        Update: {
          button_color?: string | null
          button_secondary_color?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          date?: string
          id?: string
          image?: string | null
          instagram_media?: Json | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          video?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          publication_category: string | null
          publication_date: string | null
          publication_description: string | null
          publication_title: string | null
          read: boolean | null
          reference_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          publication_category?: string | null
          publication_date?: string | null
          publication_description?: string | null
          publication_title?: string | null
          read?: boolean | null
          reference_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          publication_category?: string | null
          publication_date?: string | null
          publication_description?: string | null
          publication_title?: string | null
          read?: boolean | null
          reference_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string
          category_id: string | null
          city: string | null
          created_at: string | null
          description: string
          entrance_fee: string | null
          id: string
          image: string | null
          images: string[] | null
          latitude: number | null
          longitude: number | null
          maps_url: string | null
          name: string
          opening_hours: Json | null
          owner_name: string | null
          phone: string | null
          postal_code: string | null
          social_media: Json | null
          state: string | null
          user_id: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address: string
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          description: string
          entrance_fee?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name: string
          opening_hours?: Json | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          social_media?: Json | null
          state?: string | null
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string
          entrance_fee?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name?: string
          opening_hours?: Json | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          social_media?: Json | null
          state?: string | null
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "places_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          basic_info_updated_at: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          house_number: string | null
          id: string
          last_basic_info_update: string | null
          last_seen: string | null
          name: string | null
          online_status: boolean | null
          phone: string | null
          postal_code: string | null
          scheduled_deletion_date: string | null
          street: string | null
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          basic_info_updated_at?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          house_number?: string | null
          id: string
          last_basic_info_update?: string | null
          last_seen?: string | null
          name?: string | null
          online_status?: boolean | null
          phone?: string | null
          postal_code?: string | null
          scheduled_deletion_date?: string | null
          street?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          basic_info_updated_at?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          house_number?: string | null
          id?: string
          last_basic_info_update?: string | null
          last_seen?: string | null
          name?: string | null
          online_status?: boolean | null
          phone?: string | null
          postal_code?: string | null
          scheduled_deletion_date?: string | null
          street?: string | null
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      site_configuration: {
        Row: {
          admin_accent_color: string | null
          admin_background_color: string | null
          admin_card_color: string | null
          admin_header_color: string | null
          admin_hover_color: string | null
          admin_sidebar_color: string | null
          admin_text_color: string | null
          background_color: string | null
          bottom_nav_icon_color: string | null
          bottom_nav_primary_color: string | null
          bottom_nav_secondary_color: string | null
          bottom_nav_text_color: string | null
          button_primary_color: string | null
          button_secondary_color: string | null
          created_at: string | null
          enable_dark_mode: boolean | null
          enable_weather: boolean | null
          font_size: string | null
          footer_address: string | null
          footer_address_cep: string | null
          footer_contact_email: string | null
          footer_contact_phone: string | null
          footer_copyright_text: string | null
          footer_primary_color: string | null
          footer_schedule: string | null
          footer_secondary_color: string | null
          footer_social_facebook: string | null
          footer_social_instagram: string | null
          footer_text_color: string | null
          header_alerts: Json | null
          high_contrast: boolean | null
          id: string
          language: string | null
          location_city: string | null
          location_country: string | null
          location_lat: number | null
          location_lng: number | null
          location_state: string | null
          login_text_color: string | null
          meta_author: string | null
          meta_description: string | null
          meta_image: string | null
          meta_title: string | null
          navbar_color: string | null
          navbar_logo_image: string | null
          navbar_logo_text: string | null
          navbar_logo_type: string | null
          navbar_social_facebook: string | null
          navbar_social_instagram: string | null
          navigation_links: Json | null
          primary_color: string | null
          secondary_color: string | null
          signup_text_color: string | null
          text_color: string | null
          theme_name: string | null
          updated_at: string | null
          version: number | null
          weather_api_key: string | null
        }
        Insert: {
          admin_accent_color?: string | null
          admin_background_color?: string | null
          admin_card_color?: string | null
          admin_header_color?: string | null
          admin_hover_color?: string | null
          admin_sidebar_color?: string | null
          admin_text_color?: string | null
          background_color?: string | null
          bottom_nav_icon_color?: string | null
          bottom_nav_primary_color?: string | null
          bottom_nav_secondary_color?: string | null
          bottom_nav_text_color?: string | null
          button_primary_color?: string | null
          button_secondary_color?: string | null
          created_at?: string | null
          enable_dark_mode?: boolean | null
          enable_weather?: boolean | null
          font_size?: string | null
          footer_address?: string | null
          footer_address_cep?: string | null
          footer_contact_email?: string | null
          footer_contact_phone?: string | null
          footer_copyright_text?: string | null
          footer_primary_color?: string | null
          footer_schedule?: string | null
          footer_secondary_color?: string | null
          footer_social_facebook?: string | null
          footer_social_instagram?: string | null
          footer_text_color?: string | null
          header_alerts?: Json | null
          high_contrast?: boolean | null
          id?: string
          language?: string | null
          location_city?: string | null
          location_country?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_state?: string | null
          login_text_color?: string | null
          meta_author?: string | null
          meta_description?: string | null
          meta_image?: string | null
          meta_title?: string | null
          navbar_color?: string | null
          navbar_logo_image?: string | null
          navbar_logo_text?: string | null
          navbar_logo_type?: string | null
          navbar_social_facebook?: string | null
          navbar_social_instagram?: string | null
          navigation_links?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          signup_text_color?: string | null
          text_color?: string | null
          theme_name?: string | null
          updated_at?: string | null
          version?: number | null
          weather_api_key?: string | null
        }
        Update: {
          admin_accent_color?: string | null
          admin_background_color?: string | null
          admin_card_color?: string | null
          admin_header_color?: string | null
          admin_hover_color?: string | null
          admin_sidebar_color?: string | null
          admin_text_color?: string | null
          background_color?: string | null
          bottom_nav_icon_color?: string | null
          bottom_nav_primary_color?: string | null
          bottom_nav_secondary_color?: string | null
          bottom_nav_text_color?: string | null
          button_primary_color?: string | null
          button_secondary_color?: string | null
          created_at?: string | null
          enable_dark_mode?: boolean | null
          enable_weather?: boolean | null
          font_size?: string | null
          footer_address?: string | null
          footer_address_cep?: string | null
          footer_contact_email?: string | null
          footer_contact_phone?: string | null
          footer_copyright_text?: string | null
          footer_primary_color?: string | null
          footer_schedule?: string | null
          footer_secondary_color?: string | null
          footer_social_facebook?: string | null
          footer_social_instagram?: string | null
          footer_text_color?: string | null
          header_alerts?: Json | null
          high_contrast?: boolean | null
          id?: string
          language?: string | null
          location_city?: string | null
          location_country?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_state?: string | null
          login_text_color?: string | null
          meta_author?: string | null
          meta_description?: string | null
          meta_image?: string | null
          meta_title?: string | null
          navbar_color?: string | null
          navbar_logo_image?: string | null
          navbar_logo_text?: string | null
          navbar_logo_type?: string | null
          navbar_social_facebook?: string | null
          navbar_social_instagram?: string | null
          navigation_links?: Json | null
          primary_color?: string | null
          secondary_color?: string | null
          signup_text_color?: string | null
          text_color?: string | null
          theme_name?: string | null
          updated_at?: string | null
          version?: number | null
          weather_api_key?: string | null
        }
        Relationships: []
      }
      stores: {
        Row: {
          address: string
          category_id: string | null
          city: string | null
          created_at: string | null
          description: string
          entrance_fee: string | null
          id: string
          image: string | null
          images: string[] | null
          latitude: number | null
          longitude: number | null
          maps_url: string | null
          name: string
          opening_hours: string | null
          owner_name: string | null
          phone: string | null
          postal_code: string | null
          social_media: Json | null
          state: string | null
          user_id: string | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          address: string
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          description: string
          entrance_fee?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name: string
          opening_hours?: string | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          social_media?: Json | null
          state?: string | null
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string
          category_id?: string | null
          city?: string | null
          created_at?: string | null
          description?: string
          entrance_fee?: string | null
          id?: string
          image?: string | null
          images?: string[] | null
          latitude?: number | null
          longitude?: number | null
          maps_url?: string | null
          name?: string
          opening_hours?: string | null
          owner_name?: string | null
          phone?: string | null
          postal_code?: string | null
          social_media?: Json | null
          state?: string | null
          user_id?: string | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_update_basic_info: {
        Args: {
          profile_id: string
        }
        Returns: boolean
      }
      create_private_chat: {
        Args: {
          other_user_id: string
        }
        Returns: string
      }
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      has_admin_permission: {
        Args: {
          user_id: string
          required_permission: Database["public"]["Enums"]["admin_permission"]
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          user_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      schedule_account_deletion: {
        Args: {
          user_id: string
        }
        Returns: undefined
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
    }
    Enums: {
      admin_permission:
        | "full_access"
        | "places"
        | "events"
        | "stores"
        | "news"
        | "categories"
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
