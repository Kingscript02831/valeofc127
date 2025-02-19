
export interface Profile {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  cover_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  birth_date?: string | null;
  website?: string | null;
  city?: string | null;
  street?: string | null;
  house_number?: string | null;
  postal_code?: string | null;
  status?: string | null;
  basic_info_updated_at?: string | null;
  location_id?: string | null;
  is_admin?: boolean;
  theme_preference?: "dark" | "light" | "system";
}

export interface ProfileUpdateData {
  username?: string;
  full_name?: string;
  avatar_url?: string;
  cover_url?: string;
  bio?: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  website?: string;
  city?: string;
  street?: string;
  house_number?: string;
  postal_code?: string;
  status?: string;
  basic_info_updated_at?: string;
  location_id?: string;
  theme_preference?: "dark" | "light" | "system";
}
