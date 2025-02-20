
export interface Database {
  public: {
    Tables: {
      site_configuration: {
        Row: {
          id: string;
          background_color: string;
          bottom_nav_icon_color: string;
          bottom_nav_primary_color: string;
          bottom_nav_secondary_color: string;
          bottom_nav_text_color: string;
          button_primary_color: string;
          button_secondary_color: string;
          created_at: string;
          footer_primary_color: string;
          footer_secondary_color: string;
          footer_text_color: string;
          navbar_color: string;
          navbar_logo_image: string | null;
          navbar_logo_text: string | null;
          navbar_logo_type: string;
          navbar_social_facebook: string | null;
          navbar_social_instagram: string | null;
          primary_color: string;
          secondary_color: string;
          text_color: string;
          updated_at: string;
        }
      }
      locations: {
        Row: {
          id: string;
          name: string;
          state: string;
          created_at: string;
        }
      }
    }
  }
}
