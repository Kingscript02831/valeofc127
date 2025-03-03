
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  updated_at?: string | null;
  created_at?: string | null;
  status?: string | null;
  city?: string | null;
  cover_url?: string | null;
  relationship_status?: string | null;
  birth_date?: string | null;
  instagram_url?: string | null;
}
