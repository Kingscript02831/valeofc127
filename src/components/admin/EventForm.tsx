import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { Database } from "@/types/supabase";

type Event = Database['public']['Tables']['events']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface EventFormProps {
  initialData?: Event;
  categories: Category[];
  onSubmit: (eventData: Omit<Event, 'id' | 'created_at'>) => void;
  onCancel?: () => void;
}

export const EventForm = ({ initialData, categories, onSubmit, onCancel }: EventFormProps) => {
  const [eventData, setEventData] = useState<Omit<Event, 'id' | 'created_at'>>({
    title: "",
    description: "",
    event_date: new Date().toISOString().split('T')[0],
    event_time: "00:00",
    end_time: "00:00",
    file_path: "",
    images: [],
    location: "",
    maps_url: "",
    entrance_fee: "",
    video_url: "",
    video_urls: [],
    button_color: "#000000",
    button_secondary_color: "#000000",
    category_id: "",
  });

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newVideoUrl, setNewVideoUrl] = useState("");

  useEffect(() => {
    if (initialData) {
      setEventData({
        ...initialData,
        event_date: new Date(initialData.event_date).toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const handleAddImage = () => {
    if (newImageUrl && !eventData.images?.includes(newImageUrl)) {
      setEventData({
        ...eventData,
        images: [...(eventData.images || []), newImageUrl]
      });
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (imageUrl: string) => {
    setEventData({
      ...eventData,
      images: eventData.images?.filter(url => url !== imageUrl) || []
    });
  };

  const handleAddVideo = () => {
    if (newVideoUrl && !eventData.video_urls?.includes(newVideoUrl)) {
      setEventData({
        ...eventData,
        video_urls: [...(eventData.video_urls || []), newVideoUrl]
      });
      setNewVideoUrl("");
    }
  };

  const handleRemoveVideo = (videoUrl: string) => {
    setEventData({
      ...eventData,
      video_urls: eventData.video_urls?.filter(url => url !== videoUrl) || []
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(eventData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título</Label>
          <Input
            id="title"
            value={eventData.title}
            onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Categoria</Label>
          <Select
            value={eventData.category_id || ""}
            onValueChange={(value) => setEventData({ ...eventData, category_id: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={eventData.description}
            onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="event_date">Data</Label>
            <Input
              id="event_date"
              type="date"
              value={eventData.event_date}
              onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="event_time">Horário</Label>
            <Input
              id="event_time"
              type="time"
              value={eventData.event_time}
              onChange={(e) => setEventData({ ...eventData, event_time: e.target.value })}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="end_time">Horário de Término</Label>
          <Input
            id="end_time"
            type="time"
            value={eventData.end_time}
            onChange={(e) => setEventData({ ...eventData, end_time: e.target.value })}
            required
          />
        </div>

        <div className="col-span-2 space-y-2">
          <Label>Imagens</Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="URL da imagem"
              />
              <Button type="button" onClick={handleAddImage}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {eventData.images?.map((url, index) => (
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
          <Label>Vídeos do YouTube</Label>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newVideoUrl}
                onChange={(e) => setNewVideoUrl(e.target.value)}
                placeholder="URL do vídeo do YouTube"
              />
              <Button type="button" onClick={handleAddVideo}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {eventData.video_urls?.map((url, index) => (
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

        <div>
          <Label htmlFor="file_path">Imagem Principal</Label>
          <Input
            id="file_path"
            value={eventData.file_path || ""}
            onChange={(e) => setEventData({ ...eventData, file_path: e.target.value })}
            placeholder="URL da imagem principal"
          />
        </div>

        <div>
          <Label htmlFor="video_url">Link do Vídeo</Label>
          <Input
            id="video_url"
            value={eventData.video_url || ""}
            onChange={(e) => setEventData({ ...eventData, video_url: e.target.value })}
            placeholder="URL do vídeo (YouTube, Vimeo, etc.)"
          />
        </div>

        <div>
          <Label htmlFor="location">Local</Label>
          <Input
            id="location"
            value={eventData.location || ""}
            onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="maps_url">Link do Google Maps</Label>
          <Input
            id="maps_url"
            type="url"
            value={eventData.maps_url || ""}
            onChange={(e) => setEventData({ ...eventData, maps_url: e.target.value })}
            placeholder="https://maps.google.com/..."
          />
        </div>

        <div>
          <Label htmlFor="entrance_fee">Valor da Entrada</Label>
          <Input
            id="entrance_fee"
            value={eventData.entrance_fee || ""}
            onChange={(e) => setEventData({ ...eventData, entrance_fee: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="button_color">Cor do Botão</Label>
            <Input
              id="button_color"
              type="color"
              value={eventData.button_color || "#9b87f5"}
              onChange={(e) => setEventData({ ...eventData, button_color: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="button_secondary_color">Cor Secundária do Botão</Label>
            <Input
              id="button_secondary_color"
              type="color"
              value={eventData.button_secondary_color || "#7E69AB"}
              onChange={(e) => setEventData({ ...eventData, button_secondary_color: e.target.value })}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">
          {initialData ? "Salvar Alterações" : "Adicionar Evento"}
        </Button>
      </div>
    </form>
  );
};
