import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: string;
  name: string;
}

interface News {
  id: string;
  title: string;
  content: string;
  date: string;
  category_id: string | null;
  images: string[] | null;
  video_urls: string[] | null;
  button_color: string | null;
}

const AdminNews = () => {
  const [news, setNews] = useState<News[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingNews, setEditingNews] = useState<News | null>(null);
  const [newNews, setNewNews] = useState<Partial<News>>({
    title: "",
    content: "",
    category_id: null,
    images: [],
    video_urls: [],
    button_color: "#9b87f5"
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  useEffect(() => {
    fetchNews();
    fetchCategories();
  }, []);

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

  const handleAddImage = () => {
    if (!newImageUrl) {
      toast.error("Por favor, insira uma URL de imagem válida");
      return;
    }

    if (editingNews) {
      setEditingNews({
        ...editingNews,
        images: [...(editingNews.images || []), newImageUrl]
      });
    } else {
      setNewNews({
        ...newNews,
        images: [...(newNews.images || []), newImageUrl]
      });
    }
    setNewImageUrl("");
  };

  const handleRemoveImage = (imageUrl: string) => {
    if (editingNews) {
      setEditingNews({
        ...editingNews,
        images: editingNews.images?.filter(url => url !== imageUrl) || []
      });
    } else {
      setNewNews({
        ...newNews,
        images: newNews.images?.filter(url => url !== imageUrl) || []
      });
    }
  };

  const handleAddVideo = () => {
    if (!newVideoUrl) {
      toast.error("Por favor, insira uma URL de vídeo válida");
      return;
    }

    if (editingNews) {
      setEditingNews({
        ...editingNews,
        video_urls: [...(editingNews.video_urls || []), newVideoUrl]
      });
    } else {
      setNewNews({
        ...newNews,
        video_urls: [...(newNews.video_urls || []), newVideoUrl]
      });
    }
    setNewVideoUrl("");
  };

  const handleRemoveVideo = (videoUrl: string) => {
    if (editingNews) {
      setEditingNews({
        ...editingNews,
        video_urls: editingNews.video_urls?.filter(url => url !== videoUrl) || []
      });
    } else {
      setNewNews({
        ...newNews,
        video_urls: newNews.video_urls?.filter(url => url !== videoUrl) || []
      });
    }
  };

  const handleNewsSubmit = async () => {
    try {
      if (!newNews.title || !newNews.content) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }

      const { data, error } = await supabase.from("news").insert([
        {
          ...newNews,
          date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      toast.success("Notícia adicionada com sucesso!");
      setNewNews({
        title: "",
        content: "",
        category_id: null,
        images: [],
        video_urls: [],
        button_color: "#9b87f5",
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

      const { error } = await supabase
        .from("news")
        .update(editingNews)
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
            <div className="space-y-2">
              <Label>Imagens</Label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Cole a URL da imagem"
                />
                <Button type="button" onClick={handleAddImage}>
                  Adicionar
                </Button>
              </div>
              {newNews.images?.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveImage(url)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Vídeos</Label>
              <div className="flex gap-2">
                <Input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Cole a URL do vídeo"
                />
                <Button type="button" onClick={handleAddVideo}>
                  Adicionar
                </Button>
              </div>
              {newNews.video_urls?.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveVideo(url)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
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
            <div className="space-y-2">
              <Label>Imagens</Label>
              <div className="flex gap-2">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="Cole a URL da imagem"
                />
                <Button type="button" onClick={handleAddImage}>
                  Adicionar
                </Button>
              </div>
              {editingNews.images?.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveImage(url)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <Label>Vídeos</Label>
              <div className="flex gap-2">
                <Input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Cole a URL do vídeo"
                />
                <Button type="button" onClick={handleAddVideo}>
                  Adicionar
                </Button>
              </div>
              {editingNews.video_urls?.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => handleRemoveVideo(url)}
                  >
                    Remover
                  </Button>
                </div>
              ))}
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
                {item.images && item.images.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-500">Imagens:</p>
                    {item.images.map((image, index) => (
                      <p key={index} className="text-sm text-gray-500">
                        {image}
                      </p>
                    ))}
                  </div>
                )}
                {item.video_urls && item.video_urls.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-500">Vídeos:</p>
                    {item.video_urls.map((video, index) => (
                      <p key={index} className="text-sm text-gray-500">
                        {video}
                      </p>
                    ))}
                  </div>
                )}
                {item.button_color && (
                  <p className="text-sm text-gray-500">
                    Cor do botão: <span style={{ color: item.button_color }}>{item.button_color}</span>
                  </p>
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
