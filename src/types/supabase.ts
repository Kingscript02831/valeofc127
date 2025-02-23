
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          content: string | null
          user_id: string
          created_at: string
          images: string[] | null
          video_urls: string[] | null
          likes: number | null
          view_count: number | null
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          content: string
          user_id: string
          created_at: string
        }
      }
      post_likes: {
        Row: {
          id: string
          post_id: string
          user_id: string
          created_at: string
          reaction_type: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
        }
      }
    }
  }
}
