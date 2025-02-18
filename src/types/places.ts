
import { Database } from "./supabase";

export type Place = Database["public"]["Tables"]["places"]["Row"];
