
import type { Database } from "../integrations/supabase/types";

export type Store = Database["public"]["Tables"]["stores"]["Row"];

export interface StoreFormData extends Partial<Store> {
  name: string;
  address: string;
  description: string;
  maps_url?: string;
  owner_name?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  image?: string;
  social_media?: {
    facebook?: string;
    instagram?: string;
  };
}
