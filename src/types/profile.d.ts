
export interface Profile {
  id: string;
  created_at?: string;
  updated_at?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  cover_url?: string;
  website?: string;
  status?: string;
  city?: string;
  theme_preference?: 'light' | 'dark' | 'system';
}
