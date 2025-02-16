
import type { Database } from "../integrations/supabase/types";

export type Place = Database['public']['Tables']['places']['Row'];

export interface PlaceFormData {
  name: string;
  description: string;
  address: string;
  owner_name?: string | null;
  opening_hours?: string | null;
  entrance_fee?: string | null;
  maps_url?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  image?: string | null;
  images?: string[];
  video_urls?: string[];
  category_id?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
  } | null;
}
