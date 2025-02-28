
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
      // Adicione outras tabelas conforme necessário
    };
  };
}
