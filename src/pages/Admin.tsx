
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  Settings,
  Share2,
  Bell,
  Users,
  Palette,
  FileText,
  Image,
  Newspaper,
  Globe,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const { data: siteConfig } = useQuery({
    queryKey: ["site-configuration"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .single();

      if (error) {
        toast.error("Erro ao carregar configurações");
        throw error;
      }

      return data;
    },
  });

  const handleClearCache = () => {
    localStorage.clear();
    toast.success("Cache limpo com sucesso!");
  };

  const handleColorUpdate = async (color: string, type: string) => {
    try {
      const { error } = await supabase
        .from("site_configuration")
        .update({ [type]: color })
        .eq("id", siteConfig?.id);

      if (error) throw error;
      toast.success("Cor atualizada com sucesso!");
    } catch (error) {
      toast.error("Erro ao atualizar cor");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Painel Administrativo
          </h2>
          <p className="mt-2 text-gray-600">
            Gerencie as configurações do sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cores e Tema */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Palette className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Cores e Tema</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Personalize as cores e o tema do site
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={siteConfig?.primary_color || "#1A1F2C"}
                  onChange={(e) => handleColorUpdate(e.target.value, "primary_color")}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">Cor Primária</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={siteConfig?.accent_color || "#8B5CF6"}
                  onChange={(e) => handleColorUpdate(e.target.value, "accent_color")}
                  className="w-8 h-8 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-600">Cor de Destaque</span>
              </div>
            </div>
          </Card>

          {/* Páginas */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <FileText className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Páginas</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gerencie as páginas do site
            </p>
            <Button variant="outline" className="w-full">
              Gerenciar Páginas
            </Button>
          </Card>

          {/* Logo */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Image className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Logo</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Atualize o logo do site
            </p>
            <Button variant="outline" className="w-full">
              Alterar Logo
            </Button>
          </Card>

          {/* Notícias */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Newspaper className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Notícias</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gerencie as notícias do site
            </p>
            <Button variant="outline" className="w-full">
              Gerenciar Notícias
            </Button>
          </Card>

          {/* SEO e Meta */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">SEO e Meta</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure meta tags e SEO
            </p>
            <Button variant="outline" className="w-full">
              Configurar SEO
            </Button>
          </Card>

          {/* Cache */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Settings className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Cache</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gerencie o cache do sistema
            </p>
            <Button onClick={handleClearCache} variant="outline" className="w-full">
              Limpar Cache
            </Button>
          </Card>

          {/* Redes Sociais */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Share2 className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Redes Sociais</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Configure as redes sociais
            </p>
            <Button variant="outline" className="w-full">
              Configurar Redes Sociais
            </Button>
          </Card>

          {/* Notificações */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Bell className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Notificações</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gerencie as notificações
            </p>
            <Button variant="outline" className="w-full">
              Configurar Notificações
            </Button>
          </Card>

          {/* Usuários */}
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Usuários</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gerencie os usuários do sistema
            </p>
            <Button variant="outline" className="w-full">
              Gerenciar Usuários
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;

