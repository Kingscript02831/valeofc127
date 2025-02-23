
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
      }
    }
  }
}
