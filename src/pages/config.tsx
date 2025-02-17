import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import Navbar2 from "@/components/Navbar2";
import SubNav2 from "@/components/SubNav2";
import type { SiteConfig } from "@/hooks/useSiteConfig";

const Admin = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<Partial<SiteConfig>>({
    navbar_color: "#FF69B4",
    primary_color: "#FFB6C1",
    text_color: "#FFFFFF",
    background_color: "#F0F0F0",
    button_primary_color: "#FF1493",
    button_secondary_color: "#C71585",
    bottom_nav_primary_color: "#FF69B4",
    bottom_nav_secondary_color: "#FFB6C1",
    bottom_nav_text_color: "#FFFFFF",
    bottom_nav_icon_color: "#FFFFFF",
    product_card_primary_color: "#FF69B4",
    product_card_secondary_color: "#FFB6C1",
    product_page_background_color: "#FFFFFF",
    product_text_color: "#FFFFFF",
    product_price_color: "#FFFFFF",
    product_location_color: "#FFFFFF",
  });

  const handleConfigUpdate = async () => {
    try {
      const { error } = await supabase
        .from("site_configuration")
        .update(config)
        .eq("id", config.id);

      if (error) throw error;
      
      toast.success("Configurações atualizadas com sucesso!");
      navigate("/products");
    } catch (error) {
      console.error("Error updating config:", error);
      toast.error("Erro ao atualizar configurações");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar2 />
      <SubNav2 />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel De Configurações</h1>

        <Tabs defaultValue="config" className="space-y-6">
          <TabsList>
            <TabsTrigger value="config">Navbar</TabsTrigger>
            <TabsTrigger value="footer">Rodapé</TabsTrigger>
            <TabsTrigger value="bottom-nav">Barra</TabsTrigger>
            <TabsTrigger value="login">Login/Registro</TabsTrigger>
            <TabsTrigger value="pwa">PWA</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cores da Navbar</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="navbar_color">Cor da Navbar</Label>
                  <div className="flex gap-2">
                    <Input
                      id="navbar_color"
                      type="color"
                      value={config.navbar_color}
                      onChange={(e) => setConfig({ ...config, navbar_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.navbar_color}
                      onChange={(e) => setConfig({ ...config, navbar_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="primary_color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary_color"
                      type="color"
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.primary_color}
                      onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="text_color">Cor do Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="text_color"
                      type="color"
                      value={config.text_color}
                      onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.text_color}
                      onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="background_color">Cor do Fundo</Label>
                  <div className="flex gap-2">
                    <Input
                      id="background_color"
                      type="color"
                      value={config.background_color}
                      onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.background_color}
                      onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Cores dos Botões</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="button_primary_color">Cor Primária do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_primary_color"
                      type="color"
                      value={config.button_primary_color}
                      onChange={(e) => setConfig({ ...config, button_primary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.button_primary_color}
                      onChange={(e) => setConfig({ ...config, button_primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="button_secondary_color">Cor Secundária do Botão</Label>
                  <div className="flex gap-2">
                    <Input
                      id="button_secondary_color"
                      type="color"
                      value={config.button_secondary_color}
                      onChange={(e) => setConfig({ ...config, button_secondary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.button_secondary_color}
                      onChange={(e) => setConfig({ ...config, button_secondary_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="bottom-nav" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Cores da Barra de Navegação Inferior</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="bottom_nav_primary_color">Cor Primária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_primary_color"
                      type="color"
                      value={config.bottom_nav_primary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_primary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_primary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bottom_nav_secondary_color">Cor Secundária</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_secondary_color"
                      type="color"
                      value={config.bottom_nav_secondary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_secondary_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_secondary_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_secondary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bottom_nav_text_color">Cor do Texto</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_text_color"
                      type="color"
                      value={config.bottom_nav_text_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_text_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_text_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_text_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bottom_nav_icon_color">Cor dos Ícones</Label>
                  <div className="flex gap-2">
                    <Input
                      id="bottom_nav_icon_color"
                      type="color"
                      value={config.bottom_nav_icon_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_icon_color: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={config.bottom_nav_icon_color}
                      onChange={(e) => setConfig({ ...config, bottom_nav_icon_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

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

export default Admin;
