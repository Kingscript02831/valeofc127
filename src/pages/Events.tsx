
import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";
import { toast } from "sonner";
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { Skeleton } from "@/components/ui/skeleton";

type Event = Database['public']['Tables']['events']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

const LoadingEventCard = () => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-8 w-full" />
    </div>
  </div>
);

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
    fetchCategories();
  }, []);

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

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Eventos</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            Array(6).fill(0).map((_, index) => (
              <LoadingEventCard key={index} />
            ))
          ) : (
            events.map((event) => {
              const category = categories.find(cat => cat.id === event.category_id);
              
              return (
                <EventCard
                  key={event.id}
                  title={event.title}
                  description={event.description}
                  eventDate={event.event_date}
                  eventTime={event.event_time}
                  endTime={event.end_time}
                  image={event.file_path || event.image}
                  images={event.images || []}
                  location={event.location}
                  mapsUrl={event.url_maps_events}
                  entranceFee={event.entrance_fee}
                  createdAt={event.created_at}
                  buttonColor={event.button_color}
                  buttonSecondaryColor={event.button_secondary_color}
                  videoUrl={event.video_url}
                  video_urls={event.video_urls}
                  category={category ? {
                    id: category.id,
                    name: category.name,
                    background_color: category.background_color
                  } : null}
                />
              );
            })
          )}

          {!loading && events.length === 0 && (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">Nenhum evento encontrado.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
