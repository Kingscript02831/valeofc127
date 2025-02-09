
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { EventForm } from "@/components/admin/EventForm";

type Event = Database['public']['Tables']['events']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const AdminEvents = () => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchEventTerm, setSearchEventTerm] = useState("");

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("page_type", "events");

    if (error) {
      toast.error("Erro ao carregar categorias");
      return;
    }

    if (data) {
      setCategories(data);
    }
  };

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
    fetchCategories();
    fetchEvents();
  }, [searchEventTerm]);

  const handleEventSubmit = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase
        .from("events")
        .insert(eventData);

      if (error) throw error;

      toast.success("Evento adicionado com sucesso!");
      fetchEvents();
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast.error("Erro ao adicionar evento: " + error.message);
    }
  };

  const handleEventEdit = async (eventData: Omit<Event, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!editingEvent?.id) {
        toast.error("ID do evento não encontrado");
        return;
      }

      const { error } = await supabase
        .from("events")
        .update(eventData)
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
          <EventForm 
            categories={categories}
            onSubmit={handleEventSubmit}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Editar Evento</h2>
          <EventForm
            initialData={editingEvent}
            categories={categories}
            onSubmit={handleEventEdit}
            onCancel={() => setEditingEvent(null)}
          />
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
                    {event.category_id && (
                      <span className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        {categories.find(c => c.id === event.category_id)?.name}
                      </span>
                    )}
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
              {event.button_color && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-gray-500">Cor do botão:</span>
                  <div 
                    className="w-6 h-6 rounded border"
                    style={{ 
                      background: event.button_secondary_color 
                        ? `linear-gradient(to right, ${event.button_color}, ${event.button_secondary_color})`
                        : event.button_color 
                    }}
                  />
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
    </div>
  );
};

export default AdminEvents;
