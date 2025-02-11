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
      site_configuration: {
        Row: {
          id: string;
          background_color: string
          bottom_nav_icon_color: string
          bottom_nav_primary_color: string
          bottom_nav_secondary_color: string
          bottom_nav_text_color: string
          button_primary_color: string
          button_secondary_color: string
          created_at: string
          enable_dark_mode: boolean | null
          enable_weather: boolean | null
          font_size: string | null
          footer_address: string | null
          footer_address_cep: string | null
          footer_contact_email: string | null
          footer_contact_phone: string | null
          footer_copyright_text: string | null
          footer_primary_color: string
          footer_schedule: string | null
          footer_secondary_color: string
          footer_social_facebook: string | null
          footer_social_instagram: string | null
          footer_text_color: string
          header_alerts: Json | null
          high_contrast: boolean | null
          language: string | null
          location_city: string | null
          location_country: string | null
          location_lat: number | null
          location_lng: number | null
          location_state: string | null
          meta_author: string | null
          meta_description: string | null
          meta_image: string | null
          meta_title: string | null
          navbar_color: string
          navbar_logo_image: string | null
          navbar_logo_text: string | null
          navbar_logo_type: string
          navbar_social_facebook: string | null
          navbar_social_instagram: string | null
          navigation_links: Json | null
          primary_color: string
          secondary_color: string
          text_color: string
          theme_name: string
          updated_at: string
          version: number | null
          weather_api_key: string | null
          login_text_color: string
          signup_text_color: string
          admin_sidebar_color: string
          admin_header_color: string
          admin_text_color: string
          admin_accent_color: string
          admin_background_color: string
          admin_card_color: string
          admin_hover_color: string
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
          owner_name?: string;
          phone?: string;
          social_media?: Json;
          website?: string;
          whatsapp?: string;
        }
      }
      categories: {
        Row: {
          id: string;
          name: string;
          background_color?: string;
          page_type: string;
        }
      }
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          date: string;
          created_at: string;
          category_id?: string;
          button_color?: string;
          button_secondary_color?: string;
          image?: string;
          video?: string;
          instagram_media?: Json;
        }
      }
    }
  }
}
