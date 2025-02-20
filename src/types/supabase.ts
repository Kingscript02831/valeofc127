
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
          location_id?: string
          images: string[]
          video_urls?: string[]
          whatsapp?: string
          created_at?: string
          updated_at?: string
        }
      }
      locations: {
        Row: {
          id: string
          name: string
          state: string
          created_at: string
        }
      }
      site_configuration: {
        Row: {
          id: string
          primary_color: string
          secondary_color: string
          text_color: string
          background_color: string
          navbar_color: string
          footer_primary_color: string
          footer_secondary_color: string
          footer_text_color: string
          button_primary_color: string
          button_secondary_color: string
          bottom_nav_primary_color: string
          bottom_nav_secondary_color: string
          bottom_nav_text_color: string
          bottom_nav_icon_color: string
          created_at: string
          updated_at: string
        }
      }
    }
  }
}
