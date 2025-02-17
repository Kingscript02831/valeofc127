
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SiteConfig {
  navbar_color: string;
  primary_color: string;
  text_color: string;
  bottom_nav_primary_color: string;
  bottom_nav_secondary_color: string;
  bottom_nav_text_color: string;
  bottom_nav_icon_color: string;
  navbar_logo_type: 'text' | 'image';
  navbar_logo_text?: string;
  navbar_logo_image?: string;
  navbar_social_facebook?: string;
  navbar_social_instagram?: string;
}

export const useSiteConfig = () => {
  return useQuery({
    queryKey: ["site-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .single();

      if (error) throw error;
      return data as SiteConfig;
    },
  });
};
