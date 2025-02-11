
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../../types/supabase";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const defaultConfig: SiteConfig = {
  id: "default",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  theme_name: "light",
  primary_color: "#1A1F2C",
  secondary_color: "#D6BCFA",
  background_color: "#FFFFFF",
  text_color: "#1A1F2C",
  navbar_color: "#D6BCFA",
  button_primary_color: "#9b87f5",
  button_secondary_color: "#7E69AB",
  navbar_logo_type: "text",
  navbar_logo_text: "VALEOFC",
  navbar_logo_image: null,
  navbar_social_facebook: null,
  navbar_social_instagram: null,
  language: "pt-BR",
  enable_dark_mode: false,
  enable_weather: false,
  header_alerts: [],
  navigation_links: [],
  font_size: "medium",
  footer_primary_color: "#1A1F2C",
  footer_secondary_color: "#D6BCFA",
  footer_text_color: "#FFFFFF",
  footer_contact_email: null,
  footer_contact_phone: null,
  footer_address: null,
  footer_address_cep: null,
  footer_social_facebook: null,
  footer_social_instagram: null,
  footer_schedule: null,
  footer_copyright_text: "© 2025 VALEOFC. Todos os direitos reservados.",
  meta_title: 'vale-news-hub',
  meta_description: 'Lovable Generated Project',
  meta_author: 'Lovable',
  meta_image: '/og-image.png',
  bottom_nav_primary_color: "#1A1F2C",
  bottom_nav_secondary_color: "#D6BCFA",
  bottom_nav_text_color: "#FFFFFF",
  bottom_nav_icon_color: "#FFFFFF",
  high_contrast: false,
  location_lat: null,
  location_lng: null,
  location_city: null,
  location_state: null,
  location_country: null,
  weather_api_key: null,
  version: 1,
  login_text_color: "#1A1F2C",
  signup_text_color: "#1A1F2C"
};

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching site configuration:', error);
        return defaultConfig;
      }
      
      if (!data) {
        console.log('No configuration found, using default config');
        return defaultConfig;
      }
      
      return {
        ...defaultConfig,
        ...data
      };
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
    initialData: defaultConfig
  });
}
