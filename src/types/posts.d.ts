
export interface Post {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  images: string[];
  location?: {
    latitude: number;
    longitude: number;
  } | null;
  location_name?: string | null;
  username: string;
  avatar_url: string;
  view_count: number;
  comment_count: number;
  is_verified: boolean;
}
