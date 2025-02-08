
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Event = Database['public']['Tables']['events']['Row'];

interface EventTabProps {
  searchEventTerm: string;
  setSearchEventTerm: (term: string) => void;
}

const EventsTab = ({ searchEventTerm, setSearchEventTerm }: EventTabProps) => {
  const [newEvent, setNewEvent] = useState<Omit<Event, 'id' | 'created_at' | 'updated_at'>>({
    title: "",
    description: "",
    event_date: new Date().toISOString(),
    event_time: "00:00",
    image: "",
    images: [],
    location: "",
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);

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

      // Combine date and time into a single ISO string
      const combinedDateTime = new Date(newEvent.event_date);
      const [hours, minutes] = newEvent.event_time.split(':');
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from("events")
        .insert({
          ...newEvent,
          event_date: combinedDateTime.toISOString(),
          images: newEvent.images || [], // Ensure images is always an array
        });

      if (error) throw error;

      toast.success("Evento adicionado com sucesso!");
      setNewEvent({
        title: "",
        description: "",
        event_date: new Date().toISOString(),
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

      // Combine date and time into a single ISO string
      const combinedDateTime = new Date(editingEvent.event_date);
      const [hours, minutes] = editingEvent.event_time.split(':');
      combinedDateTime.setHours(parseInt(hours), parseInt(minutes));

      const { error } = await supabase
        .from("events")
        .update({
          title: editingEvent.title,
          description: editingEvent.description,
          event_date: combinedDateTime.toISOString(),
          event_time: editingEvent.event_time,
          image: editingEvent.image,
          images: editingEvent.images || [], // Ensure images is always an array
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
                  value={new Date(newEvent.event_date).toISOString().split('T')[0]}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_date: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
              <div>
                <Label htmlFor="event_time">Horário do Evento</Label>
                <Input
                  id="event_time"
                  type="time"
                  value={newEvent.event_time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, event_time: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Localização</Label>
              <Input
                id="location"
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
                }
                placeholder="Digite o local do evento"
              />
            </div>

            <div>
              <Label htmlFor="image">Link da Imagem</Label>
              <Input
                id="image"
                value={newEvent.image}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, image: e.target.value })
                }
                placeholder="https://exemplo.com/imagem.jpg"
              />
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
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, title: e.target.value })
                }
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={editingEvent.description}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, description: e.target.value })
                }
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-event_date">Data do Evento</Label>
                <Input
                  id="edit-event_date"
                  type="date"
                  value={new Date(editingEvent.event_date).toISOString().split('T')[0]}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, event_date: new Date(e.target.value).toISOString() })
                  }
                />
              </div>
              <div>
                <Label htmlFor="edit-event_time">Horário do Evento</Label>
                <Input
                  id="edit-event_time"
                  type="time"
                  value={editingEvent.event_time}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, event_time: e.target.value })
                  }
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-location">Localização</Label>
              <Input
                id="edit-location"
                value={editingEvent.location}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, location: e.target.value })
                }
                placeholder="Digite o local do evento"
              />
            </div>

            <div>
              <Label htmlFor="edit-image">Link da Imagem</Label>
              <Input
                id="edit-image"
                value={editingEvent.image}
                onChange={(e) =>
                  setEditingEvent({ ...editingEvent, image: e.target.value })
                }
                placeholder="https://exemplo.com/imagem.jpg"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleEventEdit}>Salvar Alterações</Button>
              <Button variant="outline" onClick={() => setEditingEvent(null)}>
                Cancelar
              </Button>
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
                      {new Date(item.event_date).toLocaleDateString()} - {item.event_time}
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
              {item.image && <p className="text-sm text-gray-500">Imagem: {item.image}</p>}
              {item.location && (
                <p className="text-sm text-gray-500">Localização: {item.location}</p>
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

export default EventsTab;
