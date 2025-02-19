
import { Database } from "@/integrations/supabase/types";

export interface Location {
  id: string;
  name: string;
  state: string;
  created_at: string;
}

export interface LocationInput {
  name: string;
  state: string;
}

// Tipos específicos para o Supabase
export type LocationRow = Database['public']['Tables']['locations']['Row'];
export type LocationInsert = Database['public']['Tables']['locations']['Insert'];
export type LocationUpdate = Database['public']['Tables']['locations']['Update'];
