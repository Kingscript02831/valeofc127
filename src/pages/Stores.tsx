
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Globe, MapPin, Clock, User2, Facebook, Instagram, MessageCircle, Search, ChevronDown, ChevronUp, Wallet, Bell, Menu } from "lucide-react";
import { supabase } from "../integrations/supabase/client";
import type { StoreWithCategory } from "../types/stores";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import MediaCarousel from "../components/MediaCarousel";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const Stores = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedStores, setExpandedStores] = useState<Record<string, boolean>>({});

  useEffect(() => {
    document.title = "Lojas | Vale Notícias";
  }, []);

  const { data: categories } = useQuery({
    queryKey: ["categories-stores"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq('page_type', 'stores')
        .order("name");
      if (error) {
        console.error("Error fetching categories:", error);
        throw error;
      }
      return data;
    },
  });

  const { data: stores, isLoading } = useQuery({
    queryKey: ["stores", searchTerm, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("stores")
        .select(`
          id,
          name,
          description,
          address,
          owner_name,
          opening_hours,
          entrance_fee,
          maps_url,
          phone,
          whatsapp,
          website,
          image,
          images,
          video_urls,
          category_id,
          social_media,
          categories (
            name,
            background_color
          )
        `);

      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      const { data, error } = await query.order('name');
      
      if (error) {
        console.error("Error fetching stores:", error);
        throw error;
      }

      console.log("Stores data:", data);
      return data as StoreWithCategory[];
    },
  });

  const handleNotificationClick = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Faça login para ativar as notificações');
        return;
      }

      toast.success('Configurações de notificação atualizadas');
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

  const toggleExpand = (storeId: string) => {
    setExpandedStores(prev => ({
      ...prev,
      [storeId]: !prev[storeId]
    }));
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
                  type="search"
                  placeholder="Buscar lojas..."
                  className="pr-10 rounded-full bg-card/50 backdrop-blur-sm border-none shadow-lg"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
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
            {isLoading && (
              <div className="flex justify-center items-center h-64 col-span-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}
            
            {stores?.map((store) => {
              const processedVideoUrls = parseVideoUrls(store.video_urls);
              const socialMedia = store.social_media as { facebook?: string; instagram?: string } | null;

              return (
                <div
                  key={store.id}
                  className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-border"
                >
                  {(store.images?.length > 0 || processedVideoUrls.length > 0) && (
                    <MediaCarousel 
                      images={store.images || []}
                      videoUrls={processedVideoUrls}
                      title={store.name}
                    />
                  )}
                  
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h2 className="text-xl font-semibold text-foreground">{store.name}</h2>
                      {store.description && store.description.length > 150 && (
                        <button
                          onClick={() => toggleExpand(store.id)}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          {expandedStores[store.id] ? (
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
                    
                    {store.description && (
                      <p className={`text-muted-foreground text-sm ${!expandedStores[store.id] && "line-clamp-3"}`}>
                        {store.description}
                      </p>
                    )}

                    <div className={`space-y-2 ${!expandedStores[store.id] && "line-clamp-3"}`}>
                      {store.address && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{store.address}</span>
                        </div>
                      )}

                      {store.owner_name && (
                        <div className="flex items-center gap-2 text-sm">
                          <User2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{store.owner_name}</span>
                        </div>
                      )}

                      {store.opening_hours && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{store.opening_hours}</span>
                        </div>
                      )}

                      {store.entrance_fee && (
                        <div className="flex items-center gap-2 text-sm">
                          <Wallet className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Entrada: {store.entrance_fee}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border flex flex-wrap gap-3">
                      {store.phone && (
                        <a
                          href={`tel:${store.phone}`}
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                      )}

                      {store.whatsapp && (
                        <a
                          href={`https://wa.me/${store.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}

                      {store.website && (
                        <a
                          href={store.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300"
                        >
                          <Globe className="w-4 h-4" />
                        </a>
                      )}

                      {socialMedia && (
                        <>
                          {socialMedia.facebook && (
                            <a
                              href={socialMedia.facebook}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Facebook className="w-4 h-4" />
                            </a>
                          )}
                          {socialMedia.instagram && (
                            <a
                              href={socialMedia.instagram}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
                            >
                              <Instagram className="w-4 h-4" />
                            </a>
                          )}
                        </>
                      )}

                      {store.maps_url && (
                        <a
                          href={store.maps_url}
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
            {!isLoading && (!stores || stores.length === 0) && (
              <p className="text-muted-foreground col-span-full text-center py-8">
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
