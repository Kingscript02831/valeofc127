
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import SubNav from "@/components/SubNav";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, User, Clock, DollarSign, Phone, Globe, ExternalLink } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";

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
    } catch (error) {
      console.error("Error fetching places:", error);
    } finally {
      setLoading(false);
    }
  };

  const openGoogleMaps = (address: string) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <SubNav />
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Lugares</h1>
        
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Carregando lugares...</p>
          </div>
        ) : places.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Nenhum lugar cadastrado ainda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {places.map((place) => (
              <div
                key={place.id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              >
                {place.image && (
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-gray-800">{place.name}</h2>
                  
                  {place.description && (
                    <p className="text-gray-600">{place.description}</p>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-gray-700">{place.address}</p>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-purple-600 hover:text-purple-700"
                          onClick={() => openGoogleMaps(place.address)}
                        >
                          Ver no Google Maps
                          <ExternalLink className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>

                    {place.owner_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-5 h-5 text-purple-600" />
                        <p className="text-gray-700">{place.owner_name}</p>
                      </div>
                    )}

                    {place.opening_hours && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-purple-600" />
                        <p className="text-gray-700">{place.opening_hours}</p>
                      </div>
                    )}

                    {place.entrance_fee && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <p className="text-gray-700">{place.entrance_fee}</p>
                      </div>
                    )}

                    {(place.phone || place.whatsapp) && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-5 h-5 text-purple-600" />
                        <div>
                          {place.phone && <p className="text-gray-700">Tel: {place.phone}</p>}
                          {place.whatsapp && (
                            <a
                              href={`https://wa.me/${place.whatsapp.replace(/\D/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700"
                            >
                              WhatsApp: {place.whatsapp}
                            </a>
                          )}
                        </div>
                      </div>
                    )}

                    {(place.website || place.social_media) && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-5 h-5 text-purple-600" />
                        <div className="space-y-1">
                          {place.website && (
                            <a
                              href={place.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:text-purple-700 block"
                            >
                              Website
                              <ExternalLink className="w-4 h-4 ml-1 inline" />
                            </a>
                          )}
                          {place.social_media && typeof place.social_media === 'object' && (
                            <div className="flex gap-2">
                              {Object.entries(place.social_media).map(([platform, url]) => (
                                <a
                                  key={platform}
                                  href={url as string}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:text-purple-700 capitalize"
                                >
                                  {platform}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
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
