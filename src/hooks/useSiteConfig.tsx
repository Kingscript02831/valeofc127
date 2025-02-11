
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../../types/supabase";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];

const defaultConfig: Partial<SiteConfig> = {
  primary_color: "#1A1F2C",
  secondary_color: "#D6BCFA",
  text_color: "#1A1F2C",
  navbar_color: "#D6BCFA",
  button_primary_color: "#9b87f5",
  button_secondary_color: "#7E69AB",
  footer_primary_color: "#1A1F2C",
  footer_secondary_color: "#D6BCFA",
  footer_text_color: "#FFFFFF",
};

export function useSiteConfig() {
  return useQuery({
    queryKey: ['site-configuration'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .maybeSingle();
      
      if (error) throw error;
      
      // Se não houver configuração, retorna as cores padrão
      if (!data) {
        return {
          ...defaultConfig,
          id: "default",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          theme_name: "light",
          background_color: "#FFFFFF",
          navbar_logo_type: "text",
          navbar_logo_text: "VALEOFC",
          navbar_logo_image: null,
          language: "pt-BR",
          version: 1,
        } as SiteConfig;
      }
      
      return data;
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 2,
  });
}
