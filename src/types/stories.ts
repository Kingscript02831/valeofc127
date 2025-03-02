
export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  media_type?: string;
  duration?: number;
  created_at: string;
  expires_at: string;
  viewed?: boolean;
  user?: {
    username: string;
    full_name: string;
    avatar_url: string;
  };
}

export interface StoryView {
  id: string;
  story_id: string;
  viewer_id: string;
  viewed_at: string;
}
