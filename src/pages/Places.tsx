
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaceCard } from "@/components/PlaceCard";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Places = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Lugares | Vale Notícias";
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["categories-places"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq('page_type', 'places')
        .order("name");
      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      return data;
    },
  });

  const { data: places, isLoading } = useQuery({
    queryKey: ["places", searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("places")
        .select("*, categories(name, background_color)");

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query.order('name');
      
      if (error) {
        console.error("Error fetching places:", error);
        throw error;
      }

      return data;
    },
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
        .eq('type', 'places')
        .single();

      const newStatus = !existing?.enabled;

      const { error } = await supabase
        .from('notifications')
        .upsert({
          user_id: user.id,
          type: 'places',
          enabled: newStatus,
          title: 'Notificações de Lugares',
          message: newStatus ? 'Você receberá notificações de novos lugares' : 'Notificações de lugares desativadas',
          read: false
        });

      if (error) {
        console.error('Error updating notification settings:', error);
        toast.error('Erro ao atualizar notificações');
        return;
      }

      toast.success(newStatus 
        ? 'Notificações de lugares ativadas!' 
        : 'Notificações de lugares desativadas');

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
      <main className="flex-1 container mx-auto py-8 px-4">
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
                placeholder="Buscar lugares..."
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

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places?.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
            {!isLoading && (!places || places.length === 0) && (
              <p className="text-muted-foreground col-span-full text-center py-8">
                Nenhum lugar encontrado.
              </p>
            )}
          </div>
        )}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Places;
