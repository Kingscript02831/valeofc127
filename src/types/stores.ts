
import { Database } from "@/types/supabase";

export type Store = Database["public"]["Tables"]["stores"]["Row"];

export interface StoreWithCategory extends Store {
  categories?: {
    name: string;
    background_color?: string | null;
  } | null;
}

export type StoreFormData = Omit<Store, "id" | "created_at">;
