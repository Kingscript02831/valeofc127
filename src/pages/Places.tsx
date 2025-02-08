import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Globe, Clock, User, DollarSign, MessageCircle, Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Place = Database['public']['Tables']['places']['Row'];

const Places = () => {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Lugares | Vale Notícias";
    fetchPlaces();
  }, []);

  const fetchPlaces = async () => {
    try {
      const { data, error } = await supabase
        .from("places")
        .select("*")
        .order("name");

      if (error) throw error;

      setPlaces(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar lugares");
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = (mapsUrl: string) => {
    window.open(mapsUrl, '_blank');
  };

  const openWhatsApp = (whatsapp: string) => {
    const formattedNumber = whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${formattedNumber}`, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Lugares</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : places.length === 0 ? (
          <p className="text-gray-600 text-center py-12">Nenhum lugar cadastrado ainda.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div key={place.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {place.image && (
                  <div className="relative h-48">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold">{place.name}</h2>
                  
                  {place.description && (
                    <p className="text-gray-600">{place.description}</p>
                  )}

                  <div className="space-y-2">
                    {place.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">{place.address}</span>
                        {place.maps_url && (
                          <Button
                            variant="link"
                            onClick={() => openGoogleMaps(place.maps_url!)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            Ver no Maps
                          </Button>
                        )}
                      </div>
                    )}

                    {place.owner_name && (
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">{place.owner_name}</span>
                      </div>
                    )}

                    {place.opening_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">{place.opening_hours}</span>
                      </div>
                    )}

                    {place.entrance_fee && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-gray-500" />
                        <span className="text-gray-700">{place.entrance_fee}</span>
                      </div>
                    )}

                    {(place.phone || place.whatsapp) && (
                      <div className="flex flex-wrap items-center gap-4">
                        {place.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-gray-500" />
                            <a
                              href={`tel:${place.phone}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {place.phone}
                            </a>
                          </div>
                        )}
                        
                        {place.whatsapp && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openWhatsApp(place.whatsapp!)}
                            className="flex items-center gap-2"
                          >
                            <MessageCircle className="h-4 w-4" />
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    )}

                    {(place.website || place.social_media) && (
                      <div className="flex flex-wrap items-center gap-2 pt-2">
                        {place.website && (
                          <a
                            href={place.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                          >
                            <Globe className="h-4 w-4" />
                            Website
                          </a>
                        )}
                        
                        {place.social_media && typeof place.social_media === 'object' && (
                          <>
                            {(place.social_media as any).facebook && (
                              <a
                                href={(place.social_media as any).facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Facebook className="h-5 w-5" />
                              </a>
                            )}
                            {(place.social_media as any).instagram && (
                              <a
                                href={(place.social_media as any).instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-800"
                              >
                                <Instagram className="h-5 w-5" />
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Places;
