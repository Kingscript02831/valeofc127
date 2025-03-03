
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'news' | 'event' | 'system' | 'mention';
  reference_id?: string;
  read: boolean;
  created_at: string;
  publication_title?: string;
  publication_description?: string;
  publication_category?: string;
  publication_date?: string;
  user_id: string;
  sender?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string;
  };
}
