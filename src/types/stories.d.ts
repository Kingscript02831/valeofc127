
export interface Story {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type: 'image' | 'video';
  created_at: string;
  expires_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

export interface StoryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  imageUrl: string;
  storyId: string;
}

export interface StoryCircleProps {
  imageUrl: string;
  username: string;
  isNew?: boolean;
  isOwn?: boolean;
  isViewed?: boolean;
}
