
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type News = Database['public']['Tables']['news']['Row'];
type NewsInsert = Database['public']['Tables']['news']['Insert'];

interface InstagramMediaJson {
  url: string;
  type: 'post' | 'video';
}

export const NewsTab = () => {
  const [newNews, setNewNews] = useState<NewsInsert>({
    title: "",
    content: "",
    image: null,
    video: null,
    date: new Date().toISOString(),
    instagram_media: [],
    category_id: null,
    button_color: null,
  });

  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [news, setNews] = useState<News[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([]);

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, [searchTerm]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("name");

    if (error) {
      toast.error("Erro ao carregar categorias");
      return;
    }

    if (data) {
      setCategories(data);
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
          image: editingNews.image,
          video: editingNews.video,
          date: editingNews.date,
          instagram_media: editingNews.instagram_media,
          category_id: editingNews.category_id,
          button_color: editingNews.button_color,
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
        instagram_media: [],
        category_id: null,
        button_color: null,
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

  const addInstagramMedia = (news: NewsInsert | News, type: 'post' | 'video') => {
    const media: InstagramMediaJson = {
      url: '',
      type,
    };
    
    const currentMedia = Array.isArray(news.instagram_media) 
      ? (news.instagram_media as unknown as InstagramMediaJson[])
      : [];
    
    if ('id' in news) {
      setEditingNews({
        ...news,
        instagram_media: [...currentMedia, media] as unknown as Json[],
      } as News);
    } else {
      setNewNews({
        ...news,
        instagram_media: [...currentMedia, media] as unknown as Json[],
      } as NewsInsert);
    }
  };

  const updateInstagramMedia = (
    news: NewsInsert | News,
    index: number,
    url: string
  ) => {
    const currentMedia = Array.isArray(news.instagram_media) 
      ? (news.instagram_media as unknown as InstagramMediaJson[])
      : [];
    const updatedMedia = [...currentMedia];
    updatedMedia[index] = { ...updatedMedia[index], url };
    
    if ('id' in news) {
      setEditingNews({
        ...news,
        instagram_media: updatedMedia as unknown as Json[],
      } as News);
    } else {
      setNewNews({
        ...news,
        instagram_media: updatedMedia as unknown as Json[],
      } as NewsInsert);
    }
  };

  const removeInstagramMedia = (news: NewsInsert | News, index: number) => {
    const currentMedia = Array.isArray(news.instagram_media)
      ? (news.instagram_media as unknown as InstagramMediaJson[])
      : [];
    const updatedMedia = [...currentMedia];
    updatedMedia.splice(index, 1);
    
    if ('id' in news) {
      setEditingNews({
        ...news,
        instagram_media: updatedMedia as unknown as Json[],
      } as News);
    } else {
      setNewNews({
        ...news,
        instagram_media: updatedMedia as unknown as Json[],
      } as NewsInsert);
    }
  };

  const renderInstagramMediaFields = (news: NewsInsert | News) => {
    if (!news.instagram_media || !Array.isArray(news.instagram_media)) {
      return (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Mídia do Instagram</h3>
            <div className="space-x-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addInstagramMedia(news, 'post')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Post
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addInstagramMedia(news, 'video')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Vídeo
              </Button>
            </div>
          </div>
        </div>
      );
    }

    const currentMedia: InstagramMediaJson[] = news.instagram_media.map(media => {
      if (typeof media === 'object' && media !== null) {
        const mediaObj = media as { url?: string; type?: 'post' | 'video' };
        if ('url' in media && 'type' in media) {
          return {
            url: mediaObj.url || '',
            type: mediaObj.type || 'post'
          } as InstagramMediaJson;
        }
      }
      return { url: '', type: 'post' } as InstagramMediaJson;
    });

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Mídia do Instagram</h3>
          <div className="space-x-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => addInstagramMedia(news, 'post')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Post
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => addInstagramMedia(news, 'video')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Vídeo
            </Button>
          </div>
        </div>
        {currentMedia.map((media, index) => (
          <div key={index} className="flex gap-2 items-start">
            <div className="flex-1">
              <Label>
                Link do {media.type === 'post' ? 'Post' : 'Vídeo'} do Instagram
              </Label>
              <Input
                value={media.url}
                onChange={(e) =>
                  updateInstagramMedia(news, index, e.target.value)
                }
                placeholder={`https://www.instagram.com/${media.type === 'post' ? 'p' : 'reel'}/...`}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="mt-6"
              onClick={() => removeInstagramMedia(news, index)}
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
                    value={newNews.button_color || "#9b87f5"}
                    onChange={(e) => setNewNews({ ...newNews, button_color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    type="text"
                    value={newNews.button_color || "#9b87f5"}
                    onChange={(e) => setNewNews({ ...newNews, button_color: e.target.value })}
                    placeholder="#9b87f5"
                  />
                </div>
              </div>
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
                    value={editingNews.button_color || "#9b87f5"}
                    onChange={(e) => setEditingNews({ ...editingNews, button_color: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    type="text"
                    value={editingNews.button_color || "#9b87f5"}
                    onChange={(e) => setEditingNews({ ...editingNews, button_color: e.target.value })}
                    placeholder="#9b87f5"
                  />
                </div>
              </div>
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
          {news.map((item) => (
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
                    const instaMedia = (media as unknown) as InstagramMediaJson;
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
