
import type { Database as SupabaseDatabase } from "@/integrations/supabase/types";

// Re-export the base types from Supabase
export type Database = SupabaseDatabase;

// Define notification-related types
export interface Notification {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  reference_id?: string;
  publication_title?: string;
  publication_description?: string;
  publication_date?: string;
  read: boolean;
  follower_id?: string;
  follower?: Profile;
}

// Define profile-related types
export interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  website?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  email?: string;
  phone?: string;
  is_blocked?: boolean;
  birth_date?: string;
  basic_info_updated_at?: string;
  scheduled_deletion_date?: string;
  location_id?: string;
  location_name?: string;
  cover_url?: string;
  status?: string;
  relationship_status?: string;
  instagram_url?: string;
}

// Define follower relationship types
export interface Follower {
  id: string;
  follower_id: string;
  followed_id: string;
  created_at: string;
  follower?: Profile;
  followed?: Profile;
}

// Define chat and message types
export interface Chat {
  id: string;
  created_at: string;
  updated_at: string;
  participants: ChatParticipant[];
  messages: Message[];
}

export interface ChatParticipant {
  id: string;
  chat_id: string;
  user_id: string;
  created_at: string;
  user?: Profile;
}

export interface Message {
  id: string;
  chat_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  read: boolean;
  deleted: boolean;
  sender?: Profile;
}

// Define event types
export interface Event {
  id: string;
  created_at: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  end_time?: string;
  location?: string;
  address?: string;
  category_id?: string;
  image?: string;
  images?: string[];
  user_id: string;
  price?: number;
  contact_phone?: string;
  contact_email?: string;
  website?: string;
  tags?: string[];
  category?: Category;
}

// Define category types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  page_type: 'events' | 'places' | 'news' | 'products';
  background_color?: string;
  updated_at: string;
  parent_id?: string;
}

// Define place types
export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  whatsapp?: string;
  website?: string;
  opening_hours?: string;
  category_id?: string;
  owner_name?: string;
  entrance_fee?: string;
  image?: string;
  images?: string[];
  video_urls?: string[];
  maps_url?: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  social_media?: string[];
  category?: Category;
}

// Define news types
export interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  category_id?: string;
  images?: string[];
  video_urls?: string[];
  button_color?: string;
  instagram_media?: InstagramMedia[];
  created_at: string;
  updated_at: string;
  user_id: string;
  categories?: Category;
}

export interface InstagramMedia {
  url: string;
  type: 'post' | 'video';
}

// Define product types
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  condition: 'novo' | 'usado' | 'recondicionado';
  images?: string[];
  video_urls?: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  whatsapp?: string;
  location_id?: string;
  location_name?: string;
  latitude?: number;
  longitude?: number;
}
