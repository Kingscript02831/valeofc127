
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import { useSiteConfig, type SiteConfig } from "@/hooks/useSiteConfig";

const Config = () => {
  const navigate = useNavigate();
  const { data: existingConfig, isLoading } = useSiteConfig();
  const [config, setConfig] = useState<Partial<SiteConfig>>({
    product_card_primary_color: "#FF69B4",
    product_card_secondary_color: "#FFB6C1",
    product_page_background_color: "#FFFFFF",
    product_text_color: "#FFFFFF",
    product_price_color: "#FFFFFF",
    product_location_color: "#FFFFFF",
  });

  useEffect(() => {
    if (existingConfig) {
      setConfig(existingConfig);
    }
  }, [existingConfig]);

  const handleConfigUpdate = async () => {
    try {
      if (!existingConfig?.id) {
        toast.error("Configuração não encontrada");
        return;
      }

      const { error } = await supabase
        .from("site_configuration")
        .update({
          product_card_primary_color: config.product_card_primary_color,
          product_card_secondary_color: config.product_card_secondary_color,
          product_page_background_color: config.product_page_background_color,
          product_text_color: config.product_text_color,
          product_price_color: config.product_price_color,
          product_location_color: config.product_location_color
        })
        .eq("id", existingConfig.id);

      if (error) {
        console.error("Error updating config:", error);
        throw error;
      }
      
      toast.success("Configurações atualizadas com sucesso!");
      navigate("/products");
    } catch (error) {
      console.error("Error updating config:", error);
      toast.error("Erro ao atualizar configurações. Por favor, tente novamente.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <SubNav />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel De Configurações</h1>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="navbar">Navbar</TabsTrigger>
            <TabsTrigger value="footer">Rodapé</TabsTrigger>
            <TabsTrigger value="bottom-nav">Barra</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="pwa">PWA</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cores dos Cartões de Produtos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="product_card_primary_color">Cor Primária do Cartão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product_card_primary_color"
                      type="color"
                      value={config.product_card_primary_color}
                      onChange={(e) => setConfig({ ...config, product_card_primary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.product_card_primary_color}
                      onChange={(e) => setConfig({ ...config, product_card_primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="product_card_secondary_color">Cor Secundária do Cartão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product_card_secondary_color"
                      type="color"
                      value={config.product_card_secondary_color}
                      onChange={(e) => setConfig({ ...config, product_card_secondary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.product_card_secondary_color}
                      onChange={(e) => setConfig({ ...config, product_card_secondary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="product_page_background_color">Cor do Fundo da Página</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product_page_background_color"
                      type="color"
                      value={config.product_page_background_color}
                      onChange={(e) => setConfig({ ...config, product_page_background_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.product_page_background_color}
                      onChange={(e) => setConfig({ ...config, product_page_background_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="product_text_color">Cor do Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product_text_color"
                      type="color"
                      value={config.product_text_color}
                      onChange={(e) => setConfig({ ...config, product_text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.product_text_color}
                      onChange={(e) => setConfig({ ...config, product_text_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="product_price_color">Cor do Preço</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product_price_color"
                      type="color"
                      value={config.product_price_color}
                      onChange={(e) => setConfig({ ...config, product_price_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.product_price_color}
                      onChange={(e) => setConfig({ ...config, product_price_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="product_location_color">Cor da Localização</Label>
                  <div className="flex gap-2">
                    <Input
                      id="product_location_color"
                      type="color"
                      value={config.product_location_color}
                      onChange={(e) => setConfig({ ...config, product_location_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.product_location_color}
                      onChange={(e) => setConfig({ ...config, product_location_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleConfigUpdate}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Config;
