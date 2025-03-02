
// Define post related interfaces
export interface PostLike {
  user_id: string;
}

export interface PostProfile {
  id: string;
  username: string;
  avatar_url: string;
}

export interface PostType {
  id: string;
  created_at: string;
  content: string;
  media_url?: string;
  user_id: string;
  location?: string;
  likes: PostLike[];
  username: string;
  avatar_url: string;
  profiles?: PostProfile;
}
