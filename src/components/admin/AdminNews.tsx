import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "../../integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/supabase";

type News = Database['public']['Tables']['news']['Row'];
type NewsInsert = Database['public']['Tables']['news']['Insert'];
type NewsUpdate = Database['public']['Tables']['news']['Update'];

interface Category {
  id: string;
  name: string;
}

interface InstagramMedia {
  url: string;
  type: "post" | "video";
}

const AdminNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newNews, setNewNews] = useState<NewsInsert>({
    title: "",
    content: "",
    category_id: null,
    image: null,
    video: null,
    button_color: "#000000",
    instagram_media: [],
  });

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Erro ao carregar notícias");
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Erro ao carregar categorias");
    }
  };

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

  const handleNewsSubmit = async () => {
    try {
      if (!newNews.title || !newNews.content) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }

      const { error } = await supabase.from("news").insert({
        ...newNews,
        date: new Date().toISOString(),
      } as NewsInsert);

      if (error) throw error;

      toast.success("Notícia adicionada com sucesso!");
      setNewNews({
        title: "",
        content: "",
        category_id: null,
        image: null,
        video: null,
        button_color: "#000000",
        instagram_media: [],
      });
      fetchNews();
    } catch (error) {
      console.error("Error adding news:", error);
      toast.error("Erro ao adicionar notícia");
    }
  };

  const handleNewsEdit = async () => {
    try {
      if (!editingNews || !editingNews.title || !editingNews.content) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para editar notícias");
        return;
      }

      const { error } = await supabase
        .from("news")
        .update(editingNews as NewsUpdate)
        .eq("id", editingNews.id);

      if (error) throw error;

      toast.success("Notícia atualizada com sucesso!");
      setEditingNews(null);
      fetchNews();
    } catch (error) {
      console.error("Error updating news:", error);
      toast.error("Erro ao atualizar notícia");
    }
  };

  const handleNewsDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("news").delete().eq("id", id);

      if (error) throw error;

      toast.success("Notícia excluída com sucesso!");
      fetchNews();
    } catch (error) {
      console.error("Error deleting news:", error);
      toast.error("Erro ao excluir notícia");
    }
  };

  const renderInstagramMediaFields = (item: Partial<News>) => {
    const media = (item.instagram_media as InstagramMedia[]) || [];
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Mídia do Instagram</Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              const newMedia = [...media, { url: "", type: "post" as const }];
              if (editingNews) {
                setEditingNews({ ...editingNews, instagram_media: newMedia });
              } else {
                setNewNews({ ...newNews, instagram_media: newMedia });
              }
            }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Mídia
          </Button>
        </div>
        {media.map((m, index) => (
          <div key={index} className="flex gap-4 items-start">
            <div className="flex-1">
              <Input
                value={m.url}
                onChange={(e) => {
                  const newMedia = [...media];
                  newMedia[index] = { ...newMedia[index], url: e.target.value };
                  if (editingNews) {
                    setEditingNews({ ...editingNews, instagram_media: newMedia });
                  } else {
                    setNewNews({ ...newNews, instagram_media: newMedia });
                  }
                }}
                placeholder="URL da mídia do Instagram"
              />
            </div>
            <select
              className="border border-gray-300 rounded-md p-2"
              value={m.type}
              onChange={(e) => {
                const newMedia = [...media];
                newMedia[index] = {
                  ...newMedia[index],
                  type: e.target.value as "post" | "video",
                };
                if (editingNews) {
                  setEditingNews({ ...editingNews, instagram_media: newMedia });
                } else {
                  setNewNews({ ...newNews, instagram_media: newMedia });
                }
              }}
            >
              <option value="post">Post</option>
              <option value="video">Vídeo</option>
            </select>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => {
                const newMedia = media.filter((_, i) => i !== index);
                if (editingNews) {
                  setEditingNews({ ...editingNews, instagram_media: newMedia });
                } else {
                  setNewNews({ ...newNews, instagram_media: newMedia });
                }
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={newNews.category_id || ""}
                  onChange={(e) => setNewNews({ ...newNews, category_id: e.target.value || null })}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="button_color">Cor do Botão</Label>
                <div className="flex gap-2">
                  <Input
                    id="button_color"
                    type="color"
                    value={newNews.button_color || "#000000"}
                    onChange={(e) => setNewNews({ ...newNews, button_color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    type="text"
                    value={newNews.button_color || "#000000"}
                    onChange={(e) => setNewNews({ ...newNews, button_color: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="image">Link da Imagem (Dropbox)</Label>
              <Input
                id="image"
                value={newNews.image || ""}
                onChange={(e) => setNewNews({ ...newNews, image: e.target.value })}
                placeholder="Cole aqui o link de compartilhamento do Dropbox"
              />
            </div>
            <div>
              <Label htmlFor="video">Link do Vídeo (Dropbox/YouTube)</Label>
              <Input
                id="video"
                value={newNews.video || ""}
                onChange={(e) => setNewNews({ ...newNews, video: e.target.value })}
                placeholder="Cole aqui o link de compartilhamento do Dropbox ou YouTube"
              />
            </div>
            {renderInstagramMediaFields(newNews)}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Categoria</Label>
                <select
                  id="edit-category"
                  className="w-full border border-gray-300 rounded-md p-2"
                  value={editingNews.category_id || ""}
                  onChange={(e) => setEditingNews({ ...editingNews, category_id: e.target.value || null })}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="edit-button_color">Cor do Botão</Label>
                <div className="flex gap-2">
                  <Input
                    id="edit-button_color"
                    type="color"
                    value={editingNews.button_color || "#000000"}
                    onChange={(e) => setEditingNews({ ...editingNews, button_color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    type="text"
                    value={editingNews.button_color || "#000000"}
                    onChange={(e) => setEditingNews({ ...editingNews, button_color: e.target.value })}
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="edit-image">Link da Imagem (Dropbox)</Label>
              <Input
                id="edit-image"
                value={editingNews.image || ""}
                onChange={(e) => setEditingNews({ ...editingNews, image: e.target.value })}
                placeholder="Cole aqui o link de compartilhamento do Dropbox"
              />
            </div>
            <div>
              <Label htmlFor="edit-video">Link do Vídeo (Dropbox/YouTube)</Label>
              <Input
                id="edit-video"
                value={editingNews.video || ""}
                onChange={(e) => setEditingNews({ ...editingNews, video: e.target.value })}
                placeholder="Cole aqui o link de compartilhamento do Dropbox ou YouTube"
              />
            </div>
            {renderInstagramMediaFields(editingNews)}
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
          {news
            .filter((item) =>
              item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.content.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .map((item) => (
              <div key={item.id} className="bg-gray-50 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {categories.find(c => c.id === item.category_id)?.name && (
                        <Badge variant="secondary">
                          {categories.find(c => c.id === item.category_id)?.name}
                        </Badge>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
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
                {item.button_color && (
                  <p className="text-sm text-gray-500">
                    Cor do botão: <span style={{ color: item.button_color }}>{item.button_color}</span>
                  </p>
                )}
                {Array.isArray(item.instagram_media) && item.instagram_media.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-500">Mídia do Instagram:</p>
                    {item.instagram_media.map((media, index) => {
                      const instaMedia = media as InstagramMedia;
                      if (!instaMedia?.url || !instaMedia?.type) return null;
                      return (
                        <p key={index} className="text-sm text-gray-500">
                          {instaMedia.type === 'post' ? 'Post' : 'Vídeo'}: {instaMedia.url}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          {news.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              Nenhuma notícia encontrada.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminNews;
