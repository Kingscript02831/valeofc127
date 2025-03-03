
export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  cover_url?: string | null;
  website?: string | null;
  instagram_url?: string | null;
  city?: string | null;
  status?: string | null;
  relationship_status?: string | null;
  birth_date?: string | null;
  theme_preference?: string | null;
  location_id?: string | null;
}
