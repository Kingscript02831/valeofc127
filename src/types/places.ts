
import type { Database } from "../integrations/supabase/types";
import type { FileMetadata } from "./files";

export type Place = Database["public"]["Tables"]["places"]["Row"];

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
  file_metadata?: FileMetadata | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
  } | null;
}
