
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
        .limit(1)
        .single();
      
      if (error) {
        console.error("Error fetching site configuration:", error);
        throw error;
      }
      
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
  });
}
