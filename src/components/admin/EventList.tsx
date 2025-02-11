
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

type Event = Database['public']['Tables']['events']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface EventListProps {
  events: Event[];
  categories: Category[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export const EventList = ({
  events,
  categories,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
}: EventListProps) => {
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return "Sem categoria";
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Categoria não encontrada";
  };

  const formatDateTime = (date: string, time: string) => {
    const eventDate = new Date(date);
    const formattedDate = eventDate.toLocaleDateString("pt-BR");
    return `${formattedDate} às ${time}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-500" />
        <Input
          type="text"
          placeholder="Buscar eventos..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-4">
        {events.map((event) => (
          <div
            key={event.id}
            className="bg-gray-50 p-4 rounded-lg shadow-sm space-y-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-600">
                  {formatDateTime(event.event_date, event.event_time)}
                </p>
                <p className="text-sm text-gray-600">
                  Categoria: {getCategoryName(event.category_id)}
                </p>
                {event.location && (
                  <p className="text-sm text-gray-600">Local: {event.location}</p>
                )}
                {event.url_maps_events && (
                  <a 
                    href={event.url_maps_events} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Ver no Google Maps
                  </a>
                )}
                {event.numero_whatsapp_events && (
                  <p className="text-sm text-gray-600">
                    WhatsApp do Evento: {event.numero_whatsapp_events}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(event)}
                >
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(event.id)}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <p className="text-center text-gray-500">Nenhum evento encontrado.</p>
        )}
      </div>
    </div>
  );
};
