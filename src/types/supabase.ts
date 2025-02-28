
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
      // Adicione outras tabelas conforme necessário
    };
  };
}
