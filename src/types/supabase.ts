
// Esta é uma declaração de tipo para a Supabase
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string;
          avatar_url: string;
          website: string;
          updated_at: string;
          created_at: string;
          city: string;
          cover_url: string;
          status: string;
          birth_date: string;
          relationship_status: string;
          instagram_url: string;
          location_id: string | null;
        };
        Insert: {
          id: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          website?: string;
          updated_at?: string;
          created_at?: string;
          city?: string;
          cover_url?: string;
          status?: string;
          birth_date?: string;
          relationship_status?: string;
          instagram_url?: string;
          location_id?: string | null;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string;
          avatar_url?: string;
          website?: string;
          updated_at?: string;
          created_at?: string;
          city?: string;
          cover_url?: string;
          status?: string;
          birth_date?: string;
          relationship_status?: string;
          instagram_url?: string;
          location_id?: string | null;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string | null;
          images: string[] | null;
          video_urls: string[] | null;
          likes: number | null;
          created_at: string;
          location_id: string | null;
          location_name: string | null;
          latitude: number | null;
          longitude: number | null;
          view_count: number | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          content?: string | null;
          images?: string[] | null;
          video_urls?: string[] | null;
          likes?: number | null;
          created_at?: string;
          location_id?: string | null;
          location_name?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          view_count?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string | null;
          images?: string[] | null;
          video_urls?: string[] | null;
          likes?: number | null;
          created_at?: string;
          location_id?: string | null;
          location_name?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          view_count?: number | null;
        };
      };
      post_likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          reaction_type: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          reaction_type?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          reaction_type?: string;
          created_at?: string;
        };
      };
      post_comments: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          content: string;
          reply_to_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          content: string;
          reply_to_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          content?: string;
          reply_to_id?: string | null;
          created_at?: string;
        };
      };
      post_views: {
        Row: {
          id: string;
          post_id: string;
          user_id: string | null;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string | null;
          ip_address?: string | null;
          created_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          state: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          state: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          state?: string;
          created_at?: string;
        };
      };
      // We'll need to preserve the existing tables that are referenced in the errors
      site_configuration: {
        Row: {
          id: string;
          site_name: string;
          site_description: string;
          logo_url: string;
          primary_color: string;
          secondary_color: string;
          updated_at: string;
          pwa_name: string;
          pwa_short_name: string;
          pwa_description: string;
          pwa_theme_color: string;
          pwa_background_color: string;
          pwa_app_icon: string;
        };
        Insert: {
          id?: string;
          site_name?: string;
          site_description?: string;
          logo_url?: string;
          primary_color?: string;
          secondary_color?: string;
          updated_at?: string;
          pwa_name?: string;
          pwa_short_name?: string;
          pwa_description?: string;
          pwa_theme_color?: string;
          pwa_background_color?: string;
          pwa_app_icon?: string;
        };
        Update: {
          id?: string;
          site_name?: string;
          site_description?: string;
          logo_url?: string;
          primary_color?: string;
          secondary_color?: string;
          updated_at?: string;
          pwa_name?: string;
          pwa_short_name?: string;
          pwa_description?: string;
          pwa_theme_color?: string;
          pwa_background_color?: string;
          pwa_app_icon?: string;
        };
      };
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          created_at: string;
          images: string[] | null;
          video_urls: string[] | null;
          category_id: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          created_at?: string;
          images?: string[] | null;
          video_urls?: string[] | null;
          category_id?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          images?: string[] | null;
          video_urls?: string[] | null;
          category_id?: string | null;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          background_color: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          background_color?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          background_color?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string;
          location: string;
          start_date: string;
          end_date: string;
          images: string[] | null;
          category_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          location: string;
          start_date: string;
          end_date: string;
          images?: string[] | null;
          category_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          location?: string;
          start_date?: string;
          end_date?: string;
          images?: string[] | null;
          category_id?: string | null;
          created_at?: string;
        };
      };
      places: {
        Row: {
          id: string;
          name: string;
          description: string;
          address: string;
          phone: string;
          website: string | null;
          instagram: string | null;
          facebook: string | null;
          whatsapp: string | null;
          images: string[] | null;
          is_featured: boolean;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
          category_id: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          address: string;
          phone: string;
          website?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          whatsapp?: string | null;
          images?: string[] | null;
          is_featured?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          category_id?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          address?: string;
          phone?: string;
          website?: string | null;
          instagram?: string | null;
          facebook?: string | null;
          whatsapp?: string | null;
          images?: string[] | null;
          is_featured?: boolean;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
          category_id?: string | null;
        };
      };
      // Adicione outras tabelas conforme necessário
    };
  };
}
