
import type { Database } from "../../types/supabase";
import type { Json } from "../../types/supabase";

export type Store = {
  id: string;
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
  file_path?: string | null;
  file_paths?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  category_id?: string | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
  } | null;
  created_at?: string;
  user_id?: string;
  file_metadata?: Json | null;
  files_metadata?: Json[] | null;
}

export interface StoreFormData extends Omit<Store, 'id' | 'created_at'> {}
