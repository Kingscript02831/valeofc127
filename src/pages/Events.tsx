
import { useState } from "react";
import { supabase } from "../integrations/supabase/client";
import type { Database } from "../integrations/supabase/types";
import { toast } from "sonner";
import EventCard from "../components/EventCard";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import BottomNav from "../components/BottomNav";
import Footer from "../components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

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
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', 'events'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('page_type', 'events')
        .order('name');
      if (error) {
        console.error('Error fetching categories:', error);
        toast.error('Erro ao carregar categorias');
        return [];
      }
      return data || [];
    },
    retry: false
  });

  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['events', searchTerm, selectedCategory],
    queryFn: async () => {
      try {
        let query = supabase
          .from('events')
          .select('*')
          .order('event_date', { ascending: true });

        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }

        const { data, error } = await query;

        if (error) {
          console.error('Supabase query error:', error);
          return [];
        }

        return data as Event[];
      } catch (err) {
        console.error('Error fetching events:', err);
        return [];
      }
    },
    retry: false
  });

  const handleNotificationClick = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Faça login para ativar as notificações');
        return;
      }

      const { data: existing } = await supabase
        .from('notifications')
        .select('enabled')
        .eq('user_id', user.id)
        .eq('type', 'events')
        .single();

      const newStatus = !existing?.enabled;

      const { error } = await supabase
        .from('notifications')
        .upsert({
          user_id: user.id,
          type: 'events',
          enabled: newStatus,
          title: 'Notificações de Eventos',
          message: newStatus ? 'Você receberá notificações de novos eventos' : 'Notificações de eventos desativadas',
          read: false
        });

      if (error) {
        console.error('Error updating notification settings:', error);
        toast.error('Erro ao atualizar notificações');
        return;
      }

      toast.success(newStatus 
        ? 'Notificações de eventos ativadas!' 
        : 'Notificações de eventos desativadas');

      navigate('/notify');
    } catch (error) {
      console.error('Error handling notifications:', error);
      toast.error('Erro ao configurar notificações');
    }
  };

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col gap-4">
          <div className="sticky top-16 z-10 bg-background/80 backdrop-blur-sm pb-4">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNotificationClick}
                className="hover:scale-105 transition-transform text-foreground"
              >
                <Bell className="h-5 w-5" />
              </Button>
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar eventos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10 rounded-full bg-card/50 backdrop-blur-sm border-none shadow-lg"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Search className="h-5 w-5 text-foreground" />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:scale-105 transition-transform text-foreground rounded-full shadow-lg"
                  >
                    <Menu className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem
                    onClick={() => setSelectedCategory(null)}
                    className={`${!selectedCategory ? "bg-accent" : ""}`}
                  >
                    Todas as categorias
                  </DropdownMenuItem>
                  {categories?.map((category) => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`${selectedCategory === category.id ? "bg-accent" : ""}`}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, index) => (
                <LoadingEventCard key={index} />
              ))
            ) : events.length > 0 ? (
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
            ) : (
              <p className="col-span-full text-center py-8 text-muted-foreground">
                Nenhum evento encontrado
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
