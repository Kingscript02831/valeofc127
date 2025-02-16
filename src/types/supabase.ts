
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
      news: {
        Row: {
          id: string
          title: string
          content: string
          date: string
          category_id: string | null
          image: string | null
          video: string | null
          button_color: string | null
          button_secondary_color: string | null
          instagram_media: {
            url: string
            type: "post" | "video"
          }[] | null
          created_at?: string
          file_metadata?: Json
          files_metadata?: Json[]
        }
        Insert: {
          id?: string
          title: string
          content: string
          date?: string
          category_id?: string | null
          image?: string | null
          video?: string | null
          button_color?: string | null
          button_secondary_color?: string | null
          instagram_media?: {
            url: string
            type: "post" | "video"
          }[] | null
          created_at?: string
          file_metadata?: Json
          files_metadata?: Json[]
        }
        Update: {
          id?: string
          title?: string
          content?: string
          date?: string
          category_id?: string | null
          image?: string | null
          video?: string | null
          button_color?: string | null
          button_secondary_color?: string | null
          instagram_media?: {
            url: string
            type: "post" | "video"
          }[] | null
          created_at?: string
          file_metadata?: Json
          files_metadata?: Json[]
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          event_date: string
          event_time: string
          end_time: string
          location?: string
          maps_url?: string
          entrance_fee?: string
          created_at: string
          button_color?: string
          button_secondary_color?: string
          video_url?: string
          image?: string
          images?: string[]
          category_id?: string
          file_path?: string
          file_metadata?: Json
          files_metadata?: Json[]
          video_urls?: string[]
        }
        Insert: {
          id?: string
          title: string
          description: string
          event_date: string
          event_time: string
          end_time: string
          location?: string
          maps_url?: string
          entrance_fee?: string
          created_at?: string
          button_color?: string
          button_secondary_color?: string
          video_url?: string
          image?: string
          images?: string[]
          category_id?: string
          file_path?: string
          file_metadata?: Json
          files_metadata?: Json[]
          video_urls?: string[]
        }
        Update: {
          id?: string
          title?: string
          description?: string
          event_date?: string
          event_time?: string
          end_time?: string
          location?: string
          maps_url?: string
          entrance_fee?: string
          created_at?: string
          button_color?: string
          button_secondary_color?: string
          video_url?: string
          image?: string
          images?: string[]
          category_id?: string
          file_path?: string
          file_metadata?: Json
          files_metadata?: Json[]
          video_urls?: string[]
        }
      }
      places: {
        Row: {
          id: string
          name: string
          description: string
          address: string
          city?: string
          state?: string
          postal_code?: string
          phone?: string
          whatsapp?: string
          website?: string
          maps_url?: string
          owner_name?: string
          entrance_fee?: string
          opening_hours?: Json
          social_media?: {
            facebook?: string
            instagram?: string
          }
          image?: string
          images?: string[]
          category_id?: string
          latitude?: number
          longitude?: number
          created_at?: string
          file_metadata?: Json
          files_metadata?: Json[]
        }
        Insert: {
          id?: string
          name: string
          description: string
          address: string
          city?: string
          state?: string
          postal_code?: string
          phone?: string
          whatsapp?: string
          website?: string
          maps_url?: string
          owner_name?: string
          entrance_fee?: string
          opening_hours?: Json
          social_media?: {
            facebook?: string
            instagram?: string
          }
          image?: string
          images?: string[]
          category_id?: string
          latitude?: number
          longitude?: number
          created_at?: string
          file_metadata?: Json
          files_metadata?: Json[]
        }
        Update: {
          id?: string
          name?: string
          description?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          phone?: string
          whatsapp?: string
          website?: string
          maps_url?: string
          owner_name?: string
          entrance_fee?: string
          opening_hours?: Json
          social_media?: {
            facebook?: string
            instagram?: string
          }
          image?: string
          images?: string[]
          category_id?: string
          latitude?: number
          longitude?: number
          created_at?: string
          file_metadata?: Json
          files_metadata?: Json[]
        }
      }
      stores: {
        Row: {
          id: string
          name: string
          description: string
          address: string
          city?: string
          state?: string
          postal_code?: string
          phone?: string
          whatsapp?: string
          website?: string
          maps_url?: string
          owner_name?: string
          entrance_fee?: string
          opening_hours?: string
          social_media?: {
            facebook?: string
            instagram?: string
          }
          image?: string
          images?: string[]
          category_id?: string
          latitude?: number
          longitude?: number
          created_at?: string
          file_metadata?: Json
          files_metadata?: Json[]
        }
        Insert: {
          id?: string
          name: string
          description: string
          address: string
          city?: string
          state?: string
          postal_code?: string
          phone?: string
          whatsapp?: string
          website?: string
          maps_url?: string
          owner_name?: string
          entrance_fee?: string
          opening_hours?: string
          social_media?: {
            facebook?: string
            instagram?: string
          }
          image?: string
          images?: string[]
          category_id?: string
          latitude?: number
          longitude?: number
          created_at?: string
          file_metadata?: Json
          files_metadata?: Json[]
        }
        Update: {
          id?: string
          name?: string
          description?: string
          address?: string
          city?: string
          state?: string
          postal_code?: string
          phone?: string
          whatsapp?: string
          website?: string
          maps_url?: string
          owner_name?: string
          entrance_fee?: string
          opening_hours?: string
          social_media?: {
            facebook?: string
            instagram?: string
          }
          image?: string
          images?: string[]
          category_id?: string
          latitude?: number
          longitude?: number
          created_at?: string
          file_metadata?: Json
          files_metadata?: Json[]
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          description?: string
          slug?: string
          background_color?: string
          parent_id?: string
          page_type?: string
          created_at?: string
          updated_at?: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          slug?: string
          background_color?: string
          parent_id?: string
          page_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          slug?: string
          background_color?: string
          parent_id?: string
          page_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      admin_permissions: {
        Row: {
          id: string
          user_id: string
          permission: "owner" | "admin" | "news_editor" | "events_editor" | "places_editor" | "stores_editor"
          granted_at?: string
          modified_at?: string
          modified_by?: string
          description?: string
          custom_role?: string
          path?: string
          is_active?: boolean
        }
        Insert: {
          id?: string
          user_id: string
          permission: "owner" | "admin" | "news_editor" | "events_editor" | "places_editor" | "stores_editor"
          granted_at?: string
          modified_at?: string
          modified_by?: string
          description?: string
          custom_role?: string
          path?: string
          is_active?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          permission?: "owner" | "admin" | "news_editor" | "events_editor" | "places_editor" | "stores_editor"
          granted_at?: string
          modified_at?: string
          modified_by?: string
          description?: string
          custom_role?: string
          path?: string
          is_active?: boolean
        }
      }
      site_configuration: {
        Row: {
          id: string
          theme_name: string
          primary_color: string
          secondary_color: string
          background_color: string
          text_color: string
          navbar_color: string
          navbar_logo_type: string
          navbar_logo_text?: string
          navbar_logo_image?: string
          navbar_social_facebook?: string
          navbar_social_instagram?: string
          navigation_links?: Json
          language?: string
          font_size?: string
          footer_primary_color: string
          footer_secondary_color: string
          footer_text_color: string
          footer_contact_email?: string
          footer_contact_phone?: string
          footer_address?: string
          footer_address_cep?: string
          footer_social_facebook?: string
          footer_social_instagram?: string
          footer_schedule?: string
          footer_copyright_text?: string
          meta_title?: string
          meta_description?: string
          meta_author?: string
          meta_image?: string
          button_primary_color: string
          button_secondary_color: string
          bottom_nav_primary_color: string
          bottom_nav_secondary_color: string
          bottom_nav_text_color: string
          bottom_nav_icon_color: string
          location_city?: string
          location_state?: string
          location_country?: string
          location_lat?: number
          location_lng?: number
          weather_api_key?: string
          enable_weather?: boolean
          enable_dark_mode?: boolean
          high_contrast?: boolean
          header_alerts?: Json
          created_at?: string
          updated_at?: string
          version?: number
          admin_accent_color: string
          admin_background_color: string
          admin_card_color: string
          admin_header_color: string
          admin_hover_color: string
          admin_sidebar_color: string
          admin_text_color: string
          login_text_color: string
          signup_text_color: string
        }
      }
    }
  }
}
