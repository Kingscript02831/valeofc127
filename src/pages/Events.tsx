
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  image?: string;
  images?: string[];
  location?: string;
}

const Events = () => {
  useEffect(() => {
    document.title = "Eventos | Vale Notícias";
  }, []);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const LoadingSkeleton = () => (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="overflow-hidden rounded-lg border bg-card">
          <Skeleton className="h-48 w-full" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Eventos</h1>
        
        {isLoading ? (
          <LoadingSkeleton />
        ) : events && events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                description={event.description}
                eventDate={event.event_date}
                eventTime={event.event_time}
                image={event.image}
                images={event.images}
                location={event.location}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">
            Nenhum evento encontrado no momento.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Events;
