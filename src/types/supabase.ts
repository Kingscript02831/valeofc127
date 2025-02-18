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
      places: {
        Row: {
          id: string
          created_at?: string
          name: string
          description: string
          address: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          address: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          address?: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
      }
      stores: {
        Row: {
          id: string
          created_at?: string
          name: string
          description: string
          address: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          address: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          address?: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          background_color?: string
          page_type?: string
          slug?: string
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          background_color?: string
          page_type?: string
          slug?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          background_color?: string
          page_type?: string
          slug?: string
          created_at?: string
        }
      }
      site_configuration: {
        Row: {
          id: string;
          theme_name: string;
          primary_color: string;
          secondary_color: string;
          background_color: string;
          text_color: string;
          navbar_color: string;
          created_at: string;
          updated_at: string;
          navbar_logo_type: string;
          navbar_logo_text: string | null;
          navbar_logo_image: string | null;
          navbar_social_facebook: string | null;
          navbar_social_instagram: string | null;
          language: string | null;
          enable_dark_mode: boolean | null;
          enable_weather: boolean | null;
          header_alerts: Json[] | null;
          navigation_links: Json[] | null;
          font_size: string | null;
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
          footer_copyright_text: string;
          meta_title: string;
          meta_description: string;
          meta_author: string;
          meta_image: string;
          button_primary_color: string;
          button_secondary_color: string;
          bottom_nav_primary_color: string;
          bottom_nav_secondary_color: string;
          bottom_nav_text_color: string;
          bottom_nav_icon_color: string;
          high_contrast: boolean | null;
          location_lat: number | null;
          location_lng: number | null;
          location_city: string | null;
          location_state: string | null;
          location_country: string | null;
          weather_api_key: string | null;
          version: number | null;
          login_text_color: string;
          signup_text_color: string;
          pwa_name: string | null;
          pwa_short_name: string | null;
          pwa_description: string | null;
          pwa_theme_color: string | null;
          pwa_background_color: string | null;
          pwa_install_message: string | null;
          pwa_app_icon: string | null;
          admin_accent_color: string;
          admin_background_color: string;
          admin_card_color: string;
          admin_header_color: string;
          admin_hover_color: string;
          admin_sidebar_color: string;
          admin_text_color: string;
          favorite_heart_color: string;
          buy_button_color: string;
          buy_button_text: string;
        }
        Insert: {
          id?: string
          theme_name: string;
          primary_color: string;
          secondary_color: string;
          background_color: string;
          text_color: string;
          navbar_color: string;
          created_at?: string;
          updated_at?: string;
          navbar_logo_type: string;
          navbar_logo_text: string | null;
          navbar_logo_image: string | null;
          navbar_social_facebook: string | null;
          navbar_social_instagram: string | null;
          language: string | null;
          enable_dark_mode: boolean | null;
          enable_weather: boolean | null;
          header_alerts: Json[] | null;
          navigation_links: Json[] | null;
          font_size: string | null;
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
          footer_copyright_text: string;
          meta_title: string;
          meta_description: string;
          meta_author: string;
          meta_image: string;
          button_primary_color: string;
          button_secondary_color: string;
          bottom_nav_primary_color: string;
          bottom_nav_secondary_color: string;
          bottom_nav_text_color: string;
          bottom_nav_icon_color: string;
          high_contrast: boolean | null;
          location_lat: number | null;
          location_lng: number | null;
          location_city: string | null;
          location_state: string | null;
          location_country: string | null;
          weather_api_key: string | null;
          version: number | null;
          login_text_color: string;
          signup_text_color: string;
          pwa_name: string | null;
          pwa_short_name: string | null;
          pwa_description: string | null;
          pwa_theme_color: string | null;
          pwa_background_color: string | null;
          pwa_install_message: string | null;
          pwa_app_icon: string | null;
          admin_accent_color: string;
          admin_background_color: string;
          admin_card_color: string;
          admin_header_color: string;
          admin_hover_color: string;
          admin_sidebar_color: string;
          admin_text_color: string;
          favorite_heart_color: string;
          buy_button_color: string;
          buy_button_text: string;
        }
        Update: {
          id?: string
          theme_name?: string;
          primary_color?: string;
          secondary_color?: string;
          background_color?: string;
          text_color?: string;
          navbar_color?: string;
          created_at?: string;
          updated_at?: string;
          navbar_logo_type?: string;
          navbar_logo_text?: string | null;
          navbar_logo_image?: string | null;
          navbar_social_facebook?: string | null;
          navbar_social_instagram?: string | null;
          language?: string | null;
          enable_dark_mode?: boolean | null;
          enable_weather?: boolean | null;
          header_alerts?: Json[] | null;
          navigation_links?: Json[] | null;
          font_size?: string | null;
          footer_primary_color?: string;
          footer_secondary_color?: string;
          footer_text_color?: string;
          footer_contact_email?: string | null;
          footer_contact_phone?: string | null;
          footer_address?: string | null;
          footer_address_cep?: string | null;
          footer_social_facebook?: string | null;
          footer_social_instagram?: string | null;
          footer_schedule?: string | null;
          footer_copyright_text?: string;
          meta_title?: string;
          meta_description?: string;
          meta_author?: string;
          meta_image?: string;
          button_primary_color?: string;
          button_secondary_color?: string;
          bottom_nav_primary_color?: string;
          bottom_nav_secondary_color?: string;
          bottom_nav_text_color?: string;
          bottom_nav_icon_color?: string;
          high_contrast?: boolean | null;
          location_lat?: number | null;
          location_lng?: number | null;
          location_city?: string | null;
          location_state?: string | null;
          location_country?: string | null;
          weather_api_key?: string | null;
          version?: number | null;
          login_text_color?: string;
          signup_text_color?: string;
          pwa_name?: string | null;
          pwa_short_name?: string | null;
          pwa_description?: string | null;
          pwa_theme_color?: string | null;
          pwa_background_color?: string | null;
          pwa_install_message?: string | null;
          pwa_app_icon?: string | null;
          admin_accent_color?: string;
          admin_background_color?: string;
          admin_card_color?: string;
          admin_header_color?: string;
          admin_hover_color?: string;
          admin_sidebar_color?: string;
          admin_text_color?: string;
          favorite_heart_color?: string;
          buy_button_color?: string;
          buy_button_text?: string;
        }
      }
      places: {
        Row: {
          id: string
          created_at?: string
          name: string
          description: string
          address: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          address: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          address?: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
      }
      stores: {
        Row: {
          id: string
          created_at?: string
          name: string
          description: string
          address: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          description: string
          address: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          description?: string
          address?: string
          owner_name?: string | null
          opening_hours?: string | null
          entrance_fee?: string | null
          maps_url?: string | null
          phone?: string | null
          whatsapp?: string | null
          website?: string | null
          image?: string | null
          images?: string[]
          video_urls?: string[]
          category_id?: string
          social_media?: {
            facebook?: string
            instagram?: string
          } | null
          user_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          background_color?: string
          page_type?: string
          slug?: string
          created_at?: string
        }
        Insert: {
          id?: string
          name: string
          background_color?: string
          page_type?: string
          slug?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          background_color?: string
          page_type?: string
          slug?: string
          created_at?: string
        }
      }
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          event_date: string;
          event_time: string;
          end_time: string;
          location?: string;
          maps_url?: string;
          entrance_fee?: string;
          created_at: string;
          button_color?: string;
          button_secondary_color?: string;
          video_url?: string;
          image?: string;
          images?: string[];
          category_id?: string;
        }
      }
    }
  }
}

export interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}
