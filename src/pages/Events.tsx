
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  image?: string;
  location?: string;
}

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Eventos | Vale Notícias";
  }, []);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Event[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Eventos</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar eventos..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events?.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                {event.image && (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  <div className="text-sm text-gray-500">
                    <p>Data: {new Date(event.event_date).toLocaleDateString()}</p>
                    <p>Horário: {event.event_time}</p>
                    {event.location && <p>Local: {event.location}</p>}
                  </div>
                </div>
              </div>
            ))}
            {!isLoading && (!events || events.length === 0) && (
              <p className="text-gray-500 text-center col-span-full">
                Nenhum evento encontrado.
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
