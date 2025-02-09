
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Database } from "@/integrations/supabase/types";

type Event = Database['public']['Tables']['events']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface EventFormProps {
  initialData?: Partial<Event>;
  categories: Category[];
  onSubmit: (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel?: () => void;
}

export const EventForm = ({ initialData, categories, onSubmit, onCancel }: EventFormProps) => {
  const [eventData, setEventData] = useState<Omit<Event, 'id' | 'created_at' | 'updated_at'>>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    event_date: initialData?.event_date || new Date().toISOString(),
    event_time: initialData?.event_time || "00:00",
    image: initialData?.image || "",
    images: initialData?.images || [],
    location: initialData?.location || "",
    maps_url: initialData?.maps_url || null,
    owner_name: initialData?.owner_name || null,
    phone: initialData?.phone || null,
    social_media: initialData?.social_media || null,
    website: initialData?.website || null,
    whatsapp: initialData?.whatsapp || null,
    category_id: initialData?.category_id || null,
    button_color: initialData?.button_color || null,
    button_secondary_color: initialData?.button_secondary_color || null
  });

  const handleSubmit = () => {
    onSubmit(eventData);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={eventData.title}
          onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={eventData.category_id || "none"}
          onValueChange={(value) => setEventData({ ...eventData, category_id: value === "none" ? null : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Sem categoria</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={eventData.description}
          onChange={(e) => setEventData({ ...eventData, description: e.target.value })}
          className="min-h-[100px]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="event_date">Data do Evento</Label>
          <Input
            id="event_date"
            type="date"
            value={eventData.event_date.split('T')[0]}
            onChange={(e) => setEventData({ ...eventData, event_date: e.target.value })}
          />
        </div>
        
        <div>
          <Label htmlFor="event_time">Horário do Evento</Label>
          <Input
            id="event_time"
            type="time"
            value={eventData.event_time}
            onChange={(e) => setEventData({ ...eventData, event_time: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="location">Local</Label>
        <Input
          id="location"
          value={eventData.location || ""}
          onChange={(e) => setEventData({ ...eventData, location: e.target.value })}
          placeholder="Local do evento"
        />
      </div>

      <div>
        <Label htmlFor="image">Link da Imagem Principal</Label>
        <Input
          id="image"
          value={eventData.image || ""}
          onChange={(e) => setEventData({ ...eventData, image: e.target.value })}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>

      <div>
        <Label htmlFor="additional_images">Links de Imagens Adicionais (uma por linha)</Label>
        <Textarea
          id="additional_images"
          value={eventData.images?.join('\n') || ""}
          onChange={(e) => setEventData({ 
            ...eventData, 
            images: e.target.value.split('\n').filter(url => url.trim() !== '')
          })}
          placeholder="https://exemplo.com/imagem2.jpg&#10;https://exemplo.com/imagem3.jpg"
          className="min-h-[100px]"
        />
        <p className="text-sm text-gray-500 mt-1">
          Adicione uma URL por linha para incluir múltiplas imagens
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="button_color">Cor do Botão</Label>
          <div className="flex gap-2">
            <Input
              id="button_color"
              type="color"
              value={eventData.button_color || "#000000"}
              onChange={(e) => setEventData({ ...eventData, button_color: e.target.value })}
              className="w-16"
            />
            <Input
              value={eventData.button_color || "#000000"}
              onChange={(e) => setEventData({ ...eventData, button_color: e.target.value })}
              placeholder="#000000"
            />
          </div>
        </div>
        
        <div>
          <Label htmlFor="button_secondary_color">Cor Secundária do Botão (opcional)</Label>
          <div className="flex gap-2">
            <Input
              id="button_secondary_color"
              type="color"
              value={eventData.button_secondary_color || "#000000"}
              onChange={(e) => setEventData({ ...eventData, button_secondary_color: e.target.value })}
              className="w-16"
            />
            <Input
              value={eventData.button_secondary_color || "#000000"}
              onChange={(e) => setEventData({ ...eventData, button_secondary_color: e.target.value })}
              placeholder="#000000"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Se definida, criará um efeito gradiente com a cor principal
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit}>
          {initialData ? "Salvar Alterações" : "Adicionar Evento"}
        </Button>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
};

