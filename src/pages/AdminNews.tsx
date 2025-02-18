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

interface InstagramMedia {
  url: string;
  type: "post" | "video";
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
  instagram_media: InstagramMedia[] | null;
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
    button_color: "#9b87f5",
    instagram_media: [],
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

  const handleNewsSubmit = async () => {
    try {
      if (!newNews.title || !newNews.content) {
        toast.error("Preencha os campos obrigatórios (título e conteúdo)");
        return;
      }

      // Validate images URLs
      if (newNews.images && newNews.images.length > 0) {
        for (const url of newNews.images) {
          if (!url.includes('dropbox.com')) {
            toast.error("As imagens devem ser do Dropbox");
            return;
          }
        }
      }

      // Validate video URLs
      if (newNews.video_urls && newNews.video_urls.length > 0) {
        for (const url of newNews.video_urls) {
          const isDropbox = url.includes('dropbox.com');
          const isYoutube = url.includes('youtube.com') || url.includes('youtu.be');
          if (!isDropbox && !isYoutube) {
            toast.error("Os vídeos devem ser do Dropbox ou YouTube");
            return;
          }
        }
      }

      console.log('Submitting news:', newNews);

      const { data, error } = await supabase.from("news").insert([
        {
          ...newNews,
          date: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      toast.success("Notícia adicionada com sucesso!");
      setNewNews({
        title: "",
        content: "",
        category_id: null,
        images: [],
        video_urls: [],
        button_color: "#9b87f5",
        instagram_media: [],
      });
      fetchNews();
    } catch (error) {
      console.error("Error details:", error);
      toast.error("Erro ao adicionar notícia. Por favor, tente novamente.");
    }
  };

  const handleNewsEdit = async () => {
    try {
      if (!editingNews || !editingNews.title || !editingNews.content) {
        toast.error("Preencha os campos obrigatórios");
        return;
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Você precisa estar logado para editar notícias");
        return;
      }

      const { error } = await supabase
        .from("news")
        .update({ ...editingNews, user_id: user.id })
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

  const handleAddImage = () => {
    if (!newImageUrl) {
      toast.error("Por favor, insira uma URL de imagem válida");
      return;
    }

    // Check if it's a valid Dropbox URL
    if (!newImageUrl.includes('dropbox.com')) {
      toast.error("Por favor, insira uma URL válida do Dropbox");
      return;
    }

    // Convert Dropbox URL to direct link if needed
    let directImageUrl = newImageUrl;
    if (newImageUrl.includes('www.dropbox.com')) {
      directImageUrl = newImageUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    if (editingNews) {
      setEditingNews({
        ...editingNews,
        images: [...(editingNews.images || []), directImageUrl]
      });
    } else {
      setNewNews({
        ...newNews,
        images: [...(newNews.images || []), directImageUrl]
      });
    }
    setNewImageUrl("");
    toast.success("Imagem adicionada com sucesso!");
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
    toast.success("Imagem removida com sucesso!");
  };

  const handleAddVideo = () => {
    if (!newVideoUrl) {
      toast.error("Por favor, insira uma URL de vídeo válida");
      return;
    }

    // Check if it's a valid Dropbox or YouTube URL
    const isDropboxUrl = newVideoUrl.includes('dropbox.com');
    const isYoutubeUrl = newVideoUrl.includes('youtube.com') || newVideoUrl.includes('youtu.be');

    if (!isDropboxUrl && !isYoutubeUrl) {
      toast.error("Por favor, insira uma URL válida do Dropbox ou YouTube");
      return;
    }

    // Convert Dropbox URL to direct link if needed
    let directVideoUrl = newVideoUrl;
    if (isDropboxUrl && newVideoUrl.includes('www.dropbox.com')) {
      directVideoUrl = newVideoUrl.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
    }

    if (editingNews) {
      setEditingNews({
        ...editingNews,
        video_urls: [...(editingNews.video_urls || []), directVideoUrl]
      });
    } else {
      setNewNews({
        ...newNews,
        video_urls: [...(newNews.video_urls || []), directVideoUrl]
      });
    }
    setNewVideoUrl("");
    toast.success("Vídeo adicionado com sucesso!");
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
    toast.success("Vídeo removido com sucesso!");
  };

  const renderMediaFields = (item: Partial<News>) => {
    const images = item.images || [];
    const videos = item.video_urls || [];
    
    return (
      <>
        <div className="col-span-2 space-y-2">
          <Label>Imagens do Dropbox</Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Cole a URL compartilhada do Dropbox"
              />
              <Button type="button" onClick={handleAddImage}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {images.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveImage(url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Vídeos (Dropbox ou YouTube)</Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="Cole a URL do Dropbox ou YouTube"
              />
              <Button type="button" onClick={handleAddVideo}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {videos.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={url} readOnly />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveVideo(url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
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
            {renderMediaFields(newNews)}
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
            {renderMediaFields(editingNews)}
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
