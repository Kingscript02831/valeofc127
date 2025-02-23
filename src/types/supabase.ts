
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
      site_configuration: {
        Row: {
          id: string
          created_at: string
          navbar_color: string | null
          primary_color: string | null
          text_color: string | null
          like_emoji: string | null
          love_emoji: string | null
          haha_emoji: string | null
          sad_emoji: string | null
          angry_emoji: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          navbar_color?: string | null
          primary_color?: string | null
          text_color?: string | null
          like_emoji?: string | null
          love_emoji?: string | null
          haha_emoji?: string | null
          sad_emoji?: string | null
          angry_emoji?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          navbar_color?: string | null
          primary_color?: string | null
          text_color?: string | null
          like_emoji?: string | null
          love_emoji?: string | null
          haha_emoji?: string | null
          sad_emoji?: string | null
          angry_emoji?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
