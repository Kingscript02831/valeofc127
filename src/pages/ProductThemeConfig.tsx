
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar2 from "@/components/Navbar2";
import SubNav2 from "@/components/SubNav2";
import type { ProductTheme } from "@/types/product-theme";

const ProductThemeConfig = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentTheme, setCurrentTheme] = useState<ProductTheme | null>(null);

  const { data: theme, isLoading } = useQuery({
    queryKey: ["product-theme"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("product_themes")
        .select("*")
        .eq("name", "Tema Padrão")
        .single();

      if (error) throw error;
      return data as ProductTheme;
    },
  });

  useEffect(() => {
    if (theme) {
      setCurrentTheme(theme);
    }
  }, [theme]);

  const handleColorChange = (field: keyof ProductTheme, value: string) => {
    if (!currentTheme) return;
    setCurrentTheme({ ...currentTheme, [field]: value });
  };

  const handleSave = async () => {
    if (!currentTheme) return;

    try {
      const { error } = await supabase
        .from("product_themes")
        .update(currentTheme)
        .eq("id", currentTheme.id);

      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ["product-theme"] });
      toast({
        title: "Tema atualizado",
        description: "As configurações do tema foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar as alterações do tema.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar2 />
        <SubNav2 />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-1/4" />
            <div className="h-[400px] bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar2 />
      <SubNav2 />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Configuração do Tema de Produtos</h1>
          <Button onClick={handleSave}>Salvar Alterações</Button>
        </div>

        <Tabs defaultValue="light" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="light">Modo Claro</TabsTrigger>
            <TabsTrigger value="dark">Modo Escuro</TabsTrigger>
          </TabsList>

          <TabsContent value="light">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cores de Fundo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Principal</Label>
                    <Input
                      type="color"
                      value={currentTheme?.background_primary || "#FFFFFF"}
                      onChange={(e) => handleColorChange("background_primary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secundário</Label>
                    <Input
                      type="color"
                      value={currentTheme?.background_secondary || "#F1F0FB"}
                      onChange={(e) => handleColorChange("background_secondary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Muted</Label>
                    <Input
                      type="color"
                      value={currentTheme?.background_muted || "#EEEEEE"}
                      onChange={(e) => handleColorChange("background_muted", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cores de Texto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Principal</Label>
                    <Input
                      type="color"
                      value={currentTheme?.text_primary || "#1A1F2C"}
                      onChange={(e) => handleColorChange("text_primary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secundário</Label>
                    <Input
                      type="color"
                      value={currentTheme?.text_secondary || "#403E43"}
                      onChange={(e) => handleColorChange("text_secondary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Muted</Label>
                    <Input
                      type="color"
                      value={currentTheme?.text_muted || "#8E9196"}
                      onChange={(e) => handleColorChange("text_muted", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cores de Preço</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Regular</Label>
                    <Input
                      type="color"
                      value={currentTheme?.price_regular || "#9b87f5"}
                      onChange={(e) => handleColorChange("price_regular", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Desconto</Label>
                    <Input
                      type="color"
                      value={currentTheme?.price_discount || "#F97316"}
                      onChange={(e) => handleColorChange("price_discount", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Antigo</Label>
                    <Input
                      type="color"
                      value={currentTheme?.price_old || "#8E9196"}
                      onChange={(e) => handleColorChange("price_old", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cores de Botão</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primário - Fundo</Label>
                    <Input
                      type="color"
                      value={currentTheme?.button_primary_bg || "#9b87f5"}
                      onChange={(e) => handleColorChange("button_primary_bg", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Primário - Texto</Label>
                    <Input
                      type="color"
                      value={currentTheme?.button_primary_text || "#FFFFFF"}
                      onChange={(e) => handleColorChange("button_primary_text", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secundário - Fundo</Label>
                    <Input
                      type="color"
                      value={currentTheme?.button_secondary_bg || "#F1F0FB"}
                      onChange={(e) => handleColorChange("button_secondary_bg", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secundário - Texto</Label>
                    <Input
                      type="color"
                      value={currentTheme?.button_secondary_text || "#1A1F2C"}
                      onChange={(e) => handleColorChange("button_secondary_text", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dark">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cores de Fundo (Dark)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Principal</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_background_primary || "#222222"}
                      onChange={(e) => handleColorChange("dark_background_primary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secundário</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_background_secondary || "#1A1F2C"}
                      onChange={(e) => handleColorChange("dark_background_secondary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Muted</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_background_muted || "#2A2A2A"}
                      onChange={(e) => handleColorChange("dark_background_muted", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cores de Texto (Dark)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Principal</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_text_primary || "#FFFFFF"}
                      onChange={(e) => handleColorChange("dark_text_primary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secundário</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_text_secondary || "#B0B0B0"}
                      onChange={(e) => handleColorChange("dark_text_secondary", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Muted</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_text_muted || "#808080"}
                      onChange={(e) => handleColorChange("dark_text_muted", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cores de Botão (Dark)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Primário - Fundo</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_button_primary_bg || "#a594f8"}
                      onChange={(e) => handleColorChange("dark_button_primary_bg", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Primário - Texto</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_button_primary_text || "#FFFFFF"}
                      onChange={(e) => handleColorChange("dark_button_primary_text", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secundário - Fundo</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_button_secondary_bg || "#2A2F3C"}
                      onChange={(e) => handleColorChange("dark_button_secondary_bg", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secundário - Texto</Label>
                    <Input
                      type="color"
                      value={currentTheme?.dark_button_secondary_text || "#FFFFFF"}
                      onChange={(e) => handleColorChange("dark_button_secondary_text", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProductThemeConfig;
