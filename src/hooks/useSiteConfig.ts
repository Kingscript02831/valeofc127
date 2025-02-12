
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface SiteConfig {
  navbar_color?: string;
  primary_color?: string;
  bottom_nav_primary_color?: string;
  bottom_nav_secondary_color?: string;
  bottom_nav_icon_color?: string;
  bottom_nav_text_color?: string;
}

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .maybeSingle();
      
      if (error) throw error;
      if (!data) throw new Error("No site configuration found");
      
      return data as SiteConfig;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
