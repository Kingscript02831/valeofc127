
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
          latitude?: number
          longitude?: number
          location_name?: string
          images: string[]
          video_urls?: string[]
          whatsapp?: string
          created_at?: string
          updated_at?: string
        }
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          product_id: string
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
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
          button_secondary_color?: string
          images?: string[]
          video_urls?: string[]
          instagram_media?: InstagramMedia[]
          file_metadata?: Json
          files_metadata?: Json[]
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          background_color?: string
          slug?: string
          description?: string
          page_type?: string
          parent_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

export interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}
