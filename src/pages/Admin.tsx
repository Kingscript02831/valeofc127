
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  Plus,
} from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Admin = () => {
  const navigate = useNavigate();
  const [newNews, setNewNews] = useState({
    title: "",
    content: "",
    image: "",
    video: "",
  });

  const queryClient = useQueryClient();

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Você precisa estar logado para acessar o painel administrativo");
        navigate("/login");
        return;
      }

      // Check if user is an admin
      const { data: adminUser } = await supabase
        .from("admin_users")
        .select("*")
        .eq("email", session.user.email)
        .single();

      if (!adminUser) {
        toast.error("Você não tem permissão para acessar o painel administrativo");
        navigate("/");
        return;
      }
    };

    checkAuth();
  }, [navigate]);

  const { data: siteConfig } = useQuery({
    queryKey: ["site-configuration"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autorizado");

      const { data, error } = await supabase
        .from("site_configuration")
        .select("*")
        .maybeSingle();

      if (error) {
        toast.error("Erro ao carregar configurações");
        throw error;
      }

      // Return default values if no configuration exists
      return data || {
        primary_color: "#1A1F2C",
        accent_color: "#8B5CF6",
        id: null
      };
    },
  });

  const { data: newsList } = useQuery({
    queryKey: ["news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        toast.error("Erro ao carregar notícias");
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
      if (siteConfig?.id) {
        // Update existing configuration
        const { error } = await supabase
          .from("site_configuration")
          .update({ [type]: color })
          .eq("id", siteConfig.id);

        if (error) throw error;
      } else {
        // Insert new configuration if none exists
        const { error } = await supabase
          .from("site_configuration")
          .insert([{ [type]: color }]);

        if (error) throw error;
      }
      
      toast.success("Cor atualizada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["site-configuration"] });
    } catch (error) {
      toast.error("Erro ao atualizar cor");
    }
  };

  const handleAddNews = async () => {
    try {
      const { error } = await supabase
        .from("news")
        .insert([
          {
            title: newNews.title,
            content: newNews.content,
            image: newNews.image || null,
            video: newNews.video || null,
          },
        ]);

      if (error) throw error;

      toast.success("Notícia adicionada com sucesso!");
      setNewNews({ title: "", content: "", image: "", video: "" });
      queryClient.invalidateQueries({ queryKey: ["news"] });
    } catch (error) {
      toast.error("Erro ao adicionar notícia");
    }
  };

  const handleDeleteNews = async (id: string) => {
    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Notícia removida com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["news"] });
    } catch (error) {
      toast.error("Erro ao remover notícia");
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
          <Card className="col-span-1 md:col-span-2 lg:col-span-3 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <Newspaper className="h-6 w-6 text-primary" />
              <h3 className="text-xl font-semibold">Notícias</h3>
            </div>
            <p className="text-gray-600 mb-4">
              Gerencie as notícias do site
            </p>
            
            <div className="grid gap-4">
              <div className="grid gap-4">
                <Input
                  placeholder="Título da notícia"
                  value={newNews.title}
                  onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                />
                <Textarea
                  placeholder="Conteúdo da notícia"
                  value={newNews.content}
                  onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                />
                <Input
                  placeholder="Link da imagem (opcional)"
                  value={newNews.image}
                  onChange={(e) => setNewNews({ ...newNews, image: e.target.value })}
                />
                <Input
                  placeholder="Link do vídeo do YouTube (opcional)"
                  value={newNews.video}
                  onChange={(e) => setNewNews({ ...newNews, video: e.target.value })}
                />
                <Button onClick={handleAddNews} className="w-full flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Notícia
                </Button>
              </div>

              <div className="mt-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsList?.map((news) => (
                      <TableRow key={news.id}>
                        <TableCell>{news.title}</TableCell>
                        <TableCell>{new Date(news.date).toLocaleDateString("pt-BR")}</TableCell>
                        <TableCell>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteNews(news.id)}
                          >
                            Excluir
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
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
