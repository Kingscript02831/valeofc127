
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import EventCard from "@/components/EventCard";
import NewsCard from "@/components/NewsCard";
import PlaceCard from "@/components/PlaceCard";
import { supabase } from "@/integrations/supabase/client";
import { useTheme } from "@/components/ThemeProvider";
import StoryCircles from "@/components/StoryCircles";

type Event = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  end_time: string;
  location: string;
  maps_url: string;
  image: string;
  images: string[];
  entrance_fee: string;
  button_color: string;
  button_secondary_color: string;
  category_id: string;
};

type News = {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
  category: string;
};

type Place = {
  id: string;
  name: string;
  description: string;
  image: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  whatsapp: string;
  instagram: string;
  website: string;
  maps_url: string;
  latitude: number;
  longitude: number;
  category_id: string;
};

export default function Index() {
  const [events, setEvents] = useState<Event[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);

    // Fetch events
    const { data: eventsData } = await supabase
      .from("events")
      .select("*")
      .order("event_date", { ascending: true })
      .limit(5);

    if (eventsData) {
      setEvents(eventsData);
    }

    // Fetch news
    const { data: newsData } = await supabase
      .from("news")
      .select("*")
      .order("date", { ascending: false })
      .limit(5);

    if (newsData) {
      setNews(newsData);
    }

    // Fetch places
    const { data: placesData } = await supabase
      .from("places")
      .select("*")
      .limit(5);

    if (placesData) {
      setPlaces(placesData);
    }

    setIsLoading(false);
  }

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-white" : "bg-black"}`}>
      <Navbar />

      <main className="container mx-auto px-4 pt-16 pb-20">
        {/* Stories section */}
        <StoryCircles />
        
        <div className="border-t my-4 opacity-10" />
        
        {/* Events section */}
        <section className="my-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Eventos</h2>
            <Link
              to="/eventos"
              className="text-sm text-blue-500 hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {isLoading ? (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[250px] h-[180px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum evento encontrado
              </p>
            </div>
          )}
        </section>

        {/* News section */}
        <section className="my-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Notícias</h2>
            <Button variant="link" onClick={() => navigate("/noticias")}>
              Ver todas
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[120px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhuma notícia encontrada
              </p>
            </div>
          )}
        </section>

        {/* Places section */}
        <section className="my-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Locais</h2>
            <Link
              to="/locais"
              className="text-sm text-blue-500 hover:underline"
            >
              Ver todos
            </Link>
          </div>

          {isLoading ? (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[200px] h-[150px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : places.length > 0 ? (
            <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-100 dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">
                Nenhum local encontrado
              </p>
            </div>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
