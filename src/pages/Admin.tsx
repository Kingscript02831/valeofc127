import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database, Json } from "@/integrations/supabase/types";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { updateMetaTags } from "@/utils/updateMetaTags";

type SiteConfig = Database['public']['Tables']['site_configuration']['Row'];
type News = Database['public']['Tables']['news']['Row'];
type NewsInsert = Database['public']['Tables']['news']['Insert'];
type Event = Database['public']['Tables']['events']['Row'];

interface InstagramMediaJson {
  url: string;
  type: 'post' | 'video';
}

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
    navbar_social_facebook: null,
    navbar_social_instagram: null,
    language: "pt-BR",
    enable_dark_mode: false,
    high_contrast: false,
    header_alerts: [],
    navigation_links: [],
    font_size: "medium",
    footer_primary_color: "#1A1F2C",
    footer_secondary_color: "#D6BCFA",
    footer_text_color: "#FFFFFF",
    footer_contact_email: null,
    footer_contact_phone: null,
    footer_address: null,
    footer_address_cep: null,
    footer_social_facebook: null,
    footer_social_instagram: null,
    footer_schedule: null,
    footer_copyright_text: "© 2025 VALEOFC. Todos os direitos reservados.",
    enable_weather: false,
    weather_api_key: null,
    location_lat: null,
    location_lng: null,
    location_city: null,
    location_state: null,
    location_country: null,
    meta_title: 'vale-news-hub',
    meta_description: 'Lovable Generated Project',
    meta_author: 'Lovable',
    meta_image: '/og-image.png',
    button_primary_color: "#9b87f5",
    button_secondary_color: "#7E69AB",
  });

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

  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'created_at' | 'updated_at'>>({
    title: "",
    description: "",
    event_date: new Date().toISOString().split('T')[0],
    event_time: "00:00",
    image: "",
    images: [],
    location: "",
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchEventTerm, setSearchEventTerm] = useState("");

  useEffect(() => {
    fetchConfiguration();
    fetchNews();
    fetchCategories();
  }, []);

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

  const fetchEvents = async () => {
    let query = supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true });

    if (searchEventTerm) {
      query = query.ilike("title", `%${searchEventTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      toast.error("Erro ao carregar eventos");
      return;
    }

    if (data) {
      setEvents(data);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchEventTerm]);

  const handleConfigUpdate = async () => {
    try {
      const { error } = await supabase
        .from("site_configuration")
        .update(config)
        .eq("id", config.id);

      if (error) throw error;

      // Update meta tags after successful database update
      updateMetaTags(
        config.meta_title,
        config.meta_description,
        config.meta_author,
        config.meta_image
      );

      toast.success("Configurações atualizadas com sucesso!");
    } catch (error: any) {
      toast.error("Erro ao atualizar configurações");
    }
  };

  useEffect(() => {
    if (config) {
      // Update meta tags when configuration is initially loaded
      updateMetaTags(
        config.meta_title,
        config.meta_description,
        config.meta_author,
        config.meta_image
      );
    }
  }, [config]);

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

  const handleEventSubmit = async () => {
    try {
      if (!newEvent.title || !newEvent.description || !newEvent.event_date || !newEvent.event_time) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      // Filter out empty lines and whitespace
      const cleanImages = newEvent.images
        ? newEvent.images.filter(url => url.trim() !== '')
        : [];

      const { error } = await supabase
        .from("events")
        .insert({
          ...newEvent,
          images: cleanImages,
        });

      if (error) throw error;

      toast.success("Evento adicionado com sucesso!");
      setNewEvent({
        title: "",
        description: "",
        event_date: new Date().toISOString().split('T')[0],
        event_time: "00:00",
        image: "",
        images: [],
        location: "",
      });
      fetchEvents();
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast.error("Erro ao adicionar evento: " + error.message);
    }
  };

  const handleEventEdit = async () => {
    try {
      if (!editingEvent || !editingEvent.title || !editingEvent.description) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      // Filter out empty lines and whitespace
      const cleanImages = editingEvent.images
        ? editingEvent.images.filter(url => url.trim() !== '')
        : [];

      const { error } = await supabase
        .from("events")
        .update({
          title: editingEvent.title,
          description: editingEvent.description,
          event_date: editingEvent.event_date,
          event_time: editingEvent.event_time,
          image: editingEvent.image,
          images: cleanImages,
          location: editingEvent.location,
        })
        .eq("id", editingEvent.id);

      if (error) throw error;

      toast.success("Evento atualizado com sucesso!");
      setEditingEvent(null);
      fetchEvents();
    } catch (error: any) {
      console.error("Error updating event:", error);
      toast.error("Erro ao atualizar evento: " + error.message);
    }
  };

  const handleEventDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Evento removido com sucesso!");
      fetchEvents();
    } catch (error: any) {
      toast.error("Erro ao remover evento");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel Administrativo</h1>

        <Tabs defaultValue="news" className="space-y-6">
          <TabsList>
            <TabsTrigger value="news">Notícias</TabsTrigger>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="config">Config Navbar</TabsTrigger>
            <TabsTrigger value="footer">Rodapé</TabsTrigger>
            <TabsTrigger value="general">Geral</TabsTrigger>
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
          </TabsContent>

          <TabsContent value="events" className="space-y-6">
            {!editingEvent ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Adicionar Evento</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_date">Data do Evento</Label>
                      <Input
                        id="event_date"
                        type="date"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="event_time">Horário do Evento</Label>
                      <Input
                        id="event_time"
                        type="time"
                        value={newEvent.event_time}
                        onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="location">Local</Label>
                    <Input
                      id="location"
                      value={newEvent.location || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                      placeholder="Local do evento"
                    />
                  </div>

                  <div>
                    <Label htmlFor="image">Link da Imagem Principal</Label>
                    <Input
                      id="image"
                      value={newEvent.image || ""}
                      onChange={(e) => setNewEvent({ ...newEvent, image: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="additional_images">Links de Imagens Adicionais (uma por linha)</Label>
                    <Textarea
                      id="additional_images"
                      value={newEvent.images?.join('\n') || ""}
                      onChange={(e) => {
                        const imageUrls = e.target.value.split('\n');
                        setNewEvent({
                          ...newEvent,
                          images: imageUrls
                        });
                      }}
                      placeholder="https://exemplo.com/imagem2.jpg&#10;https://exemplo.com/imagem3.jpg"
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Adicione uma URL por linha para incluir múltiplas imagens
                    </p>
                  </div>

                  <Button onClick={handleEventSubmit}>Adicionar Evento</Button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Editar Evento</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Título</Label>
                    <Input
                      id="edit-title"
                      value={editingEvent.title}
                      onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editingEvent.description}
                      onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-event_date">Data do Evento</Label>
                      <Input
                        id="edit-event_date"
                        type="date"
                        value={editingEvent.event_date.split('T')[0]}
                        onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="edit-event_time">Horário do Evento</Label>
                      <Input
                        id="edit-event_time"
                        type="time"
                        value={editingEvent.event_time}
                        onChange={(e) => setEditingEvent({ ...editingEvent, event_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-location">Local</Label>
                    <Input
                      id="edit-location"
                      value={editingEvent.location || ""}
                      onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
                      placeholder="Local do evento"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-image">Link da Imagem Principal</Label>
                    <Input
                      id="edit-image"
                      value={editingEvent.image || ""}
                      onChange={(e) => setEditingEvent({ ...editingEvent, image: e.target.value })}
                      placeholder="https://exemplo.com/imagem.jpg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-additional_images">Links de Imagens Adicionais (uma por linha)</Label>
                    <Textarea
                      id="edit-additional_images"
                      value={editingEvent.images?.join('\n') || ""}
                      onChange={(e) => {
                        const imageUrls = e.target.value.split('\n').filter(url => url.trim() !== '');
                        setEditingEvent({
                          ...editingEvent,
                          images: imageUrls
                        });
                      }}
                      placeholder="https://exemplo.com/imagem2.jpg&#10;https://exemplo.com/imagem3.jpg"
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Adicione uma URL por linha para incluir múltiplas imagens
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleEventEdit}>Salvar Alterações</Button>
                    <Button variant="outline" onClick={() => setEditingEvent(null)}>Cancelar</Button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-xl font-semibold">Lista de Eventos</h2>
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Buscar eventos..."
                    className="pl-8"
                    value={searchEventTerm}
                    onChange={(e) => setSearchEventTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {events.map((item) => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{item.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-sm text-gray-500">
                            {new Date(item.event_date).toLocaleDateString()} às {item.event_time}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingEvent(item)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEventDelete(item.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap mb-2">{item.description}</p>
                    {item.location && (
                      <p className="text-sm text-gray-500">Local: {item.location}</p>
                    )}
                    {item.image && (
                      <p className="text-sm text-gray-500">Imagem principal: {item.image}</p>
                    )}
                    {item.images && item.images.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm font-medium text-gray-500">Imagens adicionais:</p>
                        {item.images.map((url, index) => (
                          <p key={index} className="text-sm text-gray-500">{url}</p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="text-gray-500 text-center py-8">
                    Nenhum evento encontrado.
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="config">
            {/* ... keep existing code (config content) */}
          </TabsContent>

          <TabsContent value="footer">
            {/* ... keep existing code (footer content) */}
          </TabsContent>

          <TabsContent value="general">
            {/* ... keep existing code (general content) */}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
