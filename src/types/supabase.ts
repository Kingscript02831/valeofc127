
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          images: string[];
          video_urls: string[];
          created_at: string;
        },
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          images?: string[];
          video_urls?: string[];
          created_at?: string;
        }
      },
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        },
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        }
      },
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
          updated_at: string | null;
          created_at: string | null;
        }
      },
      post_likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          reaction_type: string | null;
          created_at: string;
        },
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          reaction_type?: string;
          created_at?: string;
        }
      }
    }
  }
}
