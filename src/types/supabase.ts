
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
        };
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: 'news' | 'event' | 'system';
          reference_id?: string;
          read: boolean;
          created_at: string;
          publication_title?: string;
          publication_description?: string;
          publication_category?: string;
          publication_date?: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          type: 'news' | 'event' | 'system';
          reference_id?: string;
          read?: boolean;
          created_at?: string;
          publication_title?: string;
          publication_description?: string;
          publication_category?: string;
          publication_date?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          type?: 'news' | 'event' | 'system';
          reference_id?: string;
          read?: boolean;
          created_at?: string;
          publication_title?: string;
          publication_description?: string;
          publication_category?: string;
          publication_date?: string;
          user_id?: string;
        };
      };
      // Adicione outras tabelas conforme necessário
    };
  };
}
