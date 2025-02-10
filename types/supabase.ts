
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
          header_alerts: any | null
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
          navigation_links: any | null
          primary_color: string
          secondary_color: string
          text_color: string
          theme_name: string
          updated_at: string
          version: number | null
          weather_api_key: string | null
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: "news" | "comment" | "like" | "follow";
          reference_id: string | null;
          read: boolean;
          created_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          name: string;
          username: string | null;
          phone: string | null;
          birth_date: string | null;
          street: string | null;
          house_number: string | null;
          city: string | null;
          postal_code: string | null;
          avatar_url: string | null;
          bio: string | null;
          website: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};
