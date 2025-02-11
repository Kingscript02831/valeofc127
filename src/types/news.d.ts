
import type { InstagramMedia } from './instagram';
import type { Json } from '../../types/supabase';

export interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  category_id: string | null;
  image: string | null;
  video: string | null;
  button_color: string | null;
  instagram_media: InstagramMedia[] | null;
  created_at: string;
  updated_at: string;
  images?: string[];
}

export interface NewsInput {
  title: string;
  content: string;
  category_id?: string | null;
  image?: string | null;
  video?: string | null;
  button_color?: string | null;
  instagram_media?: Json;
  images?: string[];
}
