
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'news' | 'event' | 'system' | 'follow';
  reference_id?: string;
  read: boolean;
  created_at: string;
  publication_title?: string;
  publication_description?: string;
  publication_category?: string;
  publication_date?: string;
  user_id: string;
  sender_id?: string;
  sender?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
  // Add any missing fields from the database
  titulo?: string;
  mensagem?: string;
  tipo?: string;
  lido?: boolean;
  criado_em?: string;
  id_usuario?: string;
  id_remetente?: string;
}
