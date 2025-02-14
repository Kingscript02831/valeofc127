
import type { Database } from "../integrations/supabase/types";
import type { FileMetadata } from "./files";

export type Event = Database["public"]["Tables"]["events"]["Row"];

export interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  end_time: string;
  file_metadata?: FileMetadata | null;
  files_metadata?: FileMetadata[] | null;
  location: string;
  maps_url?: string | null;
  url_maps_events?: string | null;
  numero_whatsapp_events?: string | null;
  entrance_fee?: string | null;
  video_url?: string | null;
  button_color?: string | null;
  button_secondary_color?: string | null;
  category_id?: string | null;
  owner_name?: string | null;
  phone?: string | null;
  website?: string | null;
  whatsapp?: string | null;
  social_media?: {
    facebook?: string;
    instagram?: string;
  } | null;
}
