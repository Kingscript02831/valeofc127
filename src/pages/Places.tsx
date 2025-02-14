import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Globe, MapPin, Clock, Ticket, User2, Facebook, Instagram, MessageCircle, Search } from "lucide-react";
import type { Database } from "../integrations/supabase/types";
import { supabase } from "../integrations/supabase/client";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

type Place = Database["public"]["Tables"]["places"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

const Places = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.title = "Lugares | Vale Notícias";
  }, []);

  const toggleDescription = (id: string) => {
    const newExpanded = new Set(expandedDescriptions);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedDescriptions(newExpanded);
  };

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

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Lugares</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar lugares..."
              className="pl-8 bg-background text-foreground border-border"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              !selectedCategory
                ? "bg-primary text-primary-foreground dark:bg-gray-700 dark:text-gray-100"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            }`}
          >
            Todas
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? "text-primary-foreground dark:text-gray-100"
                  : "hover:opacity-80 dark:text-gray-300"
              }`}
              style={{
                backgroundColor:
                  selectedCategory === category.id
                    ? category.background_color || "#D6BCFA"
                    : category.background_color + "40" || "#D6BCFA40",
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            places?.map((place) => (
              <div
                key={place.id}
                className="bg-card text-card-foreground rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-border"
              >
                {place.file_path && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={place.file_path}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">{place.name}</h2>
                  
                  {place.description && (
                    <div>
                      <p className={`text-muted-foreground text-sm ${!expandedDescriptions.has(place.id) ? "line-clamp-3" : ""}`}>
                        {place.description}
                      </p>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-sm text-primary hover:text-primary/80"
                        onClick={() => toggleDescription(place.id)}
                      >
                        {expandedDescriptions.has(place.id) ? "Ver menos" : "Ver mais"}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
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
                        <Ticket className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{place.entrance_fee}</span>
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

                    {place.social_media && (
                      <>
                        {(place.social_media as any).facebook && (
                          <a
                            href={(place.social_media as any).facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Facebook className="w-4 h-4" />
                          </a>
                        )}
                        {(place.social_media as any).instagram && (
                          <a
                            href={(place.social_media as any).instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-800 dark:text-pink-400 dark:hover:text-pink-300"
                          >
                            <Instagram className="w-4 h-4" />
                          </a>
                        )}
                      </>
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
            ))
          )}
          {!isLoading && (!places || places.length === 0) && (
            <p className="text-muted-foreground col-span-full text-center py-8">
              Nenhum lugar encontrado.
            </p>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
};

export default Places;
