
export interface Post {
  id: string;
  user_id: string;
  content: string;
  images: string[];
  video_urls: string[];
  likes: number;
  created_at: string;
  user?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    city?: string;
  };
  post_likes?: {
    reaction_type?: string;
    user_id?: string;
  }[];
  post_comments?: {
    id: string;
  }[];
}
