
export interface Story {
  id: string;
  user_id: string;
  media_url: string;
  caption?: string;
  created_at: string;
  expires_at: string;
  media_type: 'image' | 'video';
}

export interface StoryGroup {
  user_id: string;
  username: string;
  avatar_url: string;
  stories: Story[];
}
