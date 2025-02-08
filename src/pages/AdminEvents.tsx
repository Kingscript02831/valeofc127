
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { EventForm } from "@/components/admin/EventForm";
import { EventList } from "@/components/admin/EventList";

type Event = Database['public']['Tables']['events']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const AdminEvents = () => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [searchEventTerm, setSearchEventTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);

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

  const fetchEvents = async () => {
    let query = supabase
      .from("events")
      .select("*, categories(*)")
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
      if (!eventData.title || !eventData.description || !eventData.event_date || !eventData.event_time) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }

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
      if (!editingEvent || !eventData.title || !eventData.description) {
        toast.error("Preencha todos os campos obrigatórios");
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
        <EventList
          events={events}
          searchTerm={searchEventTerm}
          onSearchChange={setSearchEventTerm}
          onEdit={setEditingEvent}
          onDelete={handleEventDelete}
        />
      </div>
    </div>
  );
};

export default AdminEvents;
