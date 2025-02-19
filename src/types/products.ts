
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  category_id?: string;
  user_id: string;
  latitude?: number;
  longitude?: number;
  location_name?: string;
  location_id?: string;
  images: string[];
  video_urls?: string[];
  whatsapp?: string;
  created_at?: string;
  updated_at?: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
    location_id?: string | null;
  };
}

export interface ProductWithDistance extends Product {
  distance: number;
}

export interface ProductFormData {
  title: string;
  description: string;
  price: number;
  condition: string;
  category_id?: string;
  images: string[];
  video_urls?: string[];
  location_name?: string;
  location_id?: string;
  whatsapp?: string;
}
