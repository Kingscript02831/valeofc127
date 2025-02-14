
import type { Database } from "../integrations/supabase/types";

export type News = Database["public"]["Tables"]["news"]["Row"];

export interface NewsFormData {
  title: string;
  content: string;
  date?: string;
  file_path?: string | null;
  video?: string | null;
  button_color?: string | null;
  button_secondary_color?: string | null;
  category_id?: string | null;
  instagram_media?: {
    url: string;
    type: 'post' | 'video';
  }[] | null;
}
