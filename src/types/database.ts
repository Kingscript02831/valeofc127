
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
