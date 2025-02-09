
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import EventCard from "@/components/EventCard";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  image?: string;
  images?: string[];
  location?: string;
  created_at: string;
  button_color?: string;
  button_secondary_color?: string;
  category_id?: string;
}

interface Category {
  id: string;
  name: string;
  background_color: string;
}

const Events = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  useEffect(() => {
    document.title = "Eventos | Vale Notícias";
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Category[];
    },
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("events")
        .select("*")
        .order("event_date", { ascending: true });

      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }

      if (selectedCategory !== "all") {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;
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
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Eventos</h1>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                type="search"
                placeholder="Buscar eventos..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas as Categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                {categories?.map((category) => (
                  <SelectItem
                    key={category.id}
                    value={category.id}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.background_color }}
                    />
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {isLoading ? (
          <LoadingSkeleton />
        ) : events && events.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <EventCard
                key={event.id}
                title={event.title}
                description={event.description}
                eventDate={event.event_date.split('T')[0]}
                eventTime={event.event_time}
                image={event.image}
                images={event.images}
                location={event.location}
                createdAt={event.created_at}
                buttonColor={event.button_color}
                buttonSecondaryColor={event.button_secondary_color}
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
