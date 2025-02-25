export interface SiteConfiguration {
  id: number;
  created_at: string;
  navbar_color: string;
  primary_color: string;
  text_color: string;
  navbar_logo_type: 'text' | 'image';
  navbar_logo_image?: string;
  navbar_title?: string;
  navbar_social_facebook?: string;
  navbar_social_instagram?: string;
  bottom_nav_primary_color?: string;
  bottom_nav_secondary_color?: string;
  bottom_nav_text_color?: string;
  bottom_nav_icon_color?: string;
  login_text_color?: string;
  signup_text_color?: string;
  pwa_install_message?: string;
  button_secondary_color?: string;
  whatsapp_message?: string;
  favorite_heart_color?: string;
  buy_button_color?: string;
  buy_button_text?: string;
  footer_primary_color: string;
  footer_secondary_color: string;
  footer_text_color: string;
  footer_contact_email: string | null;
  footer_contact_phone: string | null;
  footer_address: string | null;
  footer_address_cep: string | null;
  footer_social_facebook: string | null;
  footer_social_instagram: string | null;
  footer_schedule: string | null;
  footer_copyright_text: string | null;
  meta_title: string;
  meta_description: string;
  meta_author: string;
  meta_image: string;
  button_primary_color: string;
  admin_accent_color: string | null;
  admin_background_color: string | null;
  admin_card_color: string | null;
  admin_header_color: string | null;
  admin_hover_color: string | null;
  admin_sidebar_color: string | null;
  admin_text_color: string | null;
  high_contrast: boolean;
  location_lat: number | null;
  location_lng: number | null;
  location_city: string | null;
  location_state: string | null;
  location_country: string | null;
  weather_api_key: string | null;
  version: number;
  theme_name: string;
  secondary_color: string;
  background_color: string;
  updated_at: string;
  language: string;
  enable_dark_mode: boolean;
  enable_weather: boolean;
  header_alerts: any[];
  navigation_links: any[];
  font_size: string;
  basic_info_update_interval?: number;
  pwa_name: string;
  pwa_short_name: string;
  pwa_description: string;
  pwa_theme_color: string;
  pwa_background_color: string;
  pwa_app_icon: string | null;
  location_id?: string | null;
}

