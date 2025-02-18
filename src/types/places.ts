
import { Database } from "./supabase";

export type Place = Database["public"]["Tables"]["places"]["Row"];

export interface PlaceWithCategory extends Place {
  categories?: {
    name: string;
    background_color?: string | null;
  } | null;
}

export type PlaceFormData = Omit<Place, "id" | "created_at">;
