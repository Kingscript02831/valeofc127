
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  onDelete 
}: EventListProps) => {
  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Lista de Eventos</h2>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            type="search"
            placeholder="Buscar eventos..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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
  );
};
