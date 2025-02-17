
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../integrations/supabase/client";
import { ProductTheme, ProductPageConfig } from "../types/product-theme";
import { useToast } from "../components/ui/use-toast";

export function useProductTheme(pageType: 'list' | 'details' | 'form') {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar tema atual
  const { data: theme, isLoading: themeLoading } = useQuery({
    queryKey: ['productTheme', pageType],
    queryFn: async () => {
      // Primeiro, busca a configuração da página
      const { data: pageConfig, error: pageError } = await supabase
        .from('product_page_configs')
        .select('*, theme:product_themes(*)')
        .eq('page_type', pageType)
        .single();

      if (pageError) {
        toast({
          title: "Erro ao carregar tema",
          description: "Não foi possível carregar as configurações de tema.",
          variant: "destructive",
        });
        throw pageError;
      }

      return {
        theme: pageConfig.theme as ProductTheme,
        config: pageConfig as ProductPageConfig
      };
    },
  });

  // Função para atualizar tema (apenas para admins)
  const updateTheme = async (themeId: string, updates: Partial<ProductTheme>) => {
    try {
      const { error } = await supabase
        .from('product_themes')
        .update(updates)
        .eq('id', themeId);

      if (error) throw error;

      // Invalidar cache para forçar recarregamento
      queryClient.invalidateQueries({ queryKey: ['productTheme'] });

      toast({
        title: "Tema atualizado",
        description: "As configurações do tema foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar tema",
        description: "Você precisa ser administrador para realizar esta ação.",
        variant: "destructive",
      });
    }
  };

  // Função para atualizar configurações da página (apenas para admins)
  const updatePageConfig = async (configId: string, updates: Partial<ProductPageConfig>) => {
    try {
      const { error } = await supabase
        .from('product_page_configs')
        .update(updates)
        .eq('id', configId);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['productTheme'] });

      toast({
        title: "Configurações atualizadas",
        description: "As configurações da página foram atualizadas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar configurações",
        description: "Você precisa ser administrador para realizar esta ação.",
        variant: "destructive",
      });
    }
  };

  return {
    theme: theme?.theme,
    config: theme?.config,
    isLoading: themeLoading,
    updateTheme,
    updatePageConfig,
  };
}
