
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../../types/supabase";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching site configuration:", error);
        throw error;
      }
      
      if (!data) {
        console.error("No site configuration found");
        throw new Error("No site configuration found");
      }
      
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
  });
}
