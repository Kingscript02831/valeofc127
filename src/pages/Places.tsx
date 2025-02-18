import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Globe, MapPin, Clock, User2, Facebook, Instagram, MessageCircle, Search, ChevronDown, ChevronUp, Wallet, Bell, Menu } from "lucide-react";
import type { Database } from "@/types/supabase";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import MediaCarousel from "../components/MediaCarousel";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type Place = Database["public"]["Tables"]["places"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];
type SocialMedia = { facebook?: string; instagram?: string };

const Places = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedPlaces, setExpandedPlaces] = useState<Record<string, boolean>>({});

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
      if (error) throw error;
      return data;
    },
  });

  const { data: places, isLoading } = useQuery({
    queryKey: ["places", searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("places")
        .select("*")
        .order("name");

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query;
      if (error) throw error;
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

      // Verifica se já existe uma configuração de notificação
      const { data: existing } = await supabase
        .from('notifications')
        .select('enabled')
        .eq('user_id', user.id)
        .eq('type', 'places')
        .single();

      const newStatus = !existing?.enabled;

      // Atualiza ou cria a configuração de notificação
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

      // Redireciona para mostrar a notificação
      navigate('/notify');
    } catch (error) {
      console.error('Error handling notifications:', error);
      toast.error('Erro ao configurar notificações');
    }
  };

  const parseVideoUrls = (urls: string[] | null) => {
    if (!urls) return [];
    return urls.map(url => {
      if (url.includes('dropbox.com')) {
        return url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      }
      return url;
    });
  };

  const toggleExpand = (placeId: string) => {
    setExpandedPlaces(prev => ({
      ...prev,
      [placeId]: !prev[placeId]
    }));
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
            {places?.map((place) => {
              const socialMedia = place.social_media as SocialMedia;
              const processedVideoUrls = parseVideoUrls(place.video_urls);

              return (
                <div
                  key={place.id}
                  className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-border"
                >
                  {(place.images?.length > 0 || processedVideoUrls.length > 0) && (
                    <MediaCarousel 
                      images={place.images || []}
                      videoUrls={processedVideoUrls}
                      title={place.name}
                    />
                  )}
                  
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-foreground">{place.name}</h2>
                      {place.description && place.description.length > 150 && (
                        <button
                          onClick={() => toggleExpand(place.id)}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          {expandedPlaces[place.id] ? (
                            <>
                              Ver menos
                              <ChevronUp className="h-4 w-4" />
                            </>
                          ) : (
                            <>
                              Ver mais
                              <ChevronDown className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                    
                    {place.description && (
                      <p className={`text-muted-foreground text-sm ${!expandedPlaces[place.id] && "line-clamp-3"}`}>
                        {place.description}
                      </p>
                    )}

                    <div className={`space-y-2 ${!expandedPlaces[place.id] && "line-clamp-3"}`}>
                      {place.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{place.address}</span>
                        </div>
                      )}

                      {place.owner_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <User2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{place.owner_name}</span>
                        </div>
                      )}

                      {place.opening_hours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{place.opening_hours}</span>
                        </div>
                      )}

                      {place.entrance_fee && (
                        <div className="flex items-center gap-2 text-sm">
                          <Wallet className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Entrada: {place.entrance_fee}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border flex flex-wrap gap-3">
                      {place.phone && (
                        <a
                          href={`tel:${place.phone}`}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}

                      {place.whatsapp && (
                        <a
                          href={`https://wa.me/${place.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}

                      {socialMedia?.facebook && (
                        <a
                          href={socialMedia.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Facebook className="w-4 h-4" />
                        </a>
                      )}

                      {socialMedia?.instagram && (
                        <a
                          href={socialMedia.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
                        >
                          <Instagram className="w-4 h-4" />
                        </a>
                      )}

                      {place.maps_url && (
                        <a
                          href={place.maps_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <MapPin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
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
