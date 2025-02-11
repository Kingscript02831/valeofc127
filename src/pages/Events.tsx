
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type Event = Database['public']['Tables']['events']['Row'];

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        setEvents(data);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar eventos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (date: string, time: string) => {
    const eventDate = new Date(date);
    const formattedDate = eventDate.toLocaleDateString("pt-BR");
    return `${formattedDate} às ${time}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Eventos</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            {event.image && (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover"
              />
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{event.title}</h2>
              <p className="text-gray-600 mb-2">
                {formatDateTime(event.event_date, event.event_time)}
              </p>
              {event.location && (
                <p className="text-gray-600 mb-2">Local: {event.location}</p>
              )}
              <p className="text-gray-700 mb-4">{event.description}</p>
              
              <div className="space-y-2">
                {event.url_maps_events && (
                  <a
                    href={event.url_maps_events}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline block"
                  >
                    Ver no Google Maps
                  </a>
                )}
                {event.numero_whatsapp_events && (
                  <a
                    href={`https://wa.me/${event.numero_whatsapp_events.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 hover:underline block"
                  >
                    Contato via WhatsApp
                  </a>
                )}
                {event.entrance_fee && (
                  <p className="text-gray-600">
                    Valor da entrada: {event.entrance_fee}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-gray-500">Nenhum evento encontrado.</p>
          </div>
        )}
      </div>
    </div>
  );
}
