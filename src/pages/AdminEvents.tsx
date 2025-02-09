import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { Textarea } from "@/components/ui/textarea";
import { Search, Trash2 } from "lucide-react";

const AdminEvents = () => {
  const [newEvent, setNewEvent] = useState<Omit<Database['public']['Tables']['events']['Row'], 'id' | 'created_at' | 'updated_at'>>({
    title: "",
    description: "",
    event_date: new Date().toISOString(),
    event_time: "00:00",
    image: "",
    images: [],
    location: "",
    maps_url: null,
    owner_name: null,
    phone: null,
    social_media: null,
    website: null,
    whatsapp: null,
    category_id: null
  });

  const [editingEvent, setEditingEvent] = useState<Database['public']['Tables']['events']['Row'] | null>(null);
  const [events, setEvents] = useState<Database['public']['Tables']['events']['Row'][]>([]);
  const [searchEventTerm, setSearchEventTerm] = useState("");

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

  const handleEventSubmit = async () => {
    try {
      if (!newEvent.title || !newEvent.description || !newEvent.event_date || !newEvent.event_time) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

      const { error } = await supabase
        .from("events")
        .insert({
          ...newEvent,
          images: newEvent.images || [], 
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
        maps_url: null,
        owner_name: null,
        phone: null,
        social_media: null,
        website: null,
        whatsapp: null,
        category_id: null
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

      const { error } = await supabase
        .from("events")
        .update({
          title: editingEvent.title,
          description: editingEvent.description,
          event_date: editingEvent.event_date,
          event_time: editingEvent.event_time,
          image: editingEvent.image,
          images: editingEvent.images || [], 
          location: editingEvent.location,
          maps_url: editingEvent.maps_url,
          owner_name: editingEvent.owner_name,
          phone: editingEvent.phone,
          social_media: editingEvent.social_media,
          website: editingEvent.website,
          whatsapp: editingEvent.whatsapp
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
    <div className="space-y-6">
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
                onChange={(e) => setNewEvent({ 
                  ...newEvent, 
                  images: e.target.value.split('\n').filter(url => url.trim() !== '')
                })}
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
              <Label htmlFor="edit-additional-images">Links de Imagens Adicionais (uma por linha)</Label>
              <Textarea
                id="edit-additional-images"
                value={editingEvent.images?.join('\n') || ""}
                onChange={(e) => setEditingEvent({ 
                  ...editingEvent, 
                  images: e.target.value.split('\n').filter(url => url.trim() !== '')
                })}
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
          {events.map((event) => (
            <div key={event.id} className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{event.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-gray-500">
                      {new Date(event.event_date).toLocaleDateString()} às {event.event_time}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingEvent(event)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleEventDelete(event.id)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{event.description}</p>
              {event.location && (
                <p className="text-sm text-gray-500">Local: {event.location}</p>
              )}
              {event.image && (
                <p className="text-sm text-gray-500">Imagem: {event.image}</p>
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
    </div>
  );
};

export default AdminEvents;
