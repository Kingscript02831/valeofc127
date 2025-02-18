
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type SiteConfig = {
  id: string;
  background_color: string;
  bottom_nav_icon_color: string;
  bottom_nav_primary_color: string;
  bottom_nav_secondary_color: string;
  bottom_nav_text_color: string;
  button_primary_color: string;
  button_secondary_color: string;
  created_at: string;
  navbar_color: string;
  primary_color: string;
  text_color: string;
  buy_button_color: string;
  buy_button_text: string;
  favorite_heart_color: string;
  whatsapp_message: string;
};

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
