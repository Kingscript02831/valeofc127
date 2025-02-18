import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import StoreCard from "@/components/StoreCard";

type Store = Database["public"]["Tables"]["stores"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

const Stores = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories', 'stores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('page_type', 'stores')
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

  const { data: stores = [], isLoading } = useQuery<Store[]>({
    queryKey: ['stores', searchTerm, selectedCategory],
    queryFn: async () => {
      try {
        let query = supabase
          .from('stores')
          .select('*')
          .order('name');

        if (searchTerm) {
          query = query.ilike('name', `%${searchTerm}%`);
        }

        if (selectedCategory) {
          query = query.eq('category_id', selectedCategory);
        }

        const { data, error } = await query;
        
        if (error) {
          console.error('Supabase query error:', error);
          return [];
        }
        
        return data as Store[];
      } catch (err) {
        console.error('Error fetching stores:', err);
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
        .eq('type', 'stores')
        .single();

      const newStatus = !existing?.enabled;

      const { error } = await supabase
        .from('notifications')
        .upsert({
          user_id: user.id,
          type: 'stores',
          enabled: newStatus,
          title: 'Notificações de Lojas',
          message: newStatus ? 'Você receberá notificações de novas lojas' : 'Notificações de lojas desativadas',
          read: false
        });

      if (error) {
        console.error('Error updating notification settings:', error);
        toast.error('Erro ao atualizar notificações');
        return;
      }

      toast.success(newStatus 
        ? 'Notificações de lojas ativadas!' 
        : 'Notificações de lojas desativadas');

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
                  placeholder="Buscar lojas..."
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
              <p>Carregando...</p>
            ) : stores.length > 0 ? (
              stores.map((store) => (
                <StoreCard
                  key={store.id}
                  id={store.id}
                  name={store.name}
                  address={store.address}
                  phone={store.phone}
                  whatsapp={store.whatsapp}
                  website={store.website}
                  maps_url={store.maps_url}
                  images={store.images || []}
                  social_media={store.social_media}
                  category_id={store.category_id}
                  description={store.description}
                  opening_hours={store.opening_hours}
                />
              ))
            ) : (
              <p className="text-gray-500 col-span-full text-center py-8">
                Nenhuma loja encontrada.
              </p>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Stores;
