import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";

type News = Database['public']['Tables']['news']['Row'];
type Event = Database['public']['Tables']['events']['Row'];

export default function Index() {
  const [news, setNews] = useState<News[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchNews();
    fetchEvents();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from("news")
        .select("*")
        .order("date", { ascending: false })
        .limit(6);

      if (error) {
        throw error;
      }

      if (data) {
        setNews(data);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar notícias: " + error.message);
    }
  };

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true })
        .limit(6);

      if (error) {
        throw error;
      }

      if (data) {
        setEvents(data);
      }
    } catch (error: any) {
      toast.error("Erro ao carregar eventos: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Notícias</h2>
          <NewsSection news={news} />
          <div className="mt-4 text-center">
            <Link to="/news" className="text-blue-500 hover:underline">
              Ver todas as notícias
            </Link>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Eventos</h2>
          <EventsSection events={events} />
          <div className="mt-4 text-center">
            <Link to="/events" className="text-blue-500 hover:underline">
              Ver todos os eventos
            </Link>
          </div>
        </section>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

const NewsSection = ({ news }: { news: News[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item) => (
        <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {item.file_path && (
            <img
              src={item.file_path}
              alt={item.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p className="text-gray-600 mb-4">{item.content}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(item.date).toLocaleDateString()}
              </span>
              <button
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                style={{ backgroundColor: item.button_color || '#9b87f5' }}
              >
                Ler mais
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EventsSection = ({ events }: { events: Event[] }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
          {event.file_path && (
            <img
              src={event.file_path}
              alt={event.title}
              className="w-full h-48 object-cover"
            />
          )}
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
            <p className="text-gray-600 mb-4">{event.description}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">
                {new Date(event.event_date).toLocaleDateString()}
              </span>
              <button
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
                style={{ backgroundColor: event.button_color || '#9b87f5' }}
              >
                Ver detalhes
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
