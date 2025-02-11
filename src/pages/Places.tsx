
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Phone, Globe, MapPin, Clock, Ticket, User2, Facebook, Instagram, MessageCircle, Search, ChevronDown, ChevronUp } from "lucide-react";
import type { Database } from "../integrations/supabase/types";
import { supabase } from "../integrations/supabase/client";
import Navbar from "../components/Navbar";
import SubNav from "../components/SubNav";
import Footer from "../components/Footer";
import BottomNav from "../components/BottomNav";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Place = Database["public"]["Tables"]["places"]["Row"];
type Category = Database["public"]["Tables"]["categories"]["Row"];

const Places = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([]);

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

  const toggleDescription = (id: string) => {
    setExpandedDescriptions(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex flex-col pb-[72px] md:pb-0">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
          <h1 className="text-3xl font-bold">Lugares</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
            <Input
              type="search"
              placeholder="Buscar lugares..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Categories Section */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              !selectedCategory
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
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
                  ? "text-white"
                  : "hover:opacity-80"
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
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places?.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {place.image && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 space-y-4">
                  <h2 className="text-xl font-semibold">{place.name}</h2>
                  
                  {place.description && (
                    <div>
                      <p className={`text-gray-600 text-sm ${!expandedDescriptions.includes(place.id) ? 'line-clamp-3' : ''}`}>
                        {place.description}
                      </p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-2"
                        onClick={() => toggleDescription(place.id)}
                      >
                        {expandedDescriptions.includes(place.id) ? (
                          <>
                            Ver menos
                            <ChevronUp className="ml-2 h-4 w-4" />
                          </>
                        ) : (
                          <>
                            Ver mais
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {place.address && (
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{place.address}</span>
                      </div>
                    )}

                    {place.owner_name && (
                      <div className="flex items-center gap-2 text-sm">
                        <User2 className="w-4 h-4 text-gray-500" />
                        <span>{place.owner_name}</span>
                      </div>
                    )}

                    {place.opening_hours && (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span>{place.opening_hours}</span>
                      </div>
                    )}

                    {place.entrance_fee && (
                      <div className="flex items-center gap-2 text-sm">
                        <Ticket className="w-4 h-4 text-gray-500" />
                        <span>{place.entrance_fee}</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t flex flex-wrap gap-3">
                    {place.phone && (
                      <a
                        href={`tel:${place.phone}`}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}

                    {place.whatsapp && (
                      <a
                        href={`https://wa.me/${place.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-green-600 hover:text-green-800"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </a>
                    )}

                    {place.website && (
                      <a
                        href={place.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
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
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
                          >
                            <Facebook className="w-4 h-4" />
                          </a>
                        )}
                        {(place.social_media as any).instagram && (
                          <a
                            href={(place.social_media as any).instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-800"
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
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                      >
                        <MapPin className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {!isLoading && (!places || places.length === 0) && (
              <p className="text-gray-500 col-span-full text-center py-8">
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
