
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

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
    image: "",
    images: [],
    location: "",
    maps_url: "",
    entrance_fee: "",
    video_url: "",
    button_color: "#9b87f5",
    button_secondary_color: "#7E69AB",
    category_id: "",
    owner_name: "",
    phone: "",
    website: "",
    whatsapp: "",
    social_media: null,
    user_id: null
  });

  useEffect(() => {
    if (initialData) {
      setEventData({
        ...initialData,
        event_date: new Date(initialData.event_date).toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(eventData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={eventData.title}
          onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
          required
        />
      </div>

      <div>
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

      <div>
        <Label htmlFor="location">Local</Label>
        <Input
          id="location"
          value={eventData.location || ""}
          onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
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

      <div>
        <Label htmlFor="image">Imagem Principal</Label>
        <Input
          id="image"
          value={eventData.image || ""}
          onChange={(e) => setEventData({ ...eventData, image: e.target.value })}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit">
          {initialData ? "Salvar Alterações" : "Adicionar Evento"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
};
