
export interface Story {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  username?: string;
  avatar_url?: string;
  isOwn?: boolean;
  isNew?: boolean;
}
