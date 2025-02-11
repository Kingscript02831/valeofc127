
import type { Database } from "../integrations/supabase/types";

export type Place = Database["public"]["Tables"]["places"]["Row"];

export interface PlaceFormData {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  postal_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  website?: string | null;
  image?: string | null;
  images?: string[] | null;
  opening_hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
  } | null;
  category_id?: string | null;
  user_id?: string | null;
  owner_name?: string | null;
  entrance_fee?: string | null;
  whatsapp?: string | null;
  maps_url?: string | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
  } | null;
}
