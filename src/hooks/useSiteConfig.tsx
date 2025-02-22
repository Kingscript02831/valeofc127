
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/types/supabase";

export type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .single();
      
      if (error) throw error;
      if (!data) throw new Error("No site configuration found");
      
      return data as SiteConfig;
    },
  });
}
