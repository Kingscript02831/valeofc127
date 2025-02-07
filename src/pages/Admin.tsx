import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search } from "lucide-react";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];
type News = Database['public']['Tables']['news']['Row'];
type NewsInsert = Database['public']['Tables']['news']['Insert'];

const Admin = () => {
  const [config, setConfig] = useState<SiteConfig>({
    id: "",
    theme_name: "light",
    primary_color: "#1A1F2C",
    secondary_color: "#D6BCFA",
    background_color: "#FFFFFF",
    text_color: "#1A1F2C",
    navbar_color: "#D6BCFA",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    navbar_logo_type: "text",
    navbar_logo_text: "VALEOFC",
    navbar_logo_image: null,
    language: "pt-BR",
    enable_dark_mode: false,
    high_contrast: false,
    header_alerts: [],
    navigation_links: [],
    font_size: "medium"
  });

  const [newNews, setNewNews] = useState<NewsInsert>({
    title: "",
    content: "",
    image: null,
    video: null,
    date: new Date().toISOString(),
  });

  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchConfiguration();
    fetchNews();
  }, []);

  const fetchConfiguration = async () => {
    const { data, error } = await supabase
      .from("site_configuration")
      .select("*")
      .single();

    if (error) {
      toast.error("Erro ao carregar configurações");
      return;
    }

    if (data) {
      setConfig(data);
    }
  };

  const fetchNews = async () => {
    let query = supabase
      .from("news")
      .select("*")
      .order("created_at", { ascending: false });

    if (searchTerm) {
      query = query.ilike("title", `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar notícias");
      return;
    }

    if (data) {
      setNews(data);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [searchTerm]);

  const handleConfigUpdate = async () => {
    try {
      const { error } = await supabase
        .from("site_configuration")
        .update(config)
        .eq("id", config.id);

      if (error) throw error;

      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar configurações");
    }
  };

  const handleNewsEdit = async () => {
    try {
      if (!editingNews || !editingNews.title || !editingNews.content) {
        toast.error("Título e conteúdo são obrigatórios");
        return;
      }

      const { error } = await supabase
        .from("news")
        .update({
          title: editingNews.title,
          content: editingNews.content,
          image: editingNews.image || null,
          video: editingNews.video || null,
          date: editingNews.date,
        })
        .eq("id", editingNews.id);

      if (error) throw error;

      toast.success("Notícia atualizada com sucesso!");
      setEditingNews(null);
      fetchNews();
    } catch (error: any) {
      console.error("Error updating news:", error);
      toast.error("Erro ao atualizar notícia: " + error.message);
    }
  };

  const handleNewsSubmit = async () => {
    try {
      if (!newNews.title || !newNews.content) {
        toast.error("Título e conteúdo são obrigatórios");
        return;
      }

      const { error } = await supabase
        .from("news")
        .insert({
          ...newNews,
          date: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Notícia adicionada com sucesso!");
      setNewNews({
        title: "",
        content: "",
        image: null,
        video: null,
        date: new Date().toISOString(),
      });
      fetchNews();
    } catch (error: any) {
      console.error("Error adding news:", error);
      toast.error("Erro ao adicionar notícia: " + error.message);
    }
  };

  const handleNewsDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("news")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Notícia removida com sucesso!");
      fetchNews();
    } catch (error: any) {
      toast.error("Erro ao remover notícia");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel Administrativo</h1>

        <Tabs defaultValue="news" className="space-y-6">
          <TabsList>
            <TabsTrigger value="news">Notícias</TabsTrigger>
            <TabsTrigger value="config">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="news" className="space-y-6">
            {!editingNews ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Adicionar Notícia</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newNews.title}
                      onChange={(e) => setNewNews({ ...newNews, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Conteúdo</Label>
                    <Textarea
                      id="content"
                      value={newNews.content}
                      onChange={(e) => setNewNews({ ...newNews, content: e.target.value })}
                      className="min-h-[200px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="image">Link da Imagem</Label>
                    <Input
                      id="image"
                      value={newNews.image || ""}
                      onChange={(e) => setNewNews({ ...newNews, image: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="video">Link do Vídeo (YouTube)</Label>
                    <Input
                      id="video"
                      value={newNews.video || ""}
                      onChange={(e) => setNewNews({ ...newNews, video: e.target.value })}
                      placeholder="https://youtube.com/embed/..."
                    />
                  </div>
                  <Button onClick={handleNewsSubmit}>Adicionar Notícia</Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Editar Notícia</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Título</Label>
                    <Input
                      id="edit-title"
                      value={editingNews.title}
                      onChange={(e) => setEditingNews({ ...editingNews, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-content">Conteúdo</Label>
                    <Textarea
                      id="edit-content"
                      value={editingNews.content}
                      onChange={(e) => setEditingNews({ ...editingNews, content: e.target.value })}
                      className="min-h-[200px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-image">Link da Imagem</Label>
                    <Input
                      id="edit-image"
                      value={editingNews.image || ""}
                      onChange={(e) => setEditingNews({ ...editingNews, image: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-video">Link do Vídeo (YouTube)</Label>
                    <Input
                      id="edit-video"
                      value={editingNews.video || ""}
                      onChange={(e) => setEditingNews({ ...editingNews, video: e.target.value })}
                      placeholder="https://youtube.com/embed/..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleNewsEdit}>Salvar Alterações</Button>
                    <Button variant="outline" onClick={() => setEditingNews(null)}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Lista de Notícias</h2>
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Buscar notícias..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold">{item.title}</h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingNews(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleNewsDelete(item.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap mb-2">{item.content}</p>
                    {item.image && <p className="text-sm text-gray-500">Imagem: {item.image}</p>}
                    {item.video && <p className="text-sm text-gray-500">Vídeo: {item.video}</p>}
                  </div>
                ))}
                {news.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Nenhuma notícia encontrada.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config" className="bg-white rounded-lg shadow p-6 space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Logo da Navbar</h2>
              <div className="space-y-4">
                <div>
                  <Label>Tipo de Logo</Label>
                  <div className="flex gap-4">
                    <Button
                      variant={config.navbar_logo_type === "text" ? "default" : "outline"}
                      onClick={() => setConfig({ ...config, navbar_logo_type: "text" })}
                    >
                      Texto
                    </Button>
                    <Button
                      variant={config.navbar_logo_type === "image" ? "default" : "outline"}
                      onClick={() => setConfig({ ...config, navbar_logo_type: "image" })}
                    >
                      Imagem
                    </Button>
                  </div>
                </div>

                {config.navbar_logo_type === "text" ? (
                  <div>
                    <Label htmlFor="logo_text">Texto da Logo</Label>
                    <Input
                      id="logo_text"
                      value={config.navbar_logo_text || ""}
                      onChange={(e) => setConfig({ ...config, navbar_logo_text: e.target.value })}
                    />
                  </div>
                ) : (
                  <div>
                    <Label htmlFor="logo_image">Link da Imagem da Logo</Label>
                    <Input
                      id="logo_image"
                      value={config.navbar_logo_image || ""}
                      onChange={(e) => setConfig({ ...config, navbar_logo_image: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="primary_color">Cor Primária</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={config.primary_color}
                    onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondary_color">Cor Secundária</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={config.secondary_color}
                    onChange={(e) => setConfig({ ...config, secondary_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="background_color">Cor de Fundo</Label>
                <div className="flex gap-2">
                  <Input
                    id="background_color"
                    type="color"
                    value={config.background_color}
                    onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={config.background_color}
                    onChange={(e) => setConfig({ ...config, background_color: e.target.value })}
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
                  />
                  <Input
                    type="text"
                    value={config.text_color}
                    onChange={(e) => setConfig({ ...config, text_color: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="navbar_color">Cor da Navbar</Label>
                <div className="flex gap-2">
                  <Input
                    id="navbar_color"
                    type="color"
                    value={config.navbar_color}
                    onChange={(e) => setConfig({ ...config, navbar_color: e.target.value })}
                  />
                  <Input
                    type="text"
                    value={config.navbar_color}
                    onChange={(e) => setConfig({ ...config, navbar_color: e.target.value })}
                  />
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
