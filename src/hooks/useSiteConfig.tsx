
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const defaultConfig: Partial<SiteConfig> = {
  navbar_color: '#D6BCFA',
  primary_color: '#1A1F2C',
  text_color: '#FFFFFF',
  navbar_logo_type: 'text',
  navbar_logo_text: 'VALEOFC',
  navbar_social_facebook: '',
  navbar_social_instagram: '',
};

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_configuration")
        .select("*")
        .single();
      return data;
    },
    placeholderData: defaultConfig as SiteConfig,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}
