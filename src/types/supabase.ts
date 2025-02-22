
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
          button_secondary_color: string | null;
          instagram_media: InstagramMedia[] | null;
          created_at: string;
        }
      }
    }
  }
}