export interface Database {
  public: {
    Tables: {
      admin_pages: {
        Row: {
          created_at: string
          description: string
          id: string
          path: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          path: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          path?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          background_color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          slug: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          slug: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      chat_participants: {
        Row: {
          chat_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          chat_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          chat_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_participants_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      chats: {
        Row: {
          created_at: string
          id: string
        }
        Insert: {
          created_at?: string
          id?: string
        }
        Update: {
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      events: {
        Row: {
          button_color: string | null
          category_id: string | null
          content: string | null
          created_at: string
          date: string | null
          file_metadata: any | null
          files_metadata: any[] | null
          id: string
          images: string[] | null
          location_id: string | null
          title: string | null
          user_id: string | null
          video_urls: string[] | null
        }
        Insert: {
          button_color?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          date?: string | null
          file_metadata?: any | null
          files_metadata?: any[] | null
          id?: string
          images?: string[] | null
          location_id?: string | null
          title?: string | null
          user_id?: string | null
          video_urls?: string[] | null
        }
        Update: {
          button_color?: string | null
          category_id?: string | null
          content?: string | null
          created_at?: string
          date?: string | null
          file_metadata?: any | null
          files_metadata?: any[] | null
          id?: string
          images?: string[] | null
          location_id?: string | null
          title?: string | null
          user_id?: string | null
          video_urls?: string[] | null
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
            foreignKeyName: "events_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      files: {
        Row: {
          created_at: string
          id: string
          name: string | null
          size: number | null
          type: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          size?: number | null
          type?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          size?: number | null
          type?: string | null
          url?: string | null
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      locations: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          lat: number | null
          lng: number | null
          name: string | null
          state: string | null
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string | null
          state?: string | null
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string | null
          state?: string | null
        }
        Relationships: []
      }
      news: {
        Row: {
          button_color: string | null
          button_secondary_color: string | null
          category_id: string | null
          content: string
          created_at: string
          date: string
          file_metadata: any | null
          files_metadata: any[] | null
          id: string
          images: string[] | null
          instagram_media: any | null
          location_id: string | null
          title: string
          user_id: string | null
          video_urls: string[] | null
        }
        Insert: {
          button_color?: string | null
          button_secondary_color?: string | null
          category_id?: string | null
          content: string
          created_at?: string
          date: string
          file_metadata?: any | null
          files_metadata?: any[] | null
          id?: string
          images?: string[] | null
          instagram_media?: any | null
          location_id?: string | null
          title: string
          user_id?: string | null
          video_urls?: string[] | null
        }
        Update: {
          button_color?: string | null
          button_secondary_color?: string | null
          category_id?: string | null
          content?: string
          created_at?: string
          date?: string
          file_metadata?: any | null
          files_metadata?: any[] | null
          id?: string
          images?: string[] | null
          instagram_media?: any | null
          location_id?: string | null
          title?: string
          user_id?: string | null
          video_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "news_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string | null
          read: boolean | null
          type: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          type?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string | null
          read?: boolean | null
          type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      post_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          reply_to_id: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          reply_to_id?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          reply_to_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "post_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
       post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          reaction_type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          reaction_type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          reaction_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          content: string | null
          created_at: string
          id: string
          images: string[] | null
          user_id: string
          video_urls: string[] | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          user_id: string
          video_urls?: string[] | null
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          user_id?: string
          video_urls?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      products: {
        Row: {
          button_color: string | null
          category_id: string
          condition: string
          created_at: string
          description: string
          id: string
          images: string[]
          latitude: number
          location_id: string | null
          location_name: string
          longitude: number
          price: number
          status: string | null
          title: string
          user_id: string
          whatsapp: string
        }
        Insert: {
          button_color?: string | null
          category_id: string
          condition: string
          created_at?: string
          description: string
          id?: string
          images: string[]
          latitude: number
          location_id?: string | null
          location_name: string
          longitude: number
          price: number
          status?: string | null
          title: string
          user_id: string
          whatsapp: string
        }
        Update: {
          button_color?: string | null
          category_id?: string
          condition?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[]
          latitude?: number
          location_id?: string | null
          location_name?: string
          longitude?: number
          price?: number
          status?: string | null
          title?: string
          user_id?: string
          whatsapp?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
          basic_info_update_interval: number | null
          bottom_nav_icon_color: string | null
          bottom_nav_primary_color: string | null
          bottom_nav_secondary_color: string | null
          bottom_nav_text_color: string | null
          button_color: string | null
          button_primary_color: string | null
          button_secondary_color: string | null
          buy_button_color: string | null
          buy_button_text: string | null
          created_at: string
          enable_dark_mode: boolean | null
          enable_weather: boolean | null
          favorite_heart_color: string | null
          file_metadata: any | null
          files_metadata: any[] | null
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
          font_size: string | null
          header_alerts: any[] | null
          high_contrast: boolean | null
          id: number
          language: string | null
          location_city: string | null
          location_country: string | null
          location_lat: number | null
          location_lng: number | null
          location_state: string | null
          location_id: string | null
          login_text_color: string | null
          meta_author: string | null
          meta_description: string | null
          meta_image: string | null
          meta_title: string | null
          navigation_links: any[] | null
          navbar_color: string | null
          navbar_logo_image: string | null
          navbar_logo_text: string | null
          navbar_logo_type: string | null
          navbar_social_facebook: string | null
          navbar_social_instagram: string | null
          pwa_app_icon: string | null
          pwa_background_color: string | null
          pwa_description: string | null
          pwa_install_message: string | null
          pwa_name: string | null
          pwa_short_name: string | null
          pwa_theme_color: string | null
          primary_color: string | null
          secondary_color: string | null
          signup_text_color: string | null
          text_color: string | null
          theme_name: string | null
          updated_at: string | null
          version: number | null
          whatsapp_message: string | null
          background_color: string | null
        }
        Insert: {
          admin_accent_color?: string | null
          admin_background_color?: string | null
          admin_card_color?: string | null
          admin_header_color?: string | null
          admin_hover_color?: string | null
          admin_sidebar_color?: string | null
          admin_text_color?: string | null
          basic_info_update_interval?: number | null
          bottom_nav_icon_color?: string | null
          bottom_nav_primary_color?: string | null
          bottom_nav_secondary_color?: string | null
          bottom_nav_text_color?: string | null
          button_color?: string | null
          button_primary_color?: string | null
          button_secondary_color?: string | null
          buy_button_color?: string | null
          buy_button_text?: string | null
          created_at?: string
          enable_dark_mode?: boolean | null
          enable_weather?: boolean | null
          favorite_heart_color?: string | null
          file_metadata?: any | null
          files_metadata?: any[] | null
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
          font_size?: string | null
          header_alerts?: any[] | null
          high_contrast?: boolean | null
          id?: number
          language?: string | null
          location_city?: string | null
          location_country?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_state?: string | null
          location_id?: string | null
          login_text_color?: string | null
          meta_author?: string | null
          meta_description?: string | null
          meta_image?: string | null
          meta_title?: string | null
          navigation_links?: any[] | null
          navbar_color?: string | null
          navbar_logo_image?: string | null
          navbar_logo_text?: string | null
          navbar_logo_type?: string | null
          navbar_social_facebook?: string | null
          navbar_social_instagram?: string | null
          pwa_app_icon?: string | null
          pwa_background_color?: string | null
          pwa_description?: string | null
          pwa_install_message?: string | null
          pwa_name?: string | null
          pwa_short_name?: string | null
          pwa_theme_color?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          signup_text_color?: string | null
          text_color?: string | null
          theme_name?: string | null
          updated_at?: string | null
          version?: number | null
          whatsapp_message?: string | null
          background_color?: string | null
        }
        Update: {
          admin_accent_color?: string | null
          admin_background_color?: string | null
          admin_card_color?: string | null
          admin_header_color?: string | null
          admin_hover_color?: string | null
          admin_sidebar_color?: string | null
          admin_text_color?: string | null
          basic_info_update_interval?: number | null
          bottom_nav_icon_color?: string | null
          bottom_nav_primary_color?: string | null
          bottom_nav_secondary_color?: string | null
          bottom_nav_text_color?: string | null
          button_color?: string | null
          button_primary_color?: string | null
          button_secondary_color?: string | null
          buy_button_color?: string | null
          buy_button_text?: string | null
          created_at?: string
          enable_dark_mode?: boolean | null
          enable_weather?: boolean | null
          favorite_heart_color?: string | null
          file_metadata?: any | null
          files_metadata?: any[] | null
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
          font_size?: string | null
          header_alerts?: any[] | null
          high_contrast?: boolean | null
          id?: number
          language?: string | null
          location_city?: string | null
          location_country?: string | null
          location_lat?: number | null
          location_lng?: number | null
          location_state?: string | null
          location_id?: string | null
          login_text_color?: string | null
          meta_author?: string | null
          meta_description?: string | null
          meta_image?: string | null
          meta_title?: string | null
          navigation_links?: any[] | null
          navbar_color?: string | null
          navbar_logo_image?: string | null
          navbar_logo_text?: string | null
          navbar_logo_type?: string | null
          navbar_social_facebook?: string | null
          navbar_social_instagram?: string | null
          pwa_app_icon?: string | null
          pwa_background_color?: string | null
          pwa_description?: string | null
          pwa_install_message?: string | null
          pwa_name?: string | null
          pwa_short_name?: string | null
          pwa_theme_color?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          signup_text_color?: string | null
          text_color?: string | null
          theme_name?: string | null
          updated_at?: string | null
          version?: number | null
          whatsapp_message?: string | null
          background_color?: string | null
        }
        Relationships: []
      }
      stories: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          media_type: "image" | "video"
          media_url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          media_type: "image" | "video"
          media_url: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          media_type?: "image" | "video"
          media_url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stories_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      user_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: any | null
          id: string
          performed_by: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          details?: any | null
          id?: string
          performed_by: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          details?: any | null
          id?: string
          performed_by?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "users_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
