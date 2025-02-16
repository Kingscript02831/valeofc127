
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";

export type SiteConfig = {
  id: string;
  navbar_color: string;
  primary_color: string;
  text_color: string;
  navbar_logo_type: 'text' | 'image';
  navbar_logo_text: string;
  navbar_logo_image: string | null;
  navbar_social_facebook: string | null;
  navbar_social_instagram: string | null;
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
      if (!data) throw new Error("No site configuration found");
      
      return data as SiteConfig;
    },
    staleTime: Infinity, // Nunca considerar os dados obsoletos
    gcTime: Infinity, // Nunca remover do cache
    refetchOnWindowFocus: false, // Não recarregar ao focar a janela
    refetchOnMount: false, // Não recarregar ao montar o componente
    refetchOnReconnect: false, // Não recarregar ao reconectar
    retry: false, // Não tentar novamente em caso de erro
    cacheTime: Infinity, // Manter no cache indefinidamente
  });
}
