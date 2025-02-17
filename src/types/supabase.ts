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
      products: {
        Row: {
          id: string
          title: string
          description: string
          price: number
          condition: string
          category_id?: string
          user_id: string
          whatsapp?: string
          latitude?: number
          longitude?: number
          location_name?: string
          images: string[]
          video_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          created_at?: string
        }
      }
      news: {
        Row: {
          id: string
          title: string
          content: string
          date: string
          created_at?: string
          user_id?: string
          category_id?: string
          button_color?: string
          images?: string[]
          video_urls?: string[]
          instagram_media?: InstagramMedia[]
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          background_color?: string
        }
      }
    }
  }
}

export interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}
