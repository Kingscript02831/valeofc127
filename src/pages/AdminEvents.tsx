
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { EventForm } from "@/components/admin/EventForm";
import { EventList } from "@/components/admin/EventList";

type Event = Database['public']['Tables']['events']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const AdminEvents = () => {
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchEventTerm, setSearchEventTerm] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchEvents();
  }, [searchEventTerm]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("page_type", "events");

      if (error) {
        console.error("Error fetching categories:", error);
        toast.error("Erro ao carregar categorias");
        return;
      }

      if (data) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Error in fetchCategories:", error);
      toast.error("Erro ao carregar categorias");
    }
  };

  const fetchEvents = async () => {
    try {
      let query = supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (searchEventTerm) {
        query = query.ilike("title", `%${searchEventTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching events:", error);
        toast.error("Erro ao carregar eventos");
        return;
      }

      if (data) {
        setEvents(data);
      }
    } catch (error) {
      console.error("Error in fetchEvents:", error);
      toast.error("Erro ao carregar eventos");
    }
  };

  const handleEventSubmit = async (eventData: Omit<Event, 'id' | 'created_at'>) => {
    try {
      const { error } = await supabase
        .from("events")
        .insert(eventData);

      if (error) {
        console.error("Error adding event:", error);
        throw error;
      }

      toast.success("Evento adicionado com sucesso!");
      fetchEvents();
    } catch (error: any) {
      console.error("Error adding event:", error);
      toast.error("Erro ao adicionar evento: " + error.message);
    }
  };

  const handleEventEdit = async (eventData: Omit<Event, 'id' | 'created_at'>) => {
    try {
      if (!editingEvent?.id) {
        toast.error("ID do evento não encontrado");
        return;
      }

      const { error } = await supabase
        .from("events")
        .update(eventData)
        .eq("id", editingEvent.id);

      if (error) {
        console.error("Error updating event:", error);
        throw error;
      }

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

      if (error) {
        console.error("Error deleting event:", error);
        throw error;
      }

      toast.success("Evento removido com sucesso!");
      fetchEvents();
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error("Erro ao remover evento: " + error.message);
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
          categories={categories}
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
