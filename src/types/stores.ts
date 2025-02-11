
import type { Database } from "../../types/supabase";

export type Store = Database["public"]["Tables"]["stores"]["Row"];

export interface StoreFormData {
  name: string;
  description: string;
  address: string;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  owner_name?: string | null;
  opening_hours?: string | null;
  entrance_fee?: string | null;
  maps_url?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  website?: string | null;
  image?: string | null;
  images?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  category_id?: string | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
  } | null;
}
