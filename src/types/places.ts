
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
  opening_hours?: any | null;
  category_id?: string | null;
  user_id?: string | null;
}
