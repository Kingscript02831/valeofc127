import { createClient } from '@supabase/supabase-js';

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: {
          id: string;
          name: string;
          state: string;
          created_at: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          location_id: string | null;
          // ... other profile fields
        };
      };
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
          navbar_color: string;
          primary_color: string;
          text_color: string;
          signup_text_color: string;
          login_text_color: string;
          // ... other config fields
        };
      };
    };
  };
}

const SUPABASE_URL = "https://cxnktrfpqjjkdfmiyhdz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bmt0cmZwcWpqa2RmbWl5aGR6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkyNDAyNDksImV4cCI6MjA1NDgxNjI0OX0.GwEFcZ0mI8xuZs1hGJgz8R2zp13cLJIbtu6ZY2nDeTU";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
