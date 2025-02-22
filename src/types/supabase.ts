
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
      news: {
        Row: {
          id: string;
          title: string;
          content: string;
          date: string;
          category_id: string | null;
          images: string[] | null;
          video_urls: string[] | null;
          button_color: string | null;
          created_at: string;
          user_id: string | null;
        }
        Insert: {
          id?: string;
          title: string;
          content: string;
          date?: string;
          category_id?: string | null;
          images?: string[] | null;
          video_urls?: string[] | null;
          button_color?: string | null;
          created_at?: string;
          user_id?: string | null;
        }
      }
      categories: {
        Row: {
          id: string;
          name: string;
          background_color?: string;
        }
      }
    }
  }
}
